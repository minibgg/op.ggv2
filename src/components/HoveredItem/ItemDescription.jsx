import "./ItemDescription.css";
import { WithTooltip } from "../GameTooltip/GameTooltip.jsx";

function itemIconUrl(version, id) {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${id}.png`;
}

// Подсказка предмета: цена, характеристики, эффекты и краткое описание от Riot
function getItemTooltip(item, iconUrl) {
  return {
    className: "itemTooltip",
    icon: (
      <img
        src={iconUrl}
        width={28}
        height={28}
        alt=""
        className="gameTooltipIcon"
      />
    ),
    name: item.name,
    kind: item.gold?.total > 0 && (
      <span className="itemGold">{item.gold.total} золота</span>
    ),
    sections: [
      item.stats && (
        <div
          className="itemStats"
          dangerouslySetInnerHTML={{ __html: item.stats }}
        />
      ),
      item.effects && <div dangerouslySetInnerHTML={{ __html: item.effects }} />,
    ],
    note: item.plaintext,
  };
}

export default function PlayerItems({ player, p, version, items }) {
  const targetPlayer = player || p;

  const itemIds = [
    targetPlayer?.item0,
    targetPlayer?.item1,
    targetPlayer?.item2,
    targetPlayer?.item3,
    targetPlayer?.item4,
    targetPlayer?.item5,
    targetPlayer?.item6,
  ];

  return (
    <div className="playerCardItems">
      {itemIds.map((id, index) => {
        if (!id) return <div key={index} className="itemEmpty" />;

        const item = items?.[String(id)];
        const iconUrl = itemIconUrl(version, id);

        return (
          <WithTooltip
            key={index}
            label={item?.name || "Предмет"}
            tooltip={item && getItemTooltip(item, iconUrl)}
          >
            <img
              src={iconUrl}
              width={20}
              height={20}
              alt={item?.name || "item"}
              loading="lazy"
            />
          </WithTooltip>
        );
      })}
    </div>
  );
}
