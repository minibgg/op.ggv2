import { Routes, Route } from "react-router-dom";
import SearchPage from "./SearchPage";
import ProfilePage from "./ProfilePage";
import HeroTracker from "./HeroTracker";
import ComparePage from "./ComparePage";
import Dota2SearchPage from "./Pages/Dota2/Dota2SearchPage";
import Dota2ProfilePage from "./Pages/Dota2/Dota2ProfilePage";

export default function App() {
  return (
    <div className="appShell">
      <Routes>
        <Route path="/" element={<SearchPage />} />

        <Route path="/compare/:players" element={<ComparePage />} />

        <Route path="/profile/:playerData" element={<ProfilePage />} />

        <Route path="/heroTracker" element={<HeroTracker />} />

        <Route path="/Dota2/Search" element={<Dota2SearchPage />} />
        <Route
          path="/Dota2/Profile/:accountId"
          element={<Dota2ProfilePage />}
        />
      </Routes>
    </div>
  );
}
