import { MatchStats } from "../MatchStats/MatchStats.jsx";
import { MatchCard } from "../MatchCard/MatchCard.jsx";

// История матчей Searched player: сводка по последним играм
// и по одной карточке MatchCard на матч
export function TeamsRender({ data, currentRegion }) {
  return (
    <div style={{ flexGrow: 1 }}>
      <MatchStats data={data} />
      {data.matches?.map((match) => (
        <MatchCard
          key={match.metadata?.matchId}
          match={match}
          puuid={data.account?.puuid}
          version={data.version}
          items={data.items}
          champions={data.champions}
          currentRegion={currentRegion}
        />
      ))}
    </div>
  );
}
