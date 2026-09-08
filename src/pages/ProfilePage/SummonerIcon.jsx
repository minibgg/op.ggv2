export function SummonerIcon({
  iconId,
  size = 24,
  version = "14.24.1",
  className = "",
  ...props
}) {
  if (!iconId && iconId !== 0) return null;

  return (
    <img
      src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${iconId}.png`}
      alt="Summoner Icon"
      width={size}
      height={size}
      className={className}
      {...props}
    />
  );
}
