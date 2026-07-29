import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchPage() {
  const [input, setInput] = useState("");
  const [secondInput, setSecondInput] = useState("");
  const [region1, setRegion1] = useState("EUW");
  const [region2, setRegion2] = useState("EUW");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!input.includes("#")) return alert("Используй формат Имя#Тег");

    const formattedName = input.replace("#", "-").replace(/\s/g, "_");
    navigate(`/profile/${encodeURIComponent(formattedName)}-${region1}`);
  };

  const Compare = () => {
    if (!secondInput.includes("#")) return alert("Используй формат Имя#Тег");
    if (!input.includes("#")) return alert("Используй формат Имя#Тег");

    const formattedName = input.replace("#", "-").replace(/\s/g, "_");
    const formattedSecondName = secondInput
      .replace("#", "-")
      .replace(/\s/g, "_");

    navigate(
      `/compare/${encodeURIComponent(formattedName)}-${region1}==${encodeURIComponent(formattedSecondName)}-${region2}`,
    );
  };

  return (
    <span>
      <div className="infoBorder">
        <div>if u have some idea dm me:</div>
        <div>
          discord: <strong>louise_francoise_de_la_valliere</strong>
        </div>
        <div>
          telegram: <strong>@MiniBggtg</strong>
        </div>
      </div>

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
              placeholder="player1#euw"
            />
            <button className="searchbtn" onClick={handleSearch}>
              Search
            </button>
          </div>

          <div className="secondinput">
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
              placeholder="player2#euw"
            />
            <button className="searchbtn" onClick={Compare}>
              Compare
            </button>
          </div>
        </div>
      </div>
    </span>
  );
}
