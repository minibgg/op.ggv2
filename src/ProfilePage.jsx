import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { riotApi, regionToCluster } from './riotApi';

// --- Вспомогательные функции (Твои оригинальные) ---
function getWinStreak(matches, puuid) {
  let streak = 0;
  for (const match of matches) {
    const player = match.info.participants.find(p => p.puuid === puuid);
    if (!player) break;
    if (player.win) streak++;
    else break;
  }
  return streak;
}

function getGameModeLabel(gameMode) {
  return gameMode === 'CLASSIC' ? 'ranked' : 'unknown game mode';
}

// --- Компонент PlayerCard (Твой оригинальный, с предметами и уроном) ---
function PlayerCard({ p, version }) {
  return (
    <div className='playerMatchCard'>
      <img
        className='playerCardChampion'
        src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${p.championName}.png`}
        width={48}
        height={48}
        alt={p.championName}
      />
      <div className='playerCardMain'>
        <p className='playerCardName'>{p.riotIdGameName}</p>
        <p className='playerCardScore'>{p.kills}/{p.deaths}/{p.assists}</p>
        <div className='playerCardItems'>
          {[p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6]
            .filter(id => id !== 0)
            .map((id, index) => (
              <img
                key={index}
                src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${id}.png`}
                width={20}
                height={20}
                alt="item"
              />
            ))}
        </div>
      </div>
      <div className='playerCardStat'>
        <span className='playerCardStatLabel'>DMG</span>
        {/* Твоя оригинальная формула урона */}
        <span className='playerCardStatValue'>
          {p.totalDamageDealtToChampions + p.totalAllyJungleMinionsKilled + p.totalEnemyJungleMinionsKilled}
        </span>
        <span className='playerCardStatValue'>
          cs: {p.totalMinionsKilled + p.totalAllyJungleMinionsKilled + p.totalEnemyJungleMinionsKilled}
        </span>
      </div>
    </div>
  );
}

// --- Основной компонент Профиля ---
export default function ProfilePage() {
  const { playerData } = useParams();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // 1. Разбираем URL (MishaCrazy-RU1-RU)
        const parts = decodeURIComponent(playerData).split('-');
        const regionKey = parts.pop(); // RU
        const tagLine = parts.pop();    // RU1
        const gameName = parts.join('-').replace(/_/g, ' '); // MishaCrazy

        const { cluster, region: regionUrl } = regionToCluster[regionKey];

        // 2. Запросы к Riot API (Параллельно)
        const account = await riotApi.getPuuidByNameTag(gameName, tagLine, cluster);
        const version = await riotApi.getVersion();

        const [sumData, rank, matchIds, masteries, champions] = await Promise.all([
          riotApi.getSummonerLevel(account.puuid, regionUrl),
          riotApi.getRank(account.puuid, regionUrl),
          riotApi.getRecentMatch(account.puuid, cluster),
          riotApi.getChampMasteries(account.puuid, regionUrl),
          riotApi.getChampions(version)
        ]);

        // Детали последних 5 матчей
        const matchDetails = await Promise.all(
          matchIds.slice(0, 5).map(id => riotApi.getMatchInfo(id, cluster))
        );

        // Сохраняем всё в один объект
        setProfileData({
          account, sumData, rank, matches: matchDetails, masteries, champions, version
        });
      } catch (error) {
        console.error("Ошибка загрузки:", error);
        alert("Игрок не найден или ошибка API");
        navigate('/'); // Возврат на главную
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [playerData, navigate]);

  if (loading) return <div className='appShell' style={{padding: '20px'}}>Загрузка...</div>;
  if (!profileData) return null;

  // Деструктуризация данных для удобства
  const { account, sumData, rank, matches, masteries, champions, version } = profileData;
  const soloQ = rank.find(q => q.queueType === 'RANKED_SOLO_5x5');

  return (
    <div style={{ padding: '20px' }}>
      {/* Кнопка "Назад" (Твоя оригинальная) */}
      <button className='searchbtn' onClick={() => navigate('/')} style={{ marginBottom: '20px' }}>
        ← Назад к поиску
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        {/* ЛЕВАЯ КОЛОНКА: Инфо игрока и Топ чемпионов */}
        <div>
          {/* Рамка базовой инфо (Твоя оригинальная .baseInfoFrame) */}
          <div className='baseInfoFrame'>
            <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{account.gameName}#{account.tagLine}</p>
            <p>Уровень: {sumData.summonerLevel}</p>
            <p>Ранг: {soloQ ? `${soloQ.tier} ${soloQ.rank} (${soloQ.leaguePoints} LP)` : 'Unranked'}</p>

            {/* Warning Streak (Твоя логика) */}
            <p className='warningStreak'>
              {soloQ?.hotStreak && matches && account
                ? `WARNING win streak: ${getWinStreak(matches, account.puuid)}`
                : ""}
            </p>

            {/* WR (Твой расчет) */}
            {soloQ && (
              <p>WR: {((soloQ.wins / (soloQ.wins + soloQ.losses)) * 100).toFixed(1)}% ({soloQ.wins}W / {soloQ.losses}L)</p>
            )}
          </div>

          {/* Секция Most played heroes (Твоя оригинальная верстка) */}
          <div style={{ marginTop: '20px' }}>
            <p style={{ color: 'var(--text-h)', marginBottom: '10px' }}>Most played heroes:</p>
            {masteries.map(m => {
              const champ = Object.values(champions).find(c => c.key === String(m.championId));
              return (
                <div className='heroInfo' key={m.championId}>
                  {champ && (
                    <div className='mostPlayedHeroFrame'>
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ.id}.png`}
                        width={48}
                        height={48}
                        alt={champ.name}
                        style={{ borderRadius: '4px', marginRight: '10px' }}
                      />
                      <div style={{ fontSize: '13px' }}>
                        <strong>{champ.name}</strong><br/>
                        points: {m.championPoints.toLocaleString()} <br/>
                        last time: {new Date(m.lastPlayTime).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: История матчей (Твоя оригинальная верстка) */}
        <div style={{ flexGrow: 1 }}>
          {matches.map(match => {
            const player = match.info.participants.find(p => p.puuid === account.puuid);
            const isWin = match.info.teams.find(t => t.teamId === player?.teamId)?.win;

            return (
              <div key={match.metadata.matchId} className={`teamframe ${isWin ? 'win' : 'lose'}`} style={{ marginBottom: '10px' }}>
                {/* Match Info (Твое оригинальное) */}
                <div className='matchInfo'>
                  <p className='gameInfo' style={{ margin: '0px 10px 0px 0px' }}>
                    {new Date(match.info.gameEndTimestamp).toLocaleDateString()}
                  </p>
                  <p className='gameInfo' style={{ margin: '0px 10px 0px 0px' }}>
                    Game mode: {getGameModeLabel(match.info.gameMode)}
                  </p>
                  <p className='gameInfo'>
                    game time: {Math.floor(match.info.gameDuration / 60)}:
                    {String(match.info.gameDuration % 60).padStart(2, '0')}
                  </p>
                </div>

                {/* Match Teams (Твое оригинальное) */}
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
            );
          })}
        </div>
      </div>
    </div>
  );
}