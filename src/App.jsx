import { Route, Routes } from "react-router-dom";
import ComparePage from "./pages/ComparePage/ComparePage";
import LiveGamePage from "./pages/LiveGamePage/LiveGamePage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import SearchPage from "./pages/SearchPage/SearchPage";

export default function App() {
  return (
    <div className="appShell">
      <Routes>
        <Route path="/" element={<SearchPage />} />

        <Route path="/compare/:players" element={<ComparePage />} />

        <Route path="/profile/:playerData" element={<ProfilePage />} />

        <Route path="/liveGame/:playerData?" element={<LiveGamePage />} />
      </Routes>
    </div>
  );
}
