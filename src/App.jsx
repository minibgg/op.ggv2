import { Routes, Route } from 'react-router-dom';
import SearchPage from './SearchPage';
import ProfilePage from './ProfilePage';

export default function App() {
  return (
    // Оставляем общую обертку appShell для стилей
    <div className='appShell'>
      <Routes>
        {/* Главная страница с инпутом */}
        <Route path="/" element={<SearchPage />} />

        {/* Страница профиля, где :playerData — это то, что мы передали в navigate */}
        <Route path="/profile/:playerData" element={<ProfilePage />} />
      </Routes>
    </div>
  );
}
//test
//MishaCrazy#RU1
//СРУ МЯСОМ#RUNIT
//ADmidpermalose#01irl