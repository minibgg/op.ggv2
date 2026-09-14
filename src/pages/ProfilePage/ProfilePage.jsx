import "./ProfilePage.css";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TeamsRender } from "../../components";
import {
  getFormattedName,
  getWinStreak,
  saveRecentSearch,
} from "../../service";
import { SummonerIcon } from "./SummonerIcon.jsx";
import { usePlayerData } from "./usePlayerData.jsx";

export default function ProfilePage() {
  const { playerData } = useParams();
  const navigate = useNavigate();
  const { currentRegion, formattedPlayerName } = getFormattedName(playerData);

  const { data, loading, refreshing, error, refresh } =
    usePlayerData(playerData);

  useEffect(() => {
    if (error) {
      console.error(error);
      if (!data) {
        alert("Ошибка при загрузке профиля");
        navigate("/");
      } else {
        alert("Не удалось обновить данные профиля");
      }
    }
  }, [error, data, navigate]);

  useEffect(() => {
    if (data) {
      document.title = `op.ggv2: ${formattedPlayerName}`;
    }
  }, [data, formattedPlayerName]);

  useEffect(() => {
    if (data?.account) {
      saveRecentSearch({
        name: `${data.account.gameName}#${data.account.tagLine}`,
        region: currentRegion,
        playerData,
        profileIconId: data.sumData?.profileIconId,
        version: data.version,
      });
    }
  }, [data, currentRegion, playerData]);

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

      <button
        className="searchbtn"
        onClick={() => navigate(`/liveGame/${encodeURIComponent(playerData)}`)}
        style={{ marginLeft: "10px", marginBottom: "20px" }}
      >
        Активная игра
      </button>

      <button
        className="searchbtn refreshBtn"
        onClick={refresh}
        disabled={refreshing}
        style={{ marginLeft: "10px", marginBottom: "20px" }}
        title="Сбросить кеш и запросить свежие данные"
      >
        <span className={refreshing ? "spinIcon" : ""}></span>{" "}
        {refreshing ? "Обновление..." : "Обновить"}
      </button>

      {data.lastUpdated && (
        <span
          style={{
            marginLeft: "12px",
            fontSize: "14px",
            color: "var(--text)",
            opacity: 0.8,
            verticalAlign: "middle",
          }}
        >
          Обновлено:{" "}
          {new Date(data.lastUpdated).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", gap: "24px" }}>
        {/* Левая часть: Инфо и Мастерство */}
        <div style={{ minWidth: "320px" }}>
          <div className="baseInfoFrame">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {data.sumData?.profileIconId && (
                <SummonerIcon
                  iconId={data.sumData.profileIconId}
                  size={50}
                  version={data.version}
                  style={{
                    borderRadius: "8px",
                    border: "2px solid var(--accent-border)",
                    boxShadow: "0 0 10px var(--accent-shadow)",
                    flexShrink: 0,
                  }}
                />
              )}
              <h2 style={{ margin: 0 }}>
                {data.account?.gameName}#{data.account?.tagLine}
              </h2>
            </div>
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
                        loading="lazy"
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
        <TeamsRender data={data} currentRegion={currentRegion}></TeamsRender>
      </div>
    </div>
  );
}
