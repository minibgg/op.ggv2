import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PlayerCard from "./components/PlayerCard/PlayerCard";
import { getGameModeLabel, formatItemDescription } from "./service/Utils.js";

// --- Вспомогательные функции ---
function getWinStreak(matches, puuid) {
  let streak = 0;
  if (!matches) return 0;
  for (const match of matches) {
    const player = match.info?.participants?.find((p) => p.puuid === puuid);
    if (!player) break;
    if (player.win) streak++;
    else break;
  }
  return streak;
}

// --- Основной экран профиля ---
export default function ProfilePage() {
  const { playerData } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Определяем регион из URL (последняя часть строки после последнего дефиса)
  const currentRegion = playerData ? playerData.split("-").pop() : "EUW";

  useEffect(() => {
    async function fetchPlayerData(playerName) {
      try {
        setLoading(true);
        const res = await fetch(
          `https://opggv2-backend-production.up.railway.app/api/profile/${playerName}`,
        );
        if (!res.ok) throw new Error(`Ошибка загрузки для ${playerName}`);
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
        alert("Ошибка при загрузке профиля");
        navigate("/");
      } finally {
        setLoading(false);
      }
    }

    if (playerData) {
      fetchPlayerData(playerData);
    }
  }, [playerData, navigate]);

  if (loading)
    return (
      <div className="appShell" style={{ padding: "50px" }}>
        Загрузка...
      </div>
    );
  if (!data) return null;

  const soloQ = data.rank?.find((q) => q.queueType === "RANKED_SOLO_5x5");
  const rankedPremade = data.rank?.find(
    (q) => q.queueType === "RANKED_PREMADE_5x5",
  );
  const rankedflex = data.rank?.find((q) => q.queueType === "RANKED_FLEX_SR");

  const championsByKey = Object.values(data.champions || {}).reduce(
    (acc, c) => {
      acc[c.key] = c;
      return acc;
    },
    {},
  );

  return (
    <div style={{ padding: "20px" }}>
      <button
        className="searchbtn"
        onClick={() => navigate("/")}
        style={{ marginBottom: "20px" }}
      >
        ← Назад к поиску
      </button>

      <div style={{ display: "flex", alignItems: "flex-start", gap: "24px" }}>
        {/* Левая часть: Инфо и Мастерство */}
        <div style={{ minWidth: "320px" }}>
          <div className="baseInfoFrame">
            <h2 style={{ margin: 0 }}>
              {data.account?.gameName}#{data.account?.tagLine}
            </h2>
            <div>
              <strong>Уровень: </strong>
              {data.sumData?.summonerLevel}
            </div>
            <div>
              <strong>SoloQ rank: </strong>
              {soloQ
                ? `${soloQ.tier} ${soloQ.rank} (${soloQ.leaguePoints} LP)`
                : "Unranked"}
            </div>
            <div>
              <strong>Flex rank:</strong>
              {rankedflex
                ? `${rankedflex.tier} ${rankedflex.rank} (${rankedflex.leaguePoints} LP)`
                : "Unranked"}
            </div>
            <div>
              <strong>5x5 rank:</strong>
              {rankedPremade
                ? `${rankedPremade.tier} ${rankedPremade.rank} (${rankedPremade.leaguePoints} LP)`
                : "Unranked"}
            </div>

            {soloQ?.hotStreak && (
              <p className="warningStreak">
                WARNING win streak:{" "}
                {getWinStreak(data.matches, data.account?.puuid)}
              </p>
            )}

            {soloQ && (
              <div>
                <strong>SoloQ WR: </strong>
                {((soloQ.wins / (soloQ.wins + soloQ.losses)) * 100).toFixed(1)}%
                ({soloQ.wins}W / {soloQ.losses}L)
              </div>
            )}
          </div>

          <div style={{ marginTop: "20px" }}>
            <p
              style={{
                color: "var(--text-h)",
                marginBottom: "10px",
                paddingLeft: "24px",
              }}
            >
              Most played heroes:
            </p>
            {data.masteries?.map((m) => {
              const champ = championsByKey[String(m.championId)];
              return (
                <div
                  className="heroInfo"
                  key={m.championId}
                  style={{ marginLeft: "24px" }}
                >
                  {champ && (
                    <div className="mostPlayedHeroFrame">
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/${data.version}/img/champion/${champ.id}.png`}
                        width={72}
                        height={72}
                        alt={champ.name}
                        style={{ borderRadius: "4px", marginRight: "10px" }}
                      />
                      <div style={{ fontSize: "13px" }}>
                        <strong style={{ fontSize: "13px" }}>
                          {champ.name}
                        </strong>
                        <div>
                          Points:{" "}
                          <span style={{ color: "#bfbfbf" }}>
                            {m.championPoints?.toLocaleString()}
                          </span>{" "}
                          <br />
                          Last:{" "}
                          <span style={{ color: "#bfbfbf" }}>
                            {new Date(m.lastPlayTime).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Правая часть: История матчей */}
        <div style={{ flexGrow: 1 }}>
          {data.matches?.map((match) => {
            const currentPlayer = match.info?.participants?.find(
              (p) => p.puuid === data.account?.puuid,
            );
            const isWin = match.info?.teams?.find(
              (t) => t.teamId === currentPlayer?.teamId,
            )?.win;

            return (
              <div
                key={match.metadata?.matchId}
                className={`teamframe ${isWin ? "win" : "lose"}`}
                style={{ marginBottom: "10px" }}
              >
                <div className="matchInfo">
                  <p className="gameInfo" style={{ marginRight: "10px" }}>
                    {new Date(
                      match.info?.gameEndTimestamp,
                    ).toLocaleDateString()}
                  </p>
                  <p className="gameInfo" style={{ marginRight: "10px" }}>
                    {getGameModeLabel(
                      match.info?.queueId,
                      match.info?.gameMode,
                    )}
                  </p>
                  <p className="gameInfo">
                    {Math.floor((match.info?.gameDuration || 0) / 60)}:
                    {String((match.info?.gameDuration || 0) % 60).padStart(
                      2,
                      "0",
                    )}
                  </p>
                </div>

                <div className="matchTeams">
                  <div className="team">
                    {match.info?.participants
                      ?.filter((p) => p.teamId === 100)
                      .map((p) => (
                        <PlayerCard
                          items={data.items}
                          key={p.puuid}
                          p={p}
                          version={data.version}
                          currentRegion={currentRegion}
                        />
                      ))}
                  </div>
                  <div className="team">
                    {match.info?.participants
                      ?.filter((p) => p.teamId === 200)
                      .map((p) => (
                        <PlayerCard
                          items={data.items}
                          key={p.puuid}
                          p={p}
                          version={data.version}
                          currentRegion={currentRegion}
                        />
                      ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
