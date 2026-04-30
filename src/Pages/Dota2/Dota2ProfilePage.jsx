import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { dotaApi } from "./Components/DotaApi";

export default function ProfilePage() {
  const { accountId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    //только для fetch
    async function loadProfile() {
      try {
        const [accountInfo, accountWL, recentMatch] = await Promise.all([
          dotaApi.getAccountInfo(accountId),
          dotaApi.getWinLose(accountId),
          dotaApi.getRecentMatches(accountId),
        ]);
        const recentMatchData = recentMatch.slice(0, 10).map((m) => m.match_id);

        const allMatchesInfo = await Promise.all(
          recentMatchData.forEach((games) => {
            const gameInfo = dotaApi.getMatchInfo(games);
          }),
        );
        setData({
          accountInfo,
          accountWL,
          recentMatch,
          allMatchesInfo,
        });
      } catch (error) {
        console.log(`ошибка: ${error}`);
      }
    }
    loadProfile();
  }, [accountId]);

  if (!data) {
    return <div>Loading Profile Info</div>;
  }

  //НАЧАЛО ОСНОВНОГО КОДА

  const winRate =
    (
      (data.accountWL.win / (data.accountWL.win + data.accountWL.lose)) *
      100
    ).toFixed(1) + "%";

  console.log(`информация об аккаунте: ${data.accountInfo}`);
  console.log(`победы поражения: ${data.accountWL}`);
  console.log(`ID последних игр:${data.recentMatch}`);

  //RETURN
  return (
    <main>
      <div className="mainInfo">
        <div>Steam name:{data.accountInfo.profile.personaname}</div>
        <div className="accountStatistics">
          <div>
            WinRate: {winRate} ({data.accountWL.win} / {data.accountWL.lose})
          </div>
        </div>
      </div>
    </main>
  );
}
