import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getLiveGame,
  getGameModeLabel,
  getFormattedName,
  ChampionIcon,
} from "../service";
import "./LiveGamePage.css";

export default function LiveGamePage() {
  const { playerData } = useParams();
  const navigate = useNavigate();
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentRegion, playerName, formattedPlayerName } =
    getFormattedName(playerData);

  useEffect(() => {
    if (formattedPlayerName) {
      document.title = `op.ggv2: ${formattedPlayerName}`;
    }
  }, [formattedPlayerName]);

  useEffect(() => {
    if (!playerData) {
      setLoading(false);
      return;
    }

    async function fetchLiveGame(name) {
      try {
        setLoading(true);
        const result = await getLiveGame(name);
        setLiveData(result);
      } catch (err) {
        console.error("Ошибка при получении Live Game:", err);
        setLiveData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchLiveGame(playerData);
  }, [playerData]);

  function RenderUser(props) {
    const { player } = props;

    return (
      <div
        className="liveGamePlayer"
        style={{ display: "flex", alignItems: "center", gap: "8px" }}
      >
        <ChampionIcon
          championId={player.championId}
          width={36}
          height={36}
          style={{ borderRadius: "6px" }}
          alt={player.riotId || "Champion"}
        />
        <span>{player.riotId || player.summonerName}</span>
      </div>
    );
  }

  function RenderLiveGame(props) {
    return props.liveData.participants.map((player) => {
      return (
        <div key={player.puuid || player.summonerId}>
          <RenderUser player={player} />
        </div>
      );
    });
  }
  if (loading) {
    return (
      <div className="liveGameContainer">
        <h2>Загрузка текущей игры...</h2>
      </div>
    );
  }

  if (!liveData) {
    return (
      <div className="liveGameContainer">
        <h2>Игрок сейчас не находится в матче</h2>
        <button onClick={() => navigate(-1)}>Вернуться в профиль</button>
      </div>
    );
  }

  return (
    <div className="liveGameContainer">
      <h1>
        Текущий матч (
        {getGameModeLabel(liveData.gameQueueConfigId, liveData.gameMode)})
      </h1>
      <p>Длительность: {Math.floor(liveData.gameLength / 60)} мин.</p>

      <button
        className="searchbtn"
        onClick={() => navigate(`/profile/${encodeURIComponent(playerData)}`)}
        style={{ marginBottom: "20px" }}
      >
        ← Вернуться в профиль
      </button>
      <RenderLiveGame liveData={liveData}></RenderLiveGame>
    </div>
  );
}
