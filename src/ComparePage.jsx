import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { riotApi, regionToCluster } from "./riotApi";
import "./ComparePage.css";

async function loadPlayer(playerString) {
  const parts = decodeURIComponent(playerString).split("-");
  const regionKey = parts.pop();
  const tagLine = parts.pop();
  const gameName = parts.join("-").replace(/_/g, " ");

  const { cluster, region: regionUrl } = regionToCluster[regionKey];

  const account = await riotApi.getPuuidByNameTag(gameName, tagLine, cluster);
  const version = await riotApi.getVersion();

  const [sumData, rank, matchIds, masteries, champions] = await Promise.all([
    riotApi.getSummonerLevel(account.puuid, regionUrl),
    riotApi.getRank(account.puuid, regionUrl),
    riotApi.getRecentMatch(account.puuid, cluster),
    riotApi.getChampMasteries(account.puuid, regionUrl),
    riotApi.getChampions(version),
  ]);

  const matches = await Promise.all(
    matchIds.slice(0, 5).map((id) => riotApi.getMatchInfo(id, cluster)),
  );

  return { account, sumData, rank, matches, masteries, champions, version };
}

function PlayerColumn({ data }) {
  if (!data) return <div>Загрузка...</div>;

  const soloQ = data.rank.find((q) => q.queueType === "RANKED_SOLO_5x5");
  const wr = soloQ
    ? ((soloQ.wins / (soloQ.wins + soloQ.losses)) * 100).toFixed(1)
    : null;

  return (
    <div style={{ flex: 1 }}>
      <div className="baseInfoFrame">
        <h2 style={{ margin: 0 }}>
          {data.account.gameName}#{data.account.tagLine}
        </h2>
        <div>
          <strong>Уровень: </strong>
          {data.sumData.summonerLevel}
        </div>
        <div>
          <strong>Ранг: </strong>
          {soloQ
            ? `${soloQ.tier} ${soloQ.rank} (${soloQ.leaguePoints} LP)`
            : "Unranked"}
        </div>
        {wr && (
          <div>
            <strong>WR: </strong>
            {wr}% ({soloQ.wins}W / {soloQ.losses}L)
          </div>
        )}
      </div>

      <div style={{ marginTop: "16px", paddingLeft: "24px" }}>
        <p style={{ color: "var(--text-h)", marginBottom: "8px" }}>
          Most played:
        </p>
        {data.masteries.map((m) => {
          const champ = Object.values(data.champions).find(
            (c) => c.key === String(m.championId),
          );
          if (!champ) return null;
          return (
            <div className="heroInfo" key={m.championId}>
              <div className="mostPlayedHeroFrame">
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/${data.version}/img/champion/${champ.id}.png`}
                  width={48}
                  height={48}
                  style={{ borderRadius: "4px", marginRight: "8px" }}
                />
                <div style={{ fontSize: "13px" }}>
                  <strong>{champ.name}</strong>
                  <div>{m.championPoints.toLocaleString()} pts</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ComparePage() {
  const { players } = useParams();
  const navigate = useNavigate();
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [p1string, p2string] = decodeURIComponent(players).split("==");
        const [p1, p2] = await Promise.all([
          loadPlayer(p1string),
          loadPlayer(p2string),
        ]);
        setPlayer1(p1);
        setPlayer2(p2);
      } catch (err) {
        console.error(err);
        alert("Ошибка при загрузке");
        navigate("/");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [players, navigate]);

  if (loading) return <div style={{ padding: "50px" }}>Загрузка...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <button
        className="searchbtn"
        onClick={() => navigate("/")}
        style={{ marginBottom: "20px" }}
      >
        ← Назад
      </button>
      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
        <PlayerColumn data={player1} />
        <PlayerColumn data={player2} />
      </div>
    </div>
  );
}
//test
//MishaCrazy#RU1
//СРУ МЯСОМ#RUNIT
//ADmidpermalose#01irl
