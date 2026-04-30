import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dota2SearchPage.css";

export default function SearchPage() {
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    const accountId = input;
    navigate(`/dota2/profile/${accountId}`);
  };

  return (
    <div>
      <input
        className="inputId"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button className="searchBtn" onClick={handleSearch}>
        Search
      </button>
    </div>
  );
}
