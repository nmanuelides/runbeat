import { getStoragedAccessToken, responseOkOrThrowError } from "./authenticationHelper";
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { CLIENT_ID, CLIENT_SECRET, REDIRECT_URL, scopes } from './authentication';

const PLAYLISTS_LIMIT = 50;
const RUNBEAT_PLAYLIST_NAME = 'RunBeat 8km/h';

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

type CreatePlaylistRequest = {
    name: string;
    public?: boolean;
    collaborative?: boolean;
    description?: string;
}

export const getOrCreatePlaylist = async (userId: string, playlistName?: string) => {
    const spotifyApi = createSpotifyApi();
    if (spotifyApi) {
        const runBeatPlaylist = await searchRunBeatPlaylist(RUNBEAT_PLAYLIST_NAME, spotifyApi, userId);
        if (runBeatPlaylist) {
            return runBeatPlaylist;
        } 
        else {
            const newRunBeatPlaylist: CreatePlaylistRequest = {
                name: RUNBEAT_PLAYLIST_NAME,
                collaborative: false,
                public: true,
                description: 'Created using RunBeat.net, create yours for free now!'
            }
            return await spotifyApi.playlists.createPlaylist(userId, newRunBeatPlaylist).then((runBeatPlaylist)=> {
                console.log(`Playlist ${runBeatPlaylist.name} successfully created!`, runBeatPlaylist)
            });
        }
    } else {
    throw new Error('SPOTIFY_CLIENT_SECRET environment variable is not set');
}
}

function createSpotifyApi(): SpotifyApi | undefined {
    const accessToken = getStoragedAccessToken();
    let spotifyApi;
    if (accessToken) {
        spotifyApi = SpotifyApi.withAccessToken(CLIENT_ID, {
            access_token: accessToken.accessToken,
            token_type: accessToken.tokenType,
            expires_in: 3600,
            refresh_token: accessToken.refreshToken
        });
    }
    return spotifyApi;
}

async function searchRunBeatPlaylist(playlistName: string, spotifyApi: SpotifyApi, userId: string) {
    let playlistsLength:number = 0;
    do {
        let playlists = (await spotifyApi.playlists.getUsersPlaylists(userId, PLAYLISTS_LIMIT, playlistsLength)).items;
        console.log(playlists)
        const runBeatPlaylist = playlists.find(
            (playlist) => playlist.name === playlistName
          );
        if (runBeatPlaylist) {
            console.log('Playlist found!, named: ', runBeatPlaylist.name);
            return runBeatPlaylist;
        } else {
            playlistsLength = playlists.length;
        }
    }
    while(playlistsLength > 49)
}

export async function getCategories() {
    const spotifyApi = createSpotifyApi();
    let spotifyCategories;
    await spotifyApi?.browse.getCategories(undefined, undefined,50).then((categories) => {
        spotifyCategories = categories.categories.items
        console.log("This are the categories found: ",categories.categories.items);
    });
    return spotifyCategories;
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