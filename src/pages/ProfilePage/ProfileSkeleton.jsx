const repeat = (n, render) => Array.from({ length: n }, (_, i) => render(i));

// Скелетон профиля: серые заготовки по размерам настоящих блоков,
// чтобы при появлении данных страница не прыгала
export function ProfileSkeleton() {
  return (
    <div className="profileLayout profileSkeleton" aria-hidden="true">
      <div className="skeletonSide">
        <div className="skeletonBlock skeletonInfo" />
        <div className="skeletonBlock skeletonTitle" />
        {repeat(5, (i) => (
          <div key={i} className="skeletonBlock skeletonHero" />
        ))}
      </div>

      <div>
        <div className="skeletonBlock skeletonStats" />
        {repeat(2, (m) => (
          <div key={m} className="skeletonMatch">
            <div className="skeletonBlock skeletonChips" />
            <div className="skeletonTeams">
              {repeat(2, (t) => (
                <div key={t} className="skeletonTeam">
                  {repeat(5, (i) => (
                    <div key={i} className="skeletonBlock skeletonCard" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
