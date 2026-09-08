import { useState, useEffect } from "react";
import { getSummonerSpellsMap } from "../../service/RiotService";

let globalSpellsMap = null;
let spellsPromise = null;

export function useSummonerSpells() {
  const [spells, setSpells] = useState(() => globalSpellsMap);

  useEffect(() => {
    if (globalSpellsMap) return;

    if (!spellsPromise) {
      spellsPromise = getSummonerSpellsMap().then((map) => {
        globalSpellsMap = map;
        return map;
      });
    }

    spellsPromise.then((map) => setSpells(map));
  }, []);

  return spells;
}
