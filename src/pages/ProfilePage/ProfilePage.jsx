import "./ProfilePage.css";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ErrorMessage,
  LoadStatus,
  TeamsRender,
  WakeUpNotice,
} from "../../components";
import {
  getFormattedName,
  getRankColor,
  saveRecentSearch,
} from "../../service";
import { useRankTheme } from "../../context/RankThemeContext";
import { BaseInfoFrame } from "./BaseInfoFrame.jsx";
import { ProfileSkeleton } from "./ProfileSkeleton.jsx";
import { usePlayerData } from "./usePlayerData.jsx";

export default function ProfilePage() {
  const { playerData } = useParams();
  const navigate = useNavigate();
  const { currentRegion, formattedPlayerName } = getFormattedName(playerData);
  const { setRankColor } = useRankTheme();

  const {
    data,
    loading,
    refreshing,
    error,
    progress,
    startedAt,
    refresh,
    retry,
  } = usePlayerData(playerData);

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

  // Загрузка и её ошибка: панель статуса с шагами, ниже скелетон профиля.
  // Кнопок шапки нет, пока профиль не загрузится
  if (loading || (error && !data)) {
    const { step, matchesLoaded, matchesTotal } = progress;
    return (
      <div className="profileLoading">
        <LoadStatus
          title={error ? "Couldn't load the profile" : "Loading profile"}
          subtitle={formattedPlayerName}
          steps={[
            "Finding account",
            "Loading rank & match history",
            step === 2
              ? `Loading match details (${matchesLoaded}/${matchesTotal})`
              : "Loading match details",
          ]}
          current={step}
          error={error}
          wakeUpSince={step === 0 ? startedAt : null}
          onRetry={retry}
          back={{ label: "Back to search", onClick: () => navigate("/") }}
        />
        {!error && <ProfileSkeleton />}
      </div>
    );
  }
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
      {error && <ErrorMessage error={error} onRetry={refresh} />}
      <div className="profileHeaderActions">
        <button className="searchbtn" onClick={() => navigate("/")}>
          ← Back to search
        </button>

        <button
          className="searchbtn"
          onClick={() =>
            navigate(`/liveGame/${encodeURIComponent(playerData)}`)
          }
        >
          Live Game
        </button>

        <button
          className="searchbtn refreshBtn"
          onClick={refresh}
          disabled={refreshing}
          title="Clear the cache and fetch fresh data"
        >
          <span className={refreshing ? "spinIcon" : ""}></span>{" "}
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>

        <WakeUpNotice since={refreshing ? startedAt : null} compact />

        {data.lastUpdated && (
          <span className="updateTimer">
            Updated:{" "}
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
