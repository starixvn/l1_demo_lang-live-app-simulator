import configs from '@/configs';
import axios from 'axios';


interface SignInParams {
  playerId?: string;
  gameId?: number;
  language?: string;
  currency?: string;
  operatorId?: string;
  operatorSecret?: string;
}

export const signIn = async (params: SignInParams) => {
  try {
    const { playerId, gameId, language, currency, operatorId, operatorSecret } = params;
    const browserUserAgent = "ReactNative";

    const randomPlayerId = Math.floor(Math.random() * 10000000).toString();
    const id = playerId || randomPlayerId;
    
    const apiParams = {
      seq: "d,y,lumi",
      siteId: "4100300",
      domain: "example.com",
      browserUserAgent,
      currency: currency || "UUS",
      language: language || "en-US",
      ip: "0",
      playerId: id,
      playerName: `username_${id}`,
      gameId: gameId || 134,
      appType: 9,
      siteName: "DemoLanglive",
      auth: {
        operatorId: operatorId || configs.operatorId,
        operatorSecret: operatorSecret || configs.operatorSecret,
      },
      operatorToken: "PFFToken",
      isCash: true,
      ref: "m_direct",
    };

    const operator = (operatorId || configs.operatorId) === "PFF" ? "pff" : "ow";
    
    // Set default balance
    const responseBalance = await axios.post(
      `${configs.owApiUrl}/SetDefaultBalance?playerId=${id}&operator=${operator}&balance=20000&siteId=4100300`
    );

    console.log("responseBalance :::", responseBalance.data);
    
    
    if (responseBalance.status !== 200) {
      console.log("Failed to set default balance");
      return;
    }
    
    // Sign in
    const responseSSO = await axios.post(
      `${configs.simulatorUrl}/signin/sso`,
      apiParams
    );

    return responseSSO.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to process request";
    console.error("Sign-in error:", errorMessage);
    throw new Error(errorMessage);
  }
}; 