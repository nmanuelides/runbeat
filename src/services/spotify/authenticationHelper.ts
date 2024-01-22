import {SpotifyAccessToken} from './authentication'

export const SPOTIFY_ACCESS_TOKEN = 'spotifyAccessToken';

export function saveAccessToken(spotifyAccessToken: SpotifyAccessToken) {
    localStorage.setItem(SPOTIFY_ACCESS_TOKEN, JSON.stringify(spotifyAccessToken));
}

export function saveResponseDataAsSpotifyAccessToken(data: any) {
    const accessToken: string = data.access_token;
    const refreshToken: string = data.refresh_token;
    const tokenType: string = data.token_type;
    const scope: string = data.scope;
    const expirationDate: Date = new Date(Date.now() + data.expires_in * 1000);
    const spotifyAccessToken = {accessToken, refreshToken, tokenType, scope, expirationDate};
    console.log("New Access Token: ", JSON.stringify(spotifyAccessToken));
    saveAccessToken(spotifyAccessToken);
}

export function getStoragedAccessToken(): SpotifyAccessToken | undefined {
    const dataString = localStorage.getItem(SPOTIFY_ACCESS_TOKEN)
    let spotifyAccessToken: SpotifyAccessToken | undefined;
    if (dataString) {
        spotifyAccessToken = storagedAccessTokenToSpotifyAccessToken(dataString);
    }
    return spotifyAccessToken;
}

export function storagedAccessTokenToSpotifyAccessToken(dataString: string) {
    const accessToken = JSON.parse(dataString).accessToken;
    const refreshToken = JSON.parse(dataString).refreshToken;
    const tokenType = JSON.parse(dataString).tokenType;
    const scope = JSON.parse(dataString).scope;
    const expirationDateString = JSON.parse(dataString).expirationDate;
    const expirationDate = new Date(expirationDateString);
    return { accessToken, expirationDate, refreshToken, tokenType, scope};
}


export function responseOkOrThrowError(response: Response, data: any) {
    if (!response.ok) {
        const errorType = data.error;
        const errorMessage = data.error_description;
        const error: Error = new Error(`HTTP error! status: ${response.status}\n Error type: ${errorType}\n Error message: ${errorMessage}`);
        error.name = errorMessage;
        throw error;
      }
}

export function isUserAuthenticated(): boolean {
    const now = new Date();
    const expirationDate = getStoragedAccessToken()?.expirationDate;
    if (expirationDate) {
        return !(now >= expirationDate);
    }
    return false;
}

export function removeCodeFromUrl() {
    const url = new URL(window.location.href);
    url.search = '';
    window.history.replaceState(null, '', url.toString());
}
