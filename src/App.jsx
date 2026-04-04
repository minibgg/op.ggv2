import { useState } from 'react';

export default function MyApp(){

  const [input, setInput] = useState('')
  const [region, setRegion] = useState('EUW')
  const [sumData, setSumData] = useState(null)
  const [player, setPlayer] = useState(null)
  const [matches, setMatch] = useState(null)
  const [version, setversion] = useState(null)
  const [rank, setRank] = useState(null)

  async  function handleSearch(){
  const version = await riotApi.getVersion()
  setversion(version)

  const { cluster, region: regionUrl } = regionToCluster[region]
  const [gameName, tagLine] = input.split('#')
    const data = await riotApi.getPuuidByNameTag(gameName, tagLine, cluster)
  console.log(data)


  const sumData = await riotApi.getSummonerLevel(data.puuid, regionUrl)
  setSumData(sumData)
  console.log(sumData)


  const matchId = await riotApi.getRecentMatch(data.puuid, cluster)
  console.log(matchId)

  const matchInfo = await riotApi.getMatchInfo(matchId[0], cluster)
  console.log(matchInfo)

  const player = matchInfo.info.participants.find(p => p.puuid === data.puuid)
  console.log(player.kills)

  setMatch(await Promise.all(matchId.slice(0, 5).map(id => riotApi.getMatchInfo(id, cluster))))

  const playerData = await riotApi.getRank(data.puuid, regionUrl)
  setRank(playerData)
  console.log(playerData)
}

  return (
  <div>
    <div className='maininput'>
      <select className='regioninput' onChange={(e) => setRegion(e.target.value)}>
        <option value="EUW">EUW</option>
        <option value="EUNE">EUNE</option>
        <option value="RU">RU</option>
        <option value="NA">NA</option>
        <option value="KR">KR</option>
        <option value="BR">BR</option>
        <option value="TR">TR</option>
</select>
      <input className='textinput' value={input} onChange={(e) => setInput(e.target.value)} placeholder='MishaCrazy#RU1' />
      <button className='searchbtn' onClick={handleSearch}>Search</button>
    </div>
    {sumData && rank && (
    <div className='baseInfoFrame'>
      <p>Уровень: {sumData.summonerLevel}</p>
      <p>Ранг: {rank.find(q => q.queueType === 'RANKED_SOLO_5x5')?.tier} {rank.find(q => q.queueType === 'RANKED_SOLO_5x5')?.rank} lp: {rank.find(q => q.queueType === 'RANKED_SOLO_5x5')?.leaguePoints}</p>
      {(() => {
        const solo = rank.find(q => q.queueType === 'RANKED_SOLO_5x5')
        if (!solo) return null
        const wr = ((solo.wins / (solo.wins + solo.losses)) * 100).toFixed(1)
        return <p>WR: {wr}% ({solo.wins}W / {solo.losses}L)</p>
      })()}
    </div>
)}
    {matches && matches.map(match => (
  <div key={match.metadata.matchId} className={`teamframe ${match.info.teams.find(t => t.teamId === 100).win ? 'lose' : 'win'}`}>
    <div className='team'>
      {match.info.participants.filter(p => p.teamId === 100).map(p => (
        <div key={p.puuid} className='playerMatchCard'>
          <p>{p.riotIdGameName} {p.kills}/{p.deaths}/{p.assists}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <img src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${p.championName}.png`} width={20} height={20} />
            <p style={{ fontSize: '12px', color: 'var(--text)' }}>{p.championName}</p>
          </div>
          <div>
            {[p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6].filter(id => id !== 0).map(id => (
            <img key={id} src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${id}.png`} width={32} height={32} />
            ))}
          </div>
        </div>
      ))}
    </div>
    <div className='team'>
      {match.info.participants.filter(p => p.teamId === 200).map(p => (
        <div key={p.puuid} className='playerMatchCard'>
          <p>{p.riotIdGameName} {p.kills}/{p.deaths}/{p.assists}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <img src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${p.championName}.png`} width={20} height={20} />
            <p style={{ fontSize: '12px', color: 'var(--text)' }}>{p.championName}</p>
          </div>
          <div>
            {[p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6].filter(id => id !== 0).map(id => (
            <img key={id} src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${id}.png`} width={32} height={32} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
))}
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
  async getVersion() {
    const res = await fetch('https://ddragon.leagueoflegends.com/api/versions.json')
    const data = await res.json();
    return data[0]
  },
  async getRank(puuid, region){
    const res = await fetch(`https://${region}/lol/league/v4/entries/by-puuid/${puuid}?api_key=${API_KEY}`)
    const data = await res.json();
    return data;
  },
};

//test {gameName}#{tagLine}
//MishaCrazy#RU1
//СРУ МЯСОМ#RUNIT
//ADmidpermalose#01irl