import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchPage.css";

export default function SearchPage() {
  const [input, setInput] = useState("");
  const [secondInput, setSecondInput] = useState("");
  const [region1, setRegion1] = useState("EUW");
  const [region2, setRegion2] = useState("EUW");
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
    navigate(`/profile/${encodeURIComponent(fullPlayerData)}`);
  };

  const handleCompare = () => {
    if (!input.includes("#") || !secondInput.includes("#")) {
      return alert("Оба игрока должны быть в формате Имя#Тег");
    }

    const player1 = formatPlayerString(input, region1);
    const player2 = formatPlayerString(secondInput, region2);

    const compareQuery = `${encodeURIComponent(player1)}==${encodeURIComponent(player2)}`;
    navigate(`/compare/${compareQuery}`);
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
      </div>
    </div>
  );
}
