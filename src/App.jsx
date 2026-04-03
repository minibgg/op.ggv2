import { useState } from 'react';

export default function App() {//ии от
    const [gameName, setGameName] = useState("");
    const [tagLine, setTagLine] = useState("");
    const [region, setRegion] = useState("EUROPE");
    const [playerData, setPlayerData] = useState(null);

    async function handleSearch() {
    const accountData = await riotApi.getPuuidByNameTag(gameName, tagLine, clusters[region]);
    const summonerData = await riotApi.getSummonerId(accountData.puuid, regions.RU);
    setPlayerData(summonerData);
    console.log(summonerData);
}

    return (
        <div>
            <select value={region} onChange={e => setRegion(e.target.value)}>
                <option value="EUROPE">Европа (EUW, EUNE, RU)</option>
                <option value="ASIA">Азия (KR, JP)</option>
                <option value="AMERICAS">Америка (NA, BR)</option>
            </select>
            <input value={gameName} onChange={e => setGameName(e.target.value)} placeholder="Ник" />
            <input value={tagLine} onChange={e => setTagLine(e.target.value)} placeholder="Тег" />
            <button onClick={handleSearch}>Поиск</button>
            {playerData && <div>{playerData.puuid}</div>}
            {playerData && <div>{playerData.summonerLevel}</div>}
        </div>
    );
}//до

const API_KEY = import.meta.env.VITE_RIOT_KEY;

const regions = {
    EUW: "euw1.api.riotgames.com",
    EUNE: "eun1.api.riotgames.com",
    NA: "na1.api.riotgames.com",
    KR: "kr.api.riotgames.com",
    RU: "ru.api.riotgames.com",
    BR: "br1.api.riotgames.com",
    TR: "tr1.api.riotgames.com",
};

const clusters = {
    EUROPE: "europe.api.riotgames.com",
    ASIA: "asia.api.riotgames.com",
    AMERICAS: "americas.api.riotgames.com",
};

const riotApi = {
  async getPuuidByNameTag(gameName, tagLine, cluster) {
    const res = await fetch(`https://${cluster}/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${API_KEY}`);
    const data = await res.json();
    return data;
  },
  async getSummonerId(puuid, cluster){
    const res = await fetch(`https://${cluster}/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${API_KEY}`);
    const data = await res.json();
    return data;
  },
};

//test {gameName}{tagLine}
//MishaCrazy#RU1
//СРУ МЯСОМ#RUNIT
//ADmidpermalose#01irl