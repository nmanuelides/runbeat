import { getStoragedAccessToken, responseOkOrThrowError, saveResponseDataAsSpotifyAccessToken, removeCodeFromUrl } from "./authenticationHelper";
export const SPOTIFY_ACCESS_TOKEN = 'spotifyAccessToken';
const CLIENT_ID = "568e590db3bc49a1b13394b284de1d41";
const CLIENT_SECRET = "08baca57ed6d4ba9999d059d12734d87";
const REDIRECT_URL = "http://localhost:3000";
const scopes = ['user-read-private', 'playlist-modify-public'];
const EXPIRED_ACCESS_TOKEN_ERROR = 'Authorization code expired';


export type ProfileImages = {
    url: string;
    height: number;
    width: number;
}

export type SpotifyUser = {
    id: string;
    display_name: string;
    externarl_urls: {spotify: string};
    email: string;
    explicit_content: {filter_enabled: boolean, filter_locked: boolean};
    images: ProfileImages[];
    product: string;
    country: string;
    uri: string;
}

export type SpotifyAccessToken = {
    accessToken: string;
    expirationDate: Date;
    refreshToken: string;
    tokenType: string;
    scope: string;
}

export function login () {
    const url = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URL)}&scope=${encodeURIComponent(scopes.join(' '))}&show_dialog=true`;
    window.location.href = url;
}

export const getAccessToken = async (code: string) => {
    try {
        const url = 'https://accounts.spotify.com/api/token';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              code: code,
              redirect_uri: REDIRECT_URL
            })
          });

          const data = await response.json();
          responseOkOrThrowError(response, data);
          removeCodeFromUrl();
          saveResponseDataAsSpotifyAccessToken(data);
    } catch (error) {
        if((error as Error).name === EXPIRED_ACCESS_TOKEN_ERROR) {
            const spotifyAccessToken: SpotifyAccessToken | undefined = getStoragedAccessToken();
            if(spotifyAccessToken) {
                console.log("Refreshing access token!");
                refreshToken(spotifyAccessToken.refreshToken);
            }
        }
        console.log(error);
    }
}

async function refreshToken(refreshToken: string) {
    try {
        const url = 'https://accounts.spotify.com/api/token';
        const authString = `${CLIENT_ID}:${CLIENT_SECRET}`;
        const authHeader = `Basic ${btoa(authString)}`;
      
        const payload = new URLSearchParams();
        payload.append('grant_type', 'refresh_token');
        payload.append('refresh_token', refreshToken);
      
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': authHeader
          },
          body: payload
        });
      
        const data = await response.json();
        responseOkOrThrowError(response, data);
      
        saveResponseDataAsSpotifyAccessToken(data);
    } catch (error) {
        console.log(error);
    }
  }

export const getSpotifyUser = async (): Promise<SpotifyUser | undefined> => { 
    const accessToken: string | undefined = getStoragedAccessToken()?.accessToken;
    if (accessToken) {
      try {
        const url = 'https://api.spotify.com/v1/me';
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        
        const data = await response.json();
        responseOkOrThrowError(response, data);
        
        const user = await data;
        return user;
      } catch (error) {
        console.error(error);
      }
    }
    return undefined;
}
