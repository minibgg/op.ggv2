import { Routes, Route } from 'react-router-dom';
import SearchPage from './SearchPage';
import ProfilePage from './ProfilePage';
import HeroTracker from './HeroTracker'

export default function App() {
  return (
    <div className='appShell'>
      <Routes>
        <Route path="/" element={<SearchPage />} />

        <Route path="/profile/:playerData" element={<ProfilePage />} />

        <Route path="/heroTracker" element={<HeroTracker />} />
      </Routes>
    </div>
  );
}