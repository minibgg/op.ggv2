import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { riotApi, regionToCluster } from './riotApi';

function getWinStreak(matches, puuid) {//ии от
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
}//до

function getGameModeLabel(gameMode) {
  return gameMode === 'CLASSIC' ? 'ranked' : 'unknown game mode'
}


function PlayerCard({ p, version }) {
  return (
    <div className='playerMatchCard'>
      <img
        className='playerCardChampion'
        src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${p.championName}.png`}
        width={48}
        height={48}
      />
      <div className='playerCardMain'>
        <p className='playerCardName'>{p.riotIdGameName}</p>
        <p className='playerCardScore'>{p.kills}/{p.deaths}/{p.assists}</p>
        <div className='playerCardItems'>
          {[p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6].filter(id => id !== 0).map((id, index) => (
            <img key={index} src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${id}.png`} width={20} height={20} />
          ))}
        </div>
      </div>
      <div className='playerCardStat'>
        <span className='playerCardStatLabel'>DMG</span>
        <span className='playerCardStatValue'>{p.totalDamageDealtToChampions + p.totalAllyJungleMinionsKilled + p.totalEnemyJungleMinionsKilled}</span>
        <span className='playerCardStatValue'>
          cs: {p.totalMinionsKilled + p.totalAllyJungleMinionsKilled + p.totalEnemyJungleMinionsKilled}
        </span>
      </div>
    </div>
  )
}

export default function MyApp(){

  const [input, setInput] = useState('')
  const [region, setRegion] = useState('EUW')
  const [sumData, setSumData] = useState(null)
  const [matches, setMatch] = useState(null)
  const [version, setversion] = useState(null)
  const [rank, setRank] = useState(null)
  const [puuid, setPuuid] = useState(null)
  const [masteries, setMasteries] = useState(null)
  const [champions, setChampions] = useState({})

  const navigate = useNavigate();

  async  function handleSearch(){
  try{
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

  navigate('/profile');

  }catch(eror){
    alert("eror")
  }
}

  return (
    <div className='appShell'>
      <Routes>
        <Route path='/' element={
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
    } />
    <Route path='/profile' element={
      <div style={{ padding: '20px' }}>
        <button className='searchbtn' onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>← Назад</button>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          {sumData && rank && (
            <>
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
    <div>
    {matches && matches.map(match => (
      <div key={match.metadata.matchId} className={`teamframe ${(() => {
      const player = match.info.participants.find(p => p.puuid === puuid?.puuid)
        if (!player) return 'lose'
        return match.info.teams.find(t => t.teamId === player.teamId)?.win ? 'win' : 'lose'
      })()} `}>
    <div className='matchInfo'>
      <p className='gameInfo' style={{ margin: '0px 10px 0px 0px'}}>{new Date(match.info.gameEndTimestamp).toLocaleString()}</p>
      <p className='gameInfo' style={{ margin: '0px 10px 0px 0px'}}>Game mode: {getGameModeLabel(match.info.gameMode)}</p>
      <p className='gameInfo'>game time:
      {Math.floor(match.info.gameDuration / 60)}:
      {String(match.info.gameDuration % 60).padStart(2, '0')}
      </p>
    </div>
    <div className='matchTeams'>
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
  </div>
        ))}
      </div>
    </>
  )}
</div>
</div>
} />
</Routes>
</div>
);
}

//test
//MishaCrazy#RU1
//СРУ МЯСОМ#RUNIT
//ADmidpermalose#01irl