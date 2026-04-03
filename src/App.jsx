import { useState } from 'react';
import { riotApi, regions, clusters } from './api.js';

export default function App() {
    const [gameName, setGameName] = useState("");
    const [tagLine, setTagLine] = useState("");
    const [playerData, setPlayerData] = useState(null);

    async function handleSearch() {
        const data = await riotApi.getPuuidByNameTag(gameName, tagLine, clusters.EUROPE);
        setPlayerData(data);
        console.log(data);
    }

    return (
        <div>
            <input value={gameName} onChange={e => setGameName(e.target.value)} placeholder="Ник" />
            <input value={tagLine} onChange={e => setTagLine(e.target.value)} placeholder="Тег" />
            <button onClick={handleSearch}>Поиск</button>
            {playerData && <div>{playerData.puuid}</div>}
        </div>
    );
}