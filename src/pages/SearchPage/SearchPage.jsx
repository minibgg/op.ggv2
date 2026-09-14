import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearRecentSearches,
  getRecentSearches,
  removeRecentSearch,
  saveRecentSearch,
} from "../../service";
import "./SearchPage.css";

export default function SearchPage() {
  const [input, setInput] = useState("");
  const [secondInput, setSecondInput] = useState("");
  const [region1, setRegion1] = useState("EUW");
  const [region2, setRegion2] = useState("EUW");
  const [recentSearches, setRecentSearches] = useState(() =>
    getRecentSearches(),
  );
  const navigate = useNavigate();

  // Вспомогательная функция для форматирования имени игрока
  const formatPlayerString = (rawInput, region) => {
    // Заменяем # на - и пробелы на _
    const formatted = rawInput.trim().replace(/#/g, "-").replace(/\s+/g, "_");
    return `${formatted}-${region}`;
  };

  const handleSearch = () => {
    if (!input.includes("#")) {
      return alert("Используй формат Имя#Тег (например, MishaCrazy#RU1)");
    }

    const fullPlayerData = formatPlayerString(input, region1);
    saveRecentSearch({
      name: input.trim(),
      region: region1,
      playerData: fullPlayerData,
    });
    navigate(`/profile/${encodeURIComponent(fullPlayerData)}`);
  };

  const handleCompare = () => {
    if (!input.includes("#") || !secondInput.includes("#")) {
      return alert("Оба игрока должны быть в формате Имя#Тег");
    }

    const player1 = formatPlayerString(input, region1);
    const player2 = formatPlayerString(secondInput, region2);

    saveRecentSearch({
      name: input.trim(),
      region: region1,
      playerData: player1,
    });
    saveRecentSearch({
      name: secondInput.trim(),
      region: region2,
      playerData: player2,
    });

    const compareQuery = `${encodeURIComponent(player1)}==${encodeURIComponent(player2)}`;
    navigate(`/compare/${compareQuery}`);
  };

  const handleSelectRecent = (playerData) => {
    navigate(`/profile/${encodeURIComponent(playerData)}`);
  };

  const handleRemoveRecent = (e, playerData) => {
    e.stopPropagation();
    setRecentSearches(removeRecentSearch(playerData));
  };

  const handleClearRecent = () => {
    setRecentSearches(clearRecentSearches());
  };

  return (
    <div className="searchPageMain">
      <div className="searchStack">
        <div className="maininput">
          <select
            className="regioninput"
            onChange={(e) => setRegion1(e.target.value)}
            value={region1}
          >
            <option value="EUW">EUW</option>
            <option value="RU">RU</option>
            <option value="NA">NA</option>
            <option value="KR">KR</option>
            <option value="BR">BR</option>
            <option value="TR">TR</option>
          </select>
          <input
            className="textinput"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            placeholder="player1#euw"
          />
          <button className="searchbtn" onClick={handleSearch}>
            Search
          </button>
        </div>

        <div className="maininput">
          <select
            className="regioninput"
            onChange={(e) => setRegion2(e.target.value)}
            value={region2}
          >
            <option value="EUW">EUW</option>
            <option value="RU">RU</option>
            <option value="NA">NA</option>
            <option value="KR">KR</option>
            <option value="BR">BR</option>
            <option value="TR">TR</option>
          </select>
          <input
            className="textinput"
            value={secondInput}
            onChange={(e) => setSecondInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCompare();
            }}
            placeholder="player2#euw"
          />
          <button className="searchbtn" onClick={handleCompare}>
            Compare
          </button>
        </div>

        {recentSearches.length > 0 && (
          <div className="recentSearchesContainer">
            <div className="recentSearchesHeader">
              <span>Недавние поиски</span>
              <button
                className="recentClearBtn"
                onClick={handleClearRecent}
                title="Очистить историю поиска"
              >
                Очистить всё
              </button>
            </div>
            <div className="recentChipsList">
              {recentSearches.map((item) => (
                <div
                  key={item.playerData}
                  className="recentChip"
                  onClick={() => handleSelectRecent(item.playerData)}
                  title={`Перейти в профиль ${item.name}`}
                >
                  {item.profileIconId && item.version ? (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/${item.version}/img/profileicon/${item.profileIconId}.png`}
                      alt=""
                      className="recentAvatar"
                      loading="lazy"
                    />
                  ) : (
                    <div className="recentAvatarPlaceholder">👤</div>
                  )}
                  <span className="recentRegionBadge">{item.region}</span>
                  <span className="recentName">{item.name}</span>
                  <button
                    className="recentDeleteBtn"
                    onClick={(e) => handleRemoveRecent(e, item.playerData)}
                    title="Удалить из истории"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
