import { Routes, Route } from "react-router-dom";
import SearchPage from "./SearchPage";
import ProfilePage from "./ProfilePage";
import HeroTracker from "./HeroTracker";
import ComparePage from "./ComparePage";
import Dota2SearchPage from "./pages/Dota2/Dota2SearchPage";

export default function App() {
  return (
    <div className="appShell">
      <Routes>
        <Route path="/" element={<SearchPage />} />

        <Route path="/compare/:players" element={<ComparePage />} />

        <Route path="/profile/:playerData" element={<ProfilePage />} />

        <Route path="/heroTracker" element={<HeroTracker />} />

        <Route path="/Dota2SearchPage" element={<Dota2SearchPage />} />
      </Routes>
    </div>
  );
}
