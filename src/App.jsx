import { Routes, Route } from "react-router-dom";
import SearchPage from "./pages/SearchPage/SearchPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import HeroTracker from "./pages/HeroTracker";
import ComparePage from "./pages/ComparePage/ComparePage";
import LiveGamePage from "./pages/LiveGamePage/LiveGamePage";

export default function App() {
  return (
    <div className="appShell">
      <Routes>
        <Route path="/" element={<SearchPage />} />

        <Route path="/compare/:players" element={<ComparePage />} />

        <Route path="/profile/:playerData" element={<ProfilePage />} />

        <Route path="/heroTracker" element={<HeroTracker />} />

        <Route path="/liveGame/:playerData?" element={<LiveGamePage />} />
      </Routes>
    </div>
  );
}
