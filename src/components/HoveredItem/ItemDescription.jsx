import { useState } from "react";

export default function PlayerItems({ p, version, items }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState("bottom");

  const itemIds = [
    p.item0,
    p.item1,
    p.item2,
    p.item3,
    p.item4,
    p.item5,
    p.item6,
  ];

  return (
    <div className="playerCardItems">
      {itemIds.map((id, index) => (
        <div
          key={index}
          className="itemWrapper"
          style={{ position: "relative", display: "inline-block" }}
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;

            setTooltipPosition(spaceBelow < 180 ? "top" : "bottom");
            setHoveredIndex(index);
          }}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {id !== 0 ? (
            <>
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${id}.png`}
                width={20}
                height={20}
                alt={items?.[String(id)]?.name || "item"}
              />

              {hoveredIndex === index && items?.[String(id)] && (
                <div
                  className={`itemTooltip ${tooltipPosition === "top" ? "itemTooltipTop" : "itemTooltipBottom"}`}
                >
                  <div style={{ color: "violet" }}>
                    {items[String(id)].name}
                  </div>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: items[String(id)].description || "",
                    }}
                  />
                  <div style={{ color: "#d4af37" }}>
                    {items[String(id)].gold?.total} gold
                  </div>
                </div>
              )}
            </>
          ) : (
            <div
              style={{
                width: 20,
                height: 20,
                background: "rgba(0,0,0,0.1)",
                borderRadius: "2px",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
