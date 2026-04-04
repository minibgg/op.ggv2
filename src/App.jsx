import { useState } from 'react';

export default function MyApp(){

  const [gameName, setGameName] = useState('')
  const [tagLine, setTagLine] = useState('')
  const [region, setRegion] = useState('EUW')
  const [puuId, setPuuId] = useState(null)
  const [sumData, setSumData] = useState(null)
  const [recentMatch, setRecentMatch] = useState(null)
  const [matchInfo, setMatchInfo] = useState(null)
  const [player, setPlayer] = useState(null)

  async  function handleSearch(){
  const { cluster, region: regionUrl } = regionToCluster[region]
  const data = await riotApi.getPuuidByNameTag(gameName, tagLine, cluster)
  setPuuId(data.puuid)
  console.log(data)


  const sumData = await riotApi.getSummonerLevel(data.puuid, regionUrl)
  setSumData(sumData)
  console.log(sumData)


  const matchId = await riotApi.getRecentMatch(data.puuid, cluster)
  setRecentMatch(matchId)
  console.log(matchId)

  const matchInfo = await riotApi.getMatchInfo(matchId[0], cluster)
  setMatchInfo(matchInfo)
  console.log(matchInfo)

  const player = matchInfo.info.participants.find(p => p.puuid === data.puuid)
  setPlayer(player)
  console.log(player.kills)
}

  return (
  <div>
    <select onChange={(e) => setRegion(e.target.value)}>
      <option value="EUW">EUW</option>
      <option value="EUNE">EUNE</option>
      <option value="RU">RU</option>
      <option value="NA">NA</option>
      <option value="KR">KR</option>
      <option value="BR">BR</option>
      <option value="TR">TR</option>
</select>
    <input value={gameName} onChange={(e) => setGameName(e.target.value)} placeholder='gameName'></input>
    <input value={tagLine} onChange={(e) => setTagLine(e.target.value)} placeholder='tag'></input>
    <button onClick={handleSearch}>Search</button>
    {sumData && (
      <div>
        <p>Уровень: {sumData.summonerLevel}</p>
      </div>
    )}
    {player && (
    <div>
      <p>KDA:{player.kills}/{player.deaths}/{player.assists}</p>
    </div>
    )}
  </div>
  )
}

const API_KEY = import.meta.env.VITE_RIOT_KEY;

const regionToCluster = {
  EUW: { cluster: "europe.api.riotgames.com", region: "euw1.api.riotgames.com" },
  EUNE: { cluster: "europe.api.riotgames.com", region: "eun1.api.riotgames.com" },
  RU: { cluster: "europe.api.riotgames.com", region: "ru.api.riotgames.com" },
  NA: { cluster: "americas.api.riotgames.com", region: "na1.api.riotgames.com" },
  BR: { cluster: "americas.api.riotgames.com", region: "br1.api.riotgames.com" },
  KR: { cluster: "asia.api.riotgames.com", region: "kr.api.riotgames.com" },
  TR: { cluster: "europe.api.riotgames.com", region: "tr1.api.riotgames.com" },
}

const riotApi = {
  async getPuuidByNameTag(gameName, tagLine, cluster) {
    const res = await fetch(`https://${cluster}/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${API_KEY}`);
    const data = await res.json();
    return data;
  },
  async getSummonerLevel(puuid, region) {
    const res = await fetch(`https://${region}/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${API_KEY}`);
    const data = await res.json();
    return data;
  },
  async getRecentMatch(puuid, region){
    const res = await fetch(`https://${region}/lol/match/v5/matches/by-puuid/${puuid}/ids?api_key=${API_KEY}`);
    const data = await res.json();
    return data;
  },
  async getMatchInfo(matchId, region){
    const res = await fetch(`https://${region}/lol/match/v5/matches/${matchId}?api_key=${API_KEY}`)
    const data = await res.json();
    return data
  },
};

//test {gameName}#{tagLine}
//MishaCrazy#RU1
//СРУ МЯСОМ#RUNIT
//ADmidpermalose#01irl