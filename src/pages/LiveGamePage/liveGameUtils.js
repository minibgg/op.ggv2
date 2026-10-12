import { riotApi } from "../../service";

const ROLES = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];
const SUMMONERS_RIFT = 11;
const SMITE = 11;

let positionsCache = null;

// Позиции чемпионов на Ущелье по рекомендациям рун CommunityDragon:
// { [championId]: { main: "MIDDLE", all: Set(["MIDDLE", "TOP"]) } }
export async function getChampionPositions() {
  if (positionsCache) return positionsCache;
  try {
    const data = await riotApi.getHeroRune();
    const map = {};
    for (const item of data || []) {
      const recs = (item.runeRecommendations || []).filter(
        (r) => r.mapId === SUMMONERS_RIFT && ROLES.includes(r.position),
      );
      if (!recs.length) continue;
      map[item.championId] = {
        main: recs.find((r) => r.isDefaultPosition)?.position,
        all: new Set(recs.map((r) => r.position)),
      };
    }
    positionsCache = map;
    return map;
  } catch {
    return {};
  }
}

// Насколько игрок подходит на роль: Smite — почти наверняка лесник,
// дальше основная позиция чемпиона, потом любая из его позиций
function roleScore(player, role, positions) {
  if (player.spell1Id === SMITE || player.spell2Id === SMITE) {
    return role === "JUNGLE" ? 10 : 0;
  }
  const pos = positions[player.championId];
  if (pos?.main === role) return 3;
  if (pos?.all.has(role)) return 1;
  return 0;
}

function permutations(list) {
  if (list.length <= 1) return [list];
  return list.flatMap((item, i) =>
    permutations([...list.slice(0, i), ...list.slice(i + 1)]).map((rest) => [
      item,
      ...rest,
    ]),
  );
}

// Ставит пятерых игроков в порядке TOP → SUPPORT так, чтобы роли в сумме
// лучше всего совпали с чемпионами. У каждого игрока своя роль, поэтому
// строки синих и красных стоят друг напротив друга (вариантов всего 5! = 120)
function arrangeByRoles(team, positions) {
  let best = team;
  let bestScore = -1;
  for (const order of permutations(team)) {
    const score = order.reduce(
      (sum, player, i) => sum + roleScore(player, ROLES[i], positions),
      0,
    );
    if (score > bestScore) {
      best = order;
      bestScore = score;
    }
  }
  return best;
}

// Роли имеют смысл только на Ущелье 5×5; в остальных режимах — порядок Riot
export function splitTeams(game, positions) {
  const participants = game?.participants || [];
  const isRift = game?.mapId === SUMMONERS_RIFT;
  const team = (teamId) => {
    const players = participants.filter((p) => p.teamId === teamId);
    return isRift && players.length === ROLES.length
      ? arrangeByRoles(players, positions)
      : players;
  };

  return {
    blue: team(100),
    red: team(200),
    others: participants.filter((p) => p.teamId !== 100 && p.teamId !== 200),
  };
}

// Баны команды по порядку; championId -1 — пропущенный бан
export function getTeamBans(game, teamId) {
  return (game?.bannedChampions || [])
    .filter((ban) => ban.teamId === teamId)
    .sort((a, b) => a.pickTurn - b.pickTurn);
}

// "Name#TAG" → { name, tag }
export function splitRiotId(riotId = "") {
  const i = riotId.lastIndexOf("#");
  return i === -1
    ? { name: riotId, tag: "" }
    : { name: riotId.slice(0, i), tag: riotId.slice(i + 1) };
}

export function getProfilePath({ name, tag }, region) {
  const formattedName = `${name}-${tag}`.replace(/\s/g, "_");
  return `/profile/${encodeURIComponent(formattedName)}-${region}`;
}

// Секунды → "mm:ss", после часа → "h:mm:ss"
export function formatElapsed(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`;
}
