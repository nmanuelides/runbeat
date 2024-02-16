import {
  getStoragedAccessToken,
  responseOkOrThrowError,
  saveResponseDataAsSpotifyAccessToken,
  removeCodeFromUrl,
} from "./authenticationHelper";
export const SPOTIFY_ACCESS_TOKEN = "spotifyAccessToken";
export const CLIENT_ID = "568e590db3bc49a1b13394b284de1d41";
export const CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET;
export const REDIRECT_URL = "http://localhost:3000/";
// export const REDIRECT_URL = "https://nmanuelides.github.io/runbeat/";
export const scopes = ["user-read-private", "playlist-modify-public", "playlist-modify-private", "ugc-image-upload"];
const EXPIRED_ACCESS_TOKEN_ERROR = "Authorization code expired";

export type SpotifyAccessToken = {
  accessToken: string;
  expirationDate: Date;
  refreshToken: string;
  tokenType: string;
  scope: string;
};

export function login() {
  const url = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
    REDIRECT_URL
  )}&scope=${encodeURIComponent(scopes.join(" "))}&show_dialog=true`;
  window.location.href = url;
}

export const getAccessToken = async (code: string) => {
  try {
    const url = "https://accounts.spotify.com/api/token";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URL,
      }),
    });

    const data = await response.json();
    responseOkOrThrowError(response, data);
    removeCodeFromUrl();
    saveResponseDataAsSpotifyAccessToken(data);
  } catch (error) {
    if ((error as Error).name === EXPIRED_ACCESS_TOKEN_ERROR) {
      const spotifyAccessToken: SpotifyAccessToken | undefined = getStoragedAccessToken();
      if (spotifyAccessToken) {
        console.log("Refreshing access token!");
        refreshToken(spotifyAccessToken.refreshToken);
      }
    }
    console.log(error);
  }
};

async function refreshToken(refreshToken: string) {
  try {
    const url = "https://accounts.spotify.com/api/token";
    const authString = `${CLIENT_ID}:${CLIENT_SECRET}`;
    const authHeader = `Basic ${btoa(authString)}`;

    const payload = new URLSearchParams();
    payload.append("grant_type", "refresh_token");
    payload.append("refresh_token", refreshToken);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: authHeader,
      },
      body: payload,
    });

    const data = await response.json();
    responseOkOrThrowError(response, data);

    saveResponseDataAsSpotifyAccessToken(data);
  } catch (error) {
    console.log(error);
  }
}
