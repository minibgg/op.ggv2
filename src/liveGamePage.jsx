import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

export default function LiveGamePage() {
  const { playerData } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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
}
