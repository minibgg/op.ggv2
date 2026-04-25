import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchPage() {
  const [input, setInput] = useState("");
  const [region, setRegion] = useState("EUW");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!input.includes("#")) return alert("Используй формат Имя#Тег");

    const formattedName = input.replace("#", "-").replace(/\s/g, "_");
    navigate(`/profile/${encodeURIComponent(formattedName)}-${region}`);
  };
  const goToHeroTracker = () => {
    navigate("/heroTracker");
  };

  return (
    <div>
      <button className="searchbtn" onClick={goToHeroTracker}>
        Hero Tracker
      </button>
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
    </div>
  );
}
//test
//MishaCrazy#RU1
//СРУ МЯСОМ#RUNIT
//ADmidpermalose#01irl
