import { useSummonerSpells } from "./useSummonerSpell";
import { WithTooltip } from "../GameTooltip/GameTooltip.jsx";

// Иконка заклинания призывателя с подсказкой (название, перезарядка, описание)
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
    <WithTooltip
      label={spell.name}
      tooltip={{
        className: "spellTooltip",
        icon: (
          <img
            src={spell.iconUrl}
            alt=""
            width={28}
            height={28}
            className="gameTooltipIcon"
          />
        ),
        name: spell.name,
        kind: spell.cooldown ? `Перезарядка: ${spell.cooldown} с` : null,
        sections: [spell.description],
      }}
    >
      <img
        src={spell.iconUrl}
        alt={alt || spell.name}
        width={size}
        height={size}
        className={className}
        style={style}
        loading="lazy"
        {...props}
      />
    </WithTooltip>
  );
}
