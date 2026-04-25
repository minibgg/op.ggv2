import { useState } from "react";
import { Link } from "react-router-dom";
import { formatItemDescription } from "../HoveredItem/ItemDescription";
import "./PlayerCard.css";

export default function PlayerCard({ p, version, currentRegion, items }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState("bottom");
  const name = p.riotIdGameName;
  const tag = p.riotIdTagline;

  const formattedName = `${name}-${tag}`.replace(/\s/g, "_");
  const profilePath = `/profile/${encodeURIComponent(formattedName)}-${currentRegion}`;

  return (
    <Link
      to={profilePath}
      className="playerMatchCard"
      style={{ textDecoration: "none", cursor: "pointer" }}
    >
      <img
        className="playerCardChampion"
        src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${p.championName}.png`}
        width={48}
        height={48}
        alt={p.championName}
      />
      <div className="playerCardMain">
        <p className="playerCardName">{p.riotIdGameName || p.summonerName}</p>
        <p className="playerCardScore">
          {p.kills}/{p.deaths}/{p.assists}
        </p>
        <div className="playerCardItems">
          {[p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6].map(
            (id, index) => (
              <div
                key={index}
                className="itemWrapper"
                style={{ position: "relative", display: "inline-block" }}
                onMouseEnter={(e) => {
                  const itemData = items?.[String(id)] || null;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const spaceBelow = window.innerHeight - rect.bottom;

                  setTooltipPosition(spaceBelow < 180 ? "top" : "bottom");
                  setHoveredItem(itemData);
                }}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {id !== 0 ? (
                  <>
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${id}.png`}
                      width={20}
                      height={20}
                      alt={items?.[String(id)]?.name || "item"}
                    />

                    {hoveredItem &&
                      hoveredItem.name === items?.[String(id)]?.name && (
                        <div
                          className={`itemTooltip ${tooltipPosition === "top" ? "itemTooltipTop" : "itemTooltipBottom"}`}
                        >
                          <div style={{ color: "violet" }}>
                            {hoveredItem.name}
                          </div>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: formatItemDescription(
                                hoveredItem.description || "",
                              ),
                            }}
                          />
                          <div style={{ color: "#d4af37" }}>
                            {hoveredItem.gold?.total} gold
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
            ),
          )}
        </div>
      </div>
      <div className="playerCardStat">
        <span className="playerCardStatLabel">DMG</span>
        {/* Ваша формула урона из оригинального App.jsx */}
        <span className="playerCardStatValue" style={{ fontSize: "18px" }}>
          {p.totalDamageDealtToChampions +
            (p.totalAllyJungleMinionsKilled || 0) +
            (p.totalEnemyJungleMinionsKilled || 0)}
        </span>
        <span className="playerCardStatLabel" style={{ fontSize: "14px" }}>
          cs:{" "}
          {p.totalMinionsKilled +
            (p.totalAllyJungleMinionsKilled || 0) +
            (p.totalEnemyJungleMinionsKilled || 0)}
        </span>
      </div>
    </Link>
  );
}
