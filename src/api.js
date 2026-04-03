const API_KEY = import.meta.env.VITE_RIOT_KEY;

const regions = {
    EUW: "euw1.api.riotgames.com",
    EUNE: "eun1.api.riotgames.com",
    NA: "na1.api.riotgames.com",
    KR: "kr.api.riotgames.com",
    RU: "ru.api.riotgames.com",
    BR: "br1.api.riotgames.com",
    TR: "tr1.api.riotgames.com",
};

const clusters = {
    EUROPE: "europe.api.riotgames.com",
    ASIA: "asia.api.riotgames.com",
    AMERICAS: "americas.api.riotgames.com",
};

const riotApi = {
    async getPuuidByNameTag(gameName, tagLine, cluster) {
        const res = await fetch(
            `https://${cluster}/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${API_KEY}`
        );
        const data = await res.json();
        return data;
    }
};


export { riotApi, regions, clusters };