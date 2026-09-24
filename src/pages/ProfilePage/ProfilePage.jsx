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

  if (loading) return <div className="appShell">Загрузка...</div>;
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
    <div>
      <div className="profileHeaderActions">
        <button className="searchbtn" onClick={() => navigate("/")}>
          ← Назад к поиску
        </button>

        <button
          className="searchbtn"
          onClick={() =>
            navigate(`/liveGame/${encodeURIComponent(playerData)}`)
          }
        >
          Активная игра
        </button>

        <button
          className="searchbtn refreshBtn"
          onClick={refresh}
          disabled={refreshing}
          title="Сбросить кеш и запросить свежие данные"
        >
          <span className={refreshing ? "spinIcon" : ""}></span>{" "}
          {refreshing ? "Обновление..." : "Обновить"}
        </button>

        {data.lastUpdated && (
          <span className="updateTimer">
            Обновлено:{" "}
            {new Date(data.lastUpdated).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      <div className="profileLayout">
        {/* Левая часть: Инфо и Мастерство */}
        <div>
          <BaseInfoFrame
            data={data}
            soloQ={soloQ}
            rankedflex={rankedflex}
            rankedPremade={rankedPremade}
            playerData={playerData}
            currentRegion={currentRegion}
          />

          <div>
            <p className="masteryTitle">Most played heroes:</p>
            {data.masteries?.map((m) => {
              const champ = championsByKey[String(m.championId)];
              return (
                <div className="heroInfo" key={m.championId}>
                  {champ && (
                    <div className="mostPlayedHeroFrame">
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/${data.version}/img/champion/${champ.id}.png`}
                        width={72}
                        height={72}
                        alt={champ.name}
                        loading="lazy"
                      />
                      <div>
                        <strong>{champ.name}</strong>
                        <div>
                          Points:{" "}
                          <span className="masteryInfo">
                            {m.championPoints?.toLocaleString()}
                          </span>{" "}
                          <br />
                          Last:{" "}
                          <span className="masteryInfo">
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
