const repeat = (n, render) => Array.from({ length: n }, (_, i) => render(i));

// Скелетон профиля: серые заготовки по размерам настоящих блоков,
// чтобы при появлении данных страница не прыгала
export function ProfileSkeleton() {
  return (
    <div className="profileLayout profileSkeleton" aria-hidden="true">
      <div className="skeletonSide">
        <div className="skeletonBlock skeletonInfo" />
        <div className="skeletonBlock skeletonTitle" />
        <div className="skeletonBlock skeletonHeroBanner" />
        <div className="skeletonHeroGrid">
          {repeat(8, (i) => (
            <div key={i} className="skeletonBlock skeletonHero" />
          ))}
        </div>
      </div>

      <div>
        <div className="skeletonBlock skeletonStats" />
        {repeat(5, (m) => (
          <div key={m} className="skeletonBlock skeletonMatch" />
        ))}
      </div>
    </div>
  );
}
