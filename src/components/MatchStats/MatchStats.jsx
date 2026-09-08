import React, { useMemo } from "react";
import "./MatchStats.css";

export function MatchStats({ data }) {
  const matches = data?.matches || [];
  const puuid = data?.account?.puuid;

  const stats = useMemo(() => {
    let totalWins = 0;
    let totalLosses = 0;
    let totalKills = 0;
    let totalDeaths = 0;
    let totalAssists = 0;
    let totalKp = 0;
    let matchCount = 0;

    for (const match of matches) {
      if (!match?.info?.participants) continue;
      const player = match.info.participants.find((part) => part.puuid === puuid);
      if (!player) continue;

      matchCount++;

      const isWin =
        player.win ??
        match.info.teams?.find((t) => t.teamId === player.teamId)?.win ??
        false;

      if (isWin) {
        totalWins++;
      } else {
        totalLosses++;
      }

      totalKills += player.kills || 0;
      totalDeaths += player.deaths || 0;
      totalAssists += player.assists || 0;

      // Kill Participation: challenges.killParticipation or calculate from team kills
      if (player.challenges?.killParticipation != null) {
        const rawKp = player.challenges.killParticipation;
        totalKp += rawKp <= 1 ? rawKp * 100 : rawKp;
      } else {
        const teamParticipants = match.info.participants.filter(
          (part) => part.teamId === player.teamId,
        );
        const teamKills = teamParticipants.reduce(
          (sum, part) => sum + (part.kills || 0),
          0,
        );
        const kpVal =
          teamKills > 0
            ? (((player.kills || 0) + (player.assists || 0)) / teamKills) * 100
            : 0;
        totalKp += kpVal;
      }
    }

    const winRate =
      matchCount > 0 ? Math.round((totalWins / matchCount) * 100) : 0;
    const avgKills =
      matchCount > 0 ? (totalKills / matchCount).toFixed(1) : "0.0";
    const avgDeaths =
      matchCount > 0 ? (totalDeaths / matchCount).toFixed(1) : "0.0";
    const avgAssists =
      matchCount > 0 ? (totalAssists / matchCount).toFixed(1) : "0.0";

    const kdaRatio =
      matchCount === 0
        ? "0.00 : 1"
        : totalDeaths === 0
          ? "Perfect"
          : `${((totalKills + totalAssists) / totalDeaths).toFixed(2)} : 1`;

    const avgKp = matchCount > 0 ? Math.round(totalKp / matchCount) : 0;

    return {
      matchCount,
      totalWins,
      totalLosses,
      winRate,
      avgKills,
      avgDeaths,
      avgAssists,
      kdaRatio,
      avgKp,
    };
  }, [matches, puuid]);

  if (!matches || matches.length === 0 || stats.matchCount === 0) {
    return null;
  }

  const radius = 32;
  const circumference = 2 * Math.PI * radius; // ~201.062
  const winStroke = (stats.winRate / 100) * circumference;

  return (
    <div className="matchStatsCard">
      <div className="matchStatsLeft">
        <div className="matchStatsHeader">
          {stats.matchCount}И {stats.totalWins}В {stats.totalLosses}П
        </div>
        <div className="matchStatsDonut">
          <svg width="88" height="88" viewBox="0 0 88 88">
            {/* Base circle: if 100% wins -> win-accent, otherwise lose-accent */}
            <circle
              cx="44"
              cy="44"
              r={radius}
              fill="none"
              stroke={stats.winRate === 100 ? "var(--win-accent, #22c55e)" : "var(--lose-accent, #ef4444)"}
              strokeWidth="11"
            />
            {/* Arc for wins starting from 12 o'clock clockwise */}
            {stats.winRate > 0 && stats.winRate < 100 && (
              <circle
                cx="44"
                cy="44"
                r={radius}
                fill="none"
                stroke="var(--win-accent, #22c55e)"
                strokeWidth="11"
                strokeDasharray={`${winStroke} ${circumference}`}
                strokeDashoffset="0"
                strokeLinecap="butt"
                transform="rotate(-90 44 44)"
              />
            )}
            <text
              x="44"
              y="44"
              textAnchor="middle"
              dominantBaseline="central"
              className="donutWinrateText"
            >
              {stats.winRate}%
            </text>
          </svg>
        </div>
      </div>

      <div className="matchStatsRight">
        <div className="matchStatsKdaNumbers">
          <span className="matchStatsKdaVal">{stats.avgKills}</span>
          <span className="matchStatsSlash"> / </span>
          <span className="matchStatsDeaths">{stats.avgDeaths}</span>
          <span className="matchStatsSlash"> / </span>
          <span className="matchStatsKdaVal">{stats.avgAssists}</span>
        </div>
        <div className="matchStatsKdaRatio">{stats.kdaRatio}</div>
        <div className="matchStatsKp">Уч. в уб. {stats.avgKp}%</div>
      </div>
    </div>
  );
}

export default MatchStats;
