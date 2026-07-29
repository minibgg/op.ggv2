import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchPage() {
  const [input, setInput] = useState("");
  const [secondInput, setSecondInput] = useState("");
  const [region, setRegion] = useState("EUW");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!input.includes("#")) return alert("Используй формат Имя#Тег");

    const formattedName = input.replace("#", "-").replace(/\s/g, "_");
    navigate(`/profile/${encodeURIComponent(formattedName)}-${region}`);
  };
  // const goToHeroTracker = () => {
  //   navigate("/heroTracker");
  // };
  const Compare = () => {
    if (!secondInput.includes("#")) return alert("Используй формат Имя#Тег");
    if (!input.includes("#")) return alert("Используй формат Имя#Тег");
    const formattedName = input.replace("#", "-").replace(/\s/g, "_");
    const formattedSecondName = secondInput
      .replace("#", "-")
      .replace(/\s/g, "_");
    navigate(
      `/compare/${encodeURIComponent(formattedName)}-${region}==${encodeURIComponent(formattedSecondName)}-${region}`,
    );
  };
  // const goToDotaTracker = () => {
  //   navigate("/Dota2/Search");
  // };

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
      {/* <button onClick={goToDotaTracker}>dota 2</button> */}
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
              placeholder="player1#euw"
            />
            <button className="searchbtn" onClick={handleSearch}>
              Search
            </button>
          </div>
          <div className="secondinput">
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
//test
//MishaCrazy#RU1
//СРУ МЯСОМ#RUNIT
//ADmidpermalose#01irl
