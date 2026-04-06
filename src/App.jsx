import { useState } from 'react';
import { riotApi, regionToCluster } from './riotApi';

function getWinStreak(matches, puuid) {
  let streak = 0

  for (const match of matches) {
    const player = match.info.participants.find(p => p.puuid === puuid)
    if (!player) break

    if (player.win) {
      streak++
    } else {
      break
    }
  }

  return streak
}

function getChampionFrameStyle(championName) {
  if (!championName) return {}

  let hash = 0

  for (const char of championName) {
    hash = char.charCodeAt(0) + ((hash << 5) - hash)
  }

  const hue = Math.abs(hash) % 360

  return {
    borderColor: `hsla(${hue}, 60%, 60%, 0.72)`,
    backgroundColor: `hsla(${hue}, 70%, 50%, 0.12)`,
    boxShadow: `0 0 14px hsla(${hue}, 70%, 55%, 0.16)`,
  }
}

function getThemeByChampion(championName) {
  if (!championName) return {}

  let hash = 0

  for (const char of championName) {
    hash = char.charCodeAt(0) + ((hash << 5) - hash)
  }

  const hue = Math.abs(hash) % 360
  const accentHue = (hue + 12) % 360
  const secondaryHue = (hue + 58) % 360

  return {
    '--text': `hsl(${hue}, 20%, 78%)`,
    '--text-h': `hsl(${hue}, 38%, 96%)`,
    '--bg': `hsl(${hue}, 24%, 10%)`,
    '--border': `hsla(${hue}, 28%, 45%, 0.38)`,
    '--code-bg': `hsl(${hue}, 22%, 14%)`,
    '--accent': `hsl(${accentHue}, 78%, 66%)`,
    '--accent-bg': `hsla(${accentHue}, 78%, 62%, 0.12)`,
    '--accent-border': `hsla(${accentHue}, 72%, 64%, 0.42)`,
    '--social-bg': `hsla(${secondaryHue}, 30%, 18%, 0.72)`,
    '--win-accent': `hsl(${(hue + 95) % 360}, 30%, 54%)`,
    '--win-shadow': `hsla(${(hue + 95) % 360}, 42%, 56%, 0.16)`,
    '--lose-accent': `hsl(${(hue + 195) % 360}, 32%, 56%)`,
    '--lose-shadow': `hsla(${(hue + 195) % 360}, 42%, 58%, 0.16)`,
    '--page-glow-a': `hsla(${accentHue}, 75%, 62%, 0.14)`,
    '--page-glow-b': `hsla(${secondaryHue}, 55%, 60%, 0.12)`,
    '--accent-shadow': `hsla(${accentHue}, 80%, 62%, 0.2)`,
    '--accent-shadow-soft': `hsla(${accentHue}, 80%, 62%, 0.08)`,
  }
}

function PlayerCard({ p, version }) {
  return (
    <div className='playerMatchCard'>
      <img src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${p.championName}.png`} width={48} height={48} />
      <div>
        <p>{p.riotIdGameName} {p.kills}/{p.deaths}/{p.assists}</p>
        <div>
          {[p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6].filter(id => id !== 0).map((id, index) => (
            <img key={index} src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${id}.png`} width={20} height={20} />
          ))}
        </div>
      </div>
      <div fontSize={5}>{p.totalDamageDealtToChampions}</div>
    </div>
  )
}

export default function MyApp(){

  const [input, setInput] = useState('')
  const [region, setRegion] = useState('EUW')
  const [sumData, setSumData] = useState(null)
  const [player, setPlayer] = useState(null)
  const [matches, setMatch] = useState(null)
  const [version, setversion] = useState(null)
  const [rank, setRank] = useState(null)
  const [puuid, setPuuid] = useState(null)
  const [masteries, setMasteries] = useState(null)
  const [champions, setChampions] = useState({})

  const topMasteryChampion = masteries?.[0]
    ? Object.values(champions).find(c => c.key === String(masteries[0].championId))
    : null
  const siteTheme = getThemeByChampion(topMasteryChampion?.id)

  async  function handleSearch(){
  const version = await riotApi.getVersion()
    setversion(version)

  const championsData = await riotApi.getChampions(version)
    setChampions(championsData)


  const { cluster, region: regionUrl } = regionToCluster[region]
  const [gameName, tagLine] = input.split('#')
    const data = await riotApi.getPuuidByNameTag(gameName, tagLine, cluster)
  setPuuid(data)
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

  const masteries = await riotApi.getChampMasteries(data.puuid, regionUrl)
    setMasteries(masteries)

  const sumoner = await riotApi.getSumms(version)
    console.log(sumoner)
}

  return (
  <div className='appShell' style={siteTheme}>
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
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '0 16px' }}>
    {sumData && rank && (
    <div>
      <div className='baseInfoFrame'>
      <p>{puuid.gameName}#{puuid.tagLine}</p>
      <p>Уровень: {sumData.summonerLevel}</p>
      <p>Ранг: {rank.find(q => q.queueType === 'RANKED_SOLO_5x5')?.tier} {rank.find(q => q.queueType === 'RANKED_SOLO_5x5')?.rank} lp: {rank.find(q => q.queueType === 'RANKED_SOLO_5x5')?.leaguePoints}</p>
      <p className='warningStreak'>
        {rank.find(q => q.queueType === 'RANKED_SOLO_5x5')?.hotStreak && matches && puuid
        ? `WARNING win streak: ${getWinStreak(matches, puuid.puuid)}`
        : ""}
      </p>
      {(() => {
        const solo = rank.find(q => q.queueType === 'RANKED_SOLO_5x5')
        if (!solo) return null
        const wr = ((solo.wins / (solo.wins + solo.losses)) * 100).toFixed(1)
        return <p>WR: {wr}% ({solo.wins}W / {solo.losses}L)</p>
      })()}
      </div>
      <div >
        <p>Most played heroes:</p>
        {masteries && masteries.map(m => {
          const champ = Object.values(champions).find(
            c => c.key === String(m.championId)
          )
          return (
            <div
              className='heroInfo'
              key={m.championId}
              style={getChampionFrameStyle(champ?.id)}
            >
              {champ && (
                <div className='mostPlayedHeroFrame'>
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ.id}.png`}
                    width={48}
                    height={48}
                />
                points: {m.championPoints} <br/>
                last time: {new Date(m.lastPlayTime).toLocaleString()}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
)}
    <div>
    {matches && matches.map(match => (
      <div key={match.metadata.matchId} className={`teamframe ${(() => {
      const player = match.info.participants.find(p => p.puuid === puuid?.puuid)
        if (!player) return 'lose'
        return match.info.teams.find(t => t.teamId === player.teamId)?.win ? 'win' : 'lose'
      })()} `}>
    <div className='team'>
      {match.info.participants.filter(p => p.teamId === 100).map(p => (
        <PlayerCard key={p.puuid} p={p} version={version} />
      ))}
    </div>
    <div className='team'>
      {match.info.participants.filter(p => p.teamId === 200).map(p => (
        <PlayerCard key={p.puuid} p={p} version={version} />
      ))}
    </div>
  </div>
))}
    </div>
    </div>
  </div>
  )
}

//test {gameName}#{tagLine}
//MishaCrazy#RU1
//СРУ МЯСОМ#RUNIT
//ADmidpermalose#01irl
