export function ChampionIcon({
  championId,
  name,
  version,
  size = 48,
  ...props
}) {
  const src = championId
    ? `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${championId}.png`
    : `https://ddragon.leagueoflegends.com/cdn/${version || "14.24.1"}/img/champion/${name}.png`;

  return (
    <img
      src={src}
      alt={name || `Champion ${championId || ""}`}
      width={size}
      height={size}
      loading="lazy"
      {...props}
    />
  );
}
