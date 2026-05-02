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
        const [accountInfo, accountWL, recentMatches, heroes, items] =
          await Promise.all([
            dotaApi.getAccountInfo(accountId),
            dotaApi.getWinLose(accountId),
            dotaApi.getRecentMatches(accountId),
            dotaApi.getHeroes(),
            dotaApi.getItems(),
          ]);
        const matchPromises = recentMatches
          .slice(0, 10)
          .map((match) => dotaApi.getMatchInfo(match.match_id));
        const matchData = await Promise.all(matchPromises);
        setData({
          accountInfo,
          accountWL,
          recentMatches,
          matchData,
          heroes,
          items,
        });
      } catch (error) {
        console.log(`ошибка загрузки данных`);
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

  function PlayerCard({ match, allHeroes }) {
    const player = match.players.find((p) => p.account_id == accountId);
    const hero = allHeroes.find((h) => h.id === player.hero_id);
    const heroName = hero ? hero.localized_name : "unknown";
    const team = player.isRadiant ? "radiant" : "Dire";
    const kda = `${player.kills} / ${player.deaths} / ${player.assists} `;
    const GPM = player.gold_per_min;
    const CS = player.last_hits;
    if (player.isRadiant && player.radiant_win) {
      return (matchResult = "WIN");
    } else {
      return (matchResult = "LOSE");
    }

    return (
      <div className="teamBorder">
        <div
          style={{
            border: "2px solid violet",
            margin: "10px",
            padding: "5px",
          }}
        >
          {heroName} - {team} ({kda})
          <div>
            GPM: {GPM}
            <span style={{ padding: "10px" }}>CS: {CS}</span>
            <span>{matchResult}</span>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="matchInfo">
          <div className="matchTeams">
            <p>Last 10 games: </p>
            <div className="teamCard">
              {data.matchData.map((match) => (
                <PlayerCard
                  key={match.match_id}
                  match={match}
                  allHeroes={data.heroes}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
