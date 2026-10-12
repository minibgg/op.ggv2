import "./RunesCell.css";
import { useEffect, useState } from "react";
import { getRunesMap } from "../../service";
import { WithTooltip } from "../GameTooltip/GameTooltip.jsx";

const HIDDEN_RUNES_NOTE =
  "Остальные руны Riot открывает только после окончания матча.";
const NO_RUNES = { perks: {}, styles: {} };

let runesMap = null;
let runesPromise = null;

// Справочник рун грузится один раз на всё приложение, как заклинания
function useRunes() {
  const [runes, setRunes] = useState(() => runesMap);

  useEffect(() => {
    if (runesMap) return;

    if (!runesPromise) {
      runesPromise = getRunesMap().then((map) => {
        // Пустой справочник (ошибка загрузки) не кешируем — попробуем ещё раз
        if (Object.keys(map.perks).length) runesMap = map;
        else runesPromise = null;
        return map;
      });
    }

    runesPromise.then((map) => setRunes(map));
  }, []);

  return runes;
}

function RuneIcon({ item, size }) {
  if (!item?.iconUrl) {
    return (
      <span
        className="runeIcon placeholder"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <img
      src={item.iconUrl}
      alt={item.name}
      width={size}
      height={size}
      className="runeIcon"
      loading="lazy"
    />
  );
}

// Что показать. Spectator v5 (активная игра) отдаёт из страницы рун только
// ключевую руну и обе ветки — тогда показываем ключевую и вторичную ветку.
// Сыгранные матчи (match-v5) дают всю страницу: 9 perkIds
function getRuneSlots(perks, runes) {
  const ids = perks.perkIds;
  const primary = runes.styles[perks.perkStyle];
  const secondary = runes.styles[perks.perkSubStyle];
  const kind = (...parts) => parts.filter(Boolean).join(" · ");

  if (ids.length < 9) {
    return {
      full: false,
      slots: [
        {
          key: ids[0],
          item: runes.perks[ids[0]],
          kind: kind(primary?.name, "ключевая руна"),
          note: HIDDEN_RUNES_NOTE,
        },
        {
          key: perks.perkSubStyle,
          item: secondary,
          kind: "Вторичная ветка",
          note: HIDDEN_RUNES_NOTE,
        },
      ],
    };
  }

  // perkIds: ключевая, 3 основные, 2 вторичные, 3 осколка
  return {
    full: true,
    slots: ids.slice(0, 9).map((id, i) => ({
      key: id,
      item: runes.perks[id],
      kind:
        i === 0
          ? kind(primary?.name, "ключевая руна")
          : i < 4
            ? kind(primary?.name, "основная ветка")
            : i < 6
              ? kind(secondary?.name, "вторичная ветка")
              : "Осколок",
    })),
  };
}

// Руны игрока. perks — в формате Spectator v5: { perkIds, perkStyle, perkSubStyle }.
// У каждой иконки своя подсказка с названием и описанием руны (WithTooltip).
// variant: "grid" — ключевая крупно, остальные двумя строками рядом (активная игра);
//          "inline" — всё одной строкой (нижняя полоса карточки в истории матчей)
export function RunesCell({ perks, variant = "grid" }) {
  const runes = useRunes() || NO_RUNES;

  if (!perks?.perkIds?.length) return <div className="runes" />;

  const { full, slots } = getRuneSlots(perks, runes);

  const icon = (i, size, className = "") => {
    const slot = slots[i];
    if (!slot) return null;
    return (
      <WithTooltip
        key={i}
        className={`runeButton ${className}`}
        label={slot.item?.name || "Руна"}
        tooltip={{
          className: "runeTooltip",
          icon: <RuneIcon item={slot.item} size={28} />,
          name: slot.item?.name || `Rune ${slot.key}`,
          kind: slot.kind,
          sections: [
            slot.item?.description && (
              <span className="runeDescText">{slot.item.description}</span>
            ),
          ],
          note: slot.note,
        }}
      >
        <RuneIcon item={slot.item} size={size} />
      </WithTooltip>
    );
  };

  const inline = variant === "inline";
  const big = inline ? 22 : 28;
  const small = inline ? 16 : 18;
  const shards = (
    <span className="runeShards">
      {[6, 7, 8].map((i) => icon(i, 12, "shard"))}
    </span>
  );

  let body;
  if (!full) {
    body = icon(1, small, "tree");
  } else if (inline) {
    body = (
      <>
        <span className="runeLine">{[1, 2, 3].map((i) => icon(i, small))}</span>
        <span className="runeLine">{[4, 5].map((i) => icon(i, small))}</span>
        {shards}
      </>
    );
  } else {
    body = (
      <div className="runeLines">
        <div className="runeLine">{[1, 2, 3].map((i) => icon(i, small))}</div>
        <div className="runeLine">
          {[4, 5].map((i) => icon(i, small))}
          {shards}
        </div>
      </div>
    );
  }

  return (
    <div className={`runes ${variant} ${full ? "full" : "compact"}`}>
      {icon(0, big, "keystone")}
      {body}
    </div>
  );
}
