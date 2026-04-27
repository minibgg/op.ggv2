import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchPage() {
  const [input, setInput] = useState("");
  const [secondInput, setSecondInput] = useState("");
  const [region, setRegion] = useState("EUW");
  const [region2, setRegion2] = useState("EUW");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!input.includes("#")) return alert("Используй формат Имя#Тег");
    const formattedName = input.replace("#", "-").replace(/\s/g, "_");
    navigate(`/profile/${encodeURIComponent(formattedName)}-${region}`);
  };

  const goToHeroTracker = () => {
    navigate("/heroTracker");
  };

  const compare = () => {
    if (!input.includes("#") || !secondInput.includes("#"))
      return alert("Используй формат Имя#Тег");
    const formatted1 = input.replace("#", "-").replace(/\s/g, "_");
    const formatted2 = secondInput.replace("#", "-").replace(/\s/g, "_");
    navigate(
      `/compare/${encodeURIComponent(formatted1)}-${region}==${encodeURIComponent(formatted2)}-${region2}`,
    );
  };

  return (
    <div className="searchPageMain">
      <div className="searchStack">
        <div className="maininput">
          <select
            className="regioninput"
            onChange={(e) => setRegion(e.target.value)}
            value={region}
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
            placeholder="MishaCrazy#RU1"
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
            placeholder="Aura Farmium#RUNit"
          />
          <button className="searchbtn" onClick={compare}>
            Compare
          </button>
        </div>
      </div>
    </div>
  );
}
