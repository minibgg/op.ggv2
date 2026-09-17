import "./ProfilePage.css";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TeamsRender } from "../../components";
import {
  getFormattedName,
  getRankColor,
  saveRecentSearch,
} from "../../service";
import { useRankTheme } from "../../context/RankThemeContext";
import { BaseInfoFrame } from "./BaseInfoFrame.jsx";
import { usePlayerData } from "./usePlayerData.jsx";

export default function ProfilePage() {
  const { playerData } = useParams();
  const navigate = useNavigate();
  const { currentRegion, formattedPlayerName } = getFormattedName(playerData);
  const { setRankColor } = useRankTheme();

  const { data, loading, refreshing, error, refresh } =
    usePlayerData(playerData);

  useEffect(() => {
    const soloQ = data?.rank?.find((q) => q.queueType === "RANKED_SOLO_5x5");
    const hasSoloQ = Boolean(
      soloQ?.tier && soloQ.tier.toUpperCase() !== "UNRANKED",
    );
    if (hasSoloQ) {
      setRankColor(getRankColor(soloQ.tier));
    } else {
      setRankColor(null);
    }
    return () => setRankColor(null);
  }, [data, setRankColor]);

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
          <BaseInfoFrame
            data={data}
            soloQ={soloQ}
            rankedflex={rankedflex}
            rankedPremade={rankedPremade}
          />

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
