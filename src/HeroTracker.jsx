import { use, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { riotApi } from './riotApi';

export default function HeroTracker() {
  const [champions, setChampions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedHero, setSelectedHero] = useState('');

useEffect(() => {
const fetchData = async () => {
try{
  const version = await riotApi.getVersion()
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
  if (!champions || !selectedHero) return;

  const foundHero = Object.values(champions).find(h => h.name === selectedHero);
  if (foundHero) {
    const numberId = Number(foundHero.key)
    riotApi.getHeroItems(numberId)
    .then(data => {
      console.log('Рекомендуемые предметы для героя:', data);
    }).catch(error => console.log("items error", error))
  }
}, [selectedHero, champions]);

if (loading) return <div style={{ padding: '20px' }}>Загрузка героев...</div>;
  return (
    <div style={{ padding: '20px' }}>
      <label htmlFor="hero-choice">Выберите героя: </label>

      {/* Поле ввода, привязанное к списку */}
      <input
        className='search-input' // ваш класс стилей
        list="champions-list"
        id="hero-choice"
        name="hero-choice"
        value={selectedHero}
        onChange={(e) => setSelectedHero(e.target.value)}
        placeholder="Начните вводить имя..."
      />

      {/* Сам список подсказок */}
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