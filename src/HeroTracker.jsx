import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { riotApi } from './riotApi';

export default function HeroTracker() {
  const [champions, setChampions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedHero, setSelectedHero] = useState('');
  const [itemBuild, setItemBuild] = useState([]); // Для хранения предметов
  const [gameVersion, setGameVersion] = useState('14.1.1'); // Дефолтная версия
  const [allRecomend, setAllRecomend] = useState('')

useEffect(() => {
const fetchData = async () => {
try{
  const heroBuild = await riotApi.getHeroItems()
  setAllRecomend(heroBuild)
  const version = await riotApi.getVersion()
  setGameVersion(version)
  const champ = await riotApi.getChampions(version)
  console.log(champ)
  setChampions(champ)
} catch(error){
  console.log(error)
} finally{
  setLoading(false)
}
}
fetchData();
}, []);

useEffect(() => {
  if (!champions || !selectedHero) {
      setItemBuild([]);
      return;
    }
    const selectHero = Object.values(champions).find(h => h.name === selectedHero);
  const heroId = Number(selectHero.key)
  console.log (heroId)

  const recomendItem = allRecomend.find(h => Number(h.championId) === heroId)
  console.log(recomendItem)
}, [selectedHero, champions]);

if (loading) return <div style={{ padding: '20px' }}>Загрузка героев...</div>;
  return (
    <div style={{ padding: '20px' }}>
      <label htmlFor="hero-choice">Выберите героя: </label>

      <input
        className='search-input'
        list="champions-list"
        id="hero-choice"
        name="hero-choice"
        value={selectedHero}
        onChange={(e) => setSelectedHero(e.target.value)}
        placeholder="Smolder"
      />
      <datalist id="champions-list">
        {champions && Object.values(champions).map((hero) => (
          <option key={hero.key} value={hero.name} />
        ))}
      </datalist>

      {selectedHero && (
        <p style={{ marginTop: '10px' }}>
          Вы выбрали: <strong>{selectedHero}</strong>
        </p>
      )}
    </div>
  );
}