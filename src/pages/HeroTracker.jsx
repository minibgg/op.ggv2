import { useEffect, useState } from "react";
import { riotApi } from "../service/Utils.js";

export default function HeroTracker() {
  const [champions, setChampions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedHero, setSelectedHero] = useState("");
  const [, setItemBuild] = useState([]);
  const [, setGameVersion] = useState("14.1.1");
  const [recomendRune, setRecomendRune] = useState([]);
  const [, setRecomendItem] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const heroRune = await riotApi.getHeroRune();
        setRecomendRune(heroRune);
        const version = await riotApi.getVersion();
        setGameVersion(version);
        const champ = await riotApi.getChampions(version);
        console.log(champ);
        setChampions(champ);
      } catch (err) {
        console.error("error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const selectHeroInfo = async () => {
      if (!champions || !selectedHero || !recomendRune.length) {
        setItemBuild([]);
        return;
      }
      const selectHero = Object.values(champions).find(
        (h) => h.name === selectedHero,
      );
      if (!selectHero) return;

      const heroId = Number(selectHero.key);
      console.log(`id героя: ${heroId}`);

      const recomendHeroRune = recomendRune.find(
        (item) => Number(item.championId) === heroId,
      );
      console.log(`руны: ${recomendHeroRune}`);

      const recomendHeroItem = await riotApi.getHeroItems(heroId);
      setRecomendItem(recomendHeroItem);
      console.log(`итемы героя: ${recomendHeroItem}`);
    };
    selectHeroInfo();
  }, [selectedHero, champions, recomendRune]);

  if (loading) return <div style={{ padding: "20px" }}>Загрузка героев...</div>;
  return (
    <div style={{ padding: "20px" }}>
      <label htmlFor="hero-choice">Выберите героя: </label>

      <input
        className="search-input"
        list="champions-list"
        id="hero-choice"
        name="hero-choice"
        value={selectedHero}
        onChange={(e) => setSelectedHero(e.target.value)}
        placeholder="Smolder"
      />
      <datalist id="champions-list">
        {champions &&
          Object.values(champions).map((hero) => (
            <option key={hero.key} value={hero.name} />
          ))}
      </datalist>

      {selectedHero && (
        <p style={{ marginTop: "10px" }}>
          Вы выбрали: <strong>{selectedHero}</strong>
        </p>
      )}
    </div>
  );
}
