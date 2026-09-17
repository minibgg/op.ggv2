import { createContext, useContext, useMemo, useState } from "react";

const RankThemeContext = createContext({
  rankColor: null,
  setRankColor: () => {},
});

export function RankThemeProvider({ children }) {
  const [rankColor, setRankColor] = useState(null);

  const value = useMemo(() => ({ rankColor, setRankColor }), [rankColor]);

  return (
    <RankThemeContext.Provider value={value}>
      {children}
    </RankThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRankTheme() {
  return useContext(RankThemeContext);
}
