import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { riotApi } from './riotApi';

export default function HeroTracker() {
  const [champions, setChampions] = useState(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
const fetchData = async () => {
try{
  const version = await riotApi.getVersion()
  console.log(version)

  const champ = await riotApi.getChampions(version)
  console.log(champ)
  setChampions(champ)

} catch(error){
  console.log(error)
}
}
fetchData();
  }, []);

  return (
    <div>
        Данные в консоли (F12)
        <div></div>
    </div>
  );
}