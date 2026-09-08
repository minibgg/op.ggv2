import { useSummonerSpells } from "./useSummonerSpell";

export function SummonerSpellIcon({
  spellId,
  size = 19,
  className = "",
  style = {},
  alt,
  ...props
}) {
  const spells = useSummonerSpells();
  const spell = spells?.[Number(spellId)];

  if (!spell?.iconUrl) {
    return (
      <span
        style={{
          width: size,
          height: size,
          display: "inline-block",
          borderRadius: "4px",
          background: "var(--accent-bg)",
          ...style,
        }}
        className={className}
      />
    );
  }

  return (
    <img
      src={spell.iconUrl}
      alt={alt || spell.name}
      title={spell.name}
      width={size}
      height={size}
      className={className}
      style={style}
      {...props}
    />
  );
}
