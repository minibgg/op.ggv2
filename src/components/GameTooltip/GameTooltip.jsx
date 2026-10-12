import "./GameTooltip.css";
import { useEffect, useRef, useState } from "react";

const TOOLTIP_WIDTH = 260;
const MIN_SPACE_BELOW = 280;

// Всплывающая подсказка в едином стиле для рун, предметов и заклинаний: шапка
// (иконка, название, подзаголовок), ниже блоки через разделитель и пометка.
// Позиционируется от ближайшего предка с position: relative.
// above — открыть вверх; alignRight — прижать к правому краю якоря
export function GameTooltip({
  icon,
  name,
  kind,
  sections = [],
  note,
  above = false,
  alignRight = false,
  className = "",
}) {
  return (
    <div
      className={`gameTooltip ${above ? "above" : "below"}${alignRight ? " alignRight" : ""} ${className}`}
      role="tooltip"
    >
      <div className="gameTooltipHead">
        {icon}
        <div>
          <div className="gameTooltipName">{name}</div>
          {kind && <div className="gameTooltipKind">{kind}</div>}
        </div>
      </div>

      {sections.filter(Boolean).map((section, i) => (
        <div key={i} className="gameTooltipSection">
          {section}
        </div>
      ))}

      {note && <p className="gameTooltipNote">{note}</p>}
    </div>
  );
}

// Иконка с подсказкой GameTooltip (tooltip — её пропсы). Поведение одно на весь сайт:
// наведение мышью или фокус — показать; клик/тап — закрепить, повторный тап,
// тап мимо или Escape — закрыть. Клик не уходит наверх, поэтому внутри
// ссылки-карточки он не переводит на другую страницу.
// Если снизу мало места, подсказка открывается вверх, у правого края экрана — влево
export function WithTooltip({ tooltip, label, className = "", children }) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [place, setPlace] = useState({ above: false, alignRight: false });
  const ref = useRef(null);

  const show = () => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      setPlace({
        above: window.innerHeight - rect.bottom < MIN_SPACE_BELOW,
        alignRight: rect.left + TOOLTIP_WIDTH > window.innerWidth - 8,
      });
    }
    setOpen(true);
  };

  const hide = () => {
    setPinned(false);
    setOpen(false);
  };

  // Тап мимо закрывает закреплённую подсказку
  useEffect(() => {
    if (!pinned) return;
    const onPointerDown = (e) => {
      if (!ref.current?.contains(e.target)) {
        setPinned(false);
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [pinned]);

  const visible = open && tooltip;

  return (
    <span
      ref={ref}
      className={`tooltipTrigger${visible ? " open" : ""} ${className}`}
      onPointerEnter={(e) => {
        // На тач-экранах подсказку открывает только тап (onClick)
        if (e.pointerType === "mouse" && !pinned) show();
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse" && !pinned) setOpen(false);
      }}
      onBlur={(e) => {
        if (!pinned && !ref.current?.contains(e.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") hide();
      }}
    >
      <button
        type="button"
        className="tooltipButton"
        aria-label={label}
        aria-expanded={Boolean(visible)}
        onFocus={() => {
          if (!pinned) show();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (pinned) {
            hide();
          } else {
            setPinned(true);
            show();
          }
        }}
      >
        {children}
      </button>

      {visible && (
        <GameTooltip
          {...tooltip}
          above={place.above}
          alignRight={place.alignRight}
        />
      )}
    </span>
  );
}
