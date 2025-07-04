import configJson from "./configs.json";

const configs = {
  env: configJson.env || "DEV",
  baseUrl: configJson.baseUrl || "http://localhost:3000",
  port: configJson.port || 3000,
  simulatorUrl: configJson.simulatorUrl || "https://l2-glbs1.lumigame.com",
  owApiUrl: configJson.owApiUrl || "https://l2-ows1.lumigame.com/SabaClub",
  operatorId: configJson.operatorId || "ONEworksVGCash",
  operatorSecret: configJson.operatorSecret || "VG@SC123",
};

export default configs;
