function MatchCard({ matchId, heroName, kills, deaths, assists, isWin }) {
    return (
        <div className="match-card">
            <div className="match-main">
                <div className="match-id">Match ID: {matchId}</div>
                <div className="match-hero">Hero: {heroName}</div>
            </div>
            <div className="match-side">
                <div className="match-kda">KDA: {kills}/{deaths}/{assists}</div>
                <span className={isWin ? "result-win" : "result-lose"}>
                    {isWin ? "Victory" : "Defeat"}
                </span>
            </div>
        </div>
    );
}

export default function MyApp(){
  return(
    <div>
      <MatchCard
        matchId={12345678}
        heroName="Naga-Siren"
        kills={123}
        deaths={123}
        assists={123}
        isWin={false}
      />
      <MatchCard
        matchId={87654321}
        heroName="Pudge"
        kills={321}
        deaths={321}
        assists={321}
        isWin={true}
      />
    </div>
  )
}
const API_KEY = import.meta.env.VITE_RIOT_KEY;

const gameName = "ADmidpermalose";
const tagLine = "01irl";
const puuid = `LApI665DukM67RKNy1FhbtkekyQnG_SK4sIcbGmd_v3IIjKFrXImEpTF_h9dEK6B4FkKRMNNYDUkXw`

const res = await fetch(
    `https://euw1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}?api_key=${API_KEY}`
);
const data = await res.json();
console.log(data);

const res1 = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/14.24.1/data/en_US/champion.json`
);
const data1 = await res1.json();
console.log(data1);