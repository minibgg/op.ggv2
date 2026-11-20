import "./MostPlayedHeroes.css";
import { useState } from "react";

const DDRAGON = "https://ddragon.leagueoflegends.com/cdn";

// Most played heroes: топ-1 герой — баннер со сплеш-артом,
// остальные — плитки 2×2, у которых яркость цвета и длина полосы
// зависят от доли очков мастерства относительно топ-1.
// color — цвет SoloQ ранга; без ранга остаётся оранжевый --accent сайта
export function MostPlayedHeroes({ masteries, championsByKey, version, color }) {
  const heroes = (masteries || [])
    .map((m) => ({ ...m, champ: championsByKey[String(m.championId)] }))
    .filter((h) => h.champ);
  if (heroes.length === 0) return null;

  // Эндпоинт masteries (top?count=5) уже отдаёт героев по убыванию очков
  const [top, ...rest] = heroes;
  const maxPoints = top.championPoints || 1;

  return (
    <section
      className="mostPlayed"
      style={color ? { "--hero-accent": color } : undefined}
    >
      <p className="mostPlayedTitle">Most played heroes:</p>
      <HeroBanner hero={top} />
      {rest.length > 0 && (
        <div className="heroGrid">
          {rest.map((h) => (
            <HeroTile
              key={h.championId}
              hero={h}
              version={version}
              share={(h.championPoints || 0) / maxPoints}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function HeroBanner({ hero }) {
  const { champ } = hero;
  const splash = `${DDRAGON}/img/champion/splash/${champ.id}_0.jpg`;
  // Запоминаем, какой именно сплеш не загрузился: на профиле другого
  // игрока src сменится, и картинка снова попробует загрузиться.
  // Без арта остаётся фон, подкрашенный цветом ранга
  const [failedSrc, setFailedSrc] = useState(null);

  return (
    <div className="heroBanner">
      {failedSrc !== splash && (
        <img
          className="heroBannerArt"
          src={splash}
          alt=""
          onError={() => setFailedSrc(splash)}
        />
      )}
      <div className="heroBannerContent">
        <span className="heroBannerLabel">
          #1 · Mastery {hero.championLevel}
        </span>
        <strong className="heroBannerName">{champ.name}</strong>
        <span>
          {hero.championPoints?.toLocaleString()} pts · last{" "}
          {new Date(hero.lastPlayTime).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

// --share — честная доля очков (длина полосы), --strength — её корень
// (насыщенность цвета): очки распределены неравномерно, и при линейной
// прозрачности плитка с долей 0.05 была бы почти невидимой
function HeroTile({ hero, version, share }) {
  const { champ } = hero;
  return (
    <div
      className="heroTile"
      style={{ "--share": share, "--strength": Math.sqrt(share) }}
    >
      <img
        src={`${DDRAGON}/${version}/img/champion/${champ.id}.png`}
        width={44}
        height={44}
        alt=""
        loading="lazy"
      />
      <div className="heroTileBody">
        <strong className="heroTileName" title={champ.name}>
          {champ.name}
        </strong>
        <span className="heroTilePoints">
          {hero.championPoints?.toLocaleString()}
        </span>
        <div className="heroBar" aria-hidden="true" />
      </div>
    </div>
  );
}
