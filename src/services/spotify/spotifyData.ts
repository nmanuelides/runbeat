import { getStoragedAccessToken, responseOkOrThrowError } from "./authenticationHelper";
import { Playlist, SpotifyApi, Track, TrackItem } from "@spotify/web-api-ts-sdk";
import { CLIENT_ID, CLIENT_SECRET, REDIRECT_URL, scopes } from "./authentication";

const PLAYLISTS_LIMIT = 50;
let spotifyApi: SpotifyApi;

export type ProfileImages = {
  url: string;
  height: number;
  width: number;
};

export type SpotifyUser = {
  id: string;
  display_name: string;
  externarl_urls: { spotify: string };
  email: string;
  explicit_content: { filter_enabled: boolean; filter_locked: boolean };
  images: ProfileImages[];
  product: string;
  country: string;
  uri: string;
};

type CreatePlaylistRequest = {
  name: string;
  public?: boolean;
  collaborative?: boolean;
  description?: string;
};

function createSpotifyApi(): SpotifyApi | undefined {
  if (spotifyApi) {
    return spotifyApi;
  }
  const accessToken = getStoragedAccessToken();
  let newSpotifyApi;
  if (accessToken) {
    newSpotifyApi = SpotifyApi.withAccessToken(CLIENT_ID, {
      access_token: accessToken.accessToken,
      token_type: accessToken.tokenType,
      expires_in: 3600,
      refresh_token: accessToken.refreshToken,
    });
  }
  return newSpotifyApi;
}

export const getOrCreatePlaylist = async (userId: string, playlistName: string) => {
  const spotifyApi = createSpotifyApi();
  if (spotifyApi) {
    const runBeatPlaylist = await searchRunBeatPlaylist(playlistName, spotifyApi, userId);
    if (runBeatPlaylist) {
      return runBeatPlaylist;
    } else {
      const newRunBeatPlaylist: CreatePlaylistRequest = {
        name: playlistName,
        collaborative: false,
        public: true,
        description: "Created using RunBeat.net, create yours for free now!",
      };
      let playlist;
      await spotifyApi.playlists.createPlaylist(userId, newRunBeatPlaylist).then((runBeatPlaylist) => {
        console.log(`Playlist ${runBeatPlaylist.name} successfully created!`, runBeatPlaylist);
        playlist = runBeatPlaylist;
      });
      return playlist;
    }
  } else {
    throw new Error("SPOTIFY_CLIENT_SECRET environment variable is not set");
  }
};

async function searchRunBeatPlaylist(playlistName: string, spotifyApi: SpotifyApi, userId: string) {
  let playlistsLength: number = 0;
  do {
    const playlists = (await spotifyApi.playlists.getUsersPlaylists(userId, PLAYLISTS_LIMIT, playlistsLength)).items;
    const runBeatPlaylist = playlists.find((playlist) => playlist.name === playlistName);
    if (runBeatPlaylist) {
      console.log("Playlist found!, named: ", runBeatPlaylist.name);
      return runBeatPlaylist;
    } else {
      playlistsLength = playlists.length;
    }
  } while (playlistsLength > 49);
}

export async function addSong(songName: string, artistName: string, userId: string, playlistName: string) {
  const songUri = await getSong(songName, artistName);
  const playlist = await getOrCreatePlaylist(userId, playlistName);
  if (songUri && playlist) {
    const songAdded = await addSongToRunBeatPlaylist(playlist.id, [songUri]);
    return songAdded;
  }
}

async function getSong(songName: string, artistName: string) {
  const accessToken: string | undefined = getStoragedAccessToken()?.accessToken;

  if (accessToken) {
    try {
      const formattedSongName: string = cleanSongName(songName);
      const url =
        "https://api.spotify.com/v1/search?query=track:" + formattedSongName + ", artist:" + artistName + "&type=track&limit=1";
      const response = await fetch(url, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      });
      const data = await response.json();
      responseOkOrThrowError(response, data);

      const songUri = data.tracks.items[0].uri;
      console.log("Song Found!", data);
      return songUri;
    } catch (error) {
      console.log("Song not found, attempting deepSearch...");
      const songUri = await deepSearch(songName, artistName, accessToken);
      if (songUri) {
        return songUri;
      }
      console.error({ error: "Song cannot be found" });
    }
  }
}

async function deepSearch(songName: string, artistName: string, accessToken: string) {
  let songUri: string | undefined = undefined;
  let amountOfSearchedSongs: number = 0;
  let resultsPage = 1;
  const formattedSongName: string = cleanSongName(songName);
  let url = "https://api.spotify.com/v1/search?query=track:" + formattedSongName + "&type=track&limit=50";
  do {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      });
      const data = await response.json();
      responseOkOrThrowError(response, data);
      const songs = data.tracks.items;
      url = data.tracks.next;
      songUri = findSongByArtistName(songs, artistName)?.uri;
      amountOfSearchedSongs = songs.length;
      console.log("Searching in results page: " + resultsPage);
      resultsPage++;
      if (songUri) {
        console.log("Song Found!", data);
        return songUri;
      }
    } catch (error) {
      console.error(error);
    }
  } while (amountOfSearchedSongs > 49);
}

function findSongByArtistName(songs: Track[], artistName: string): Track | undefined {
  const artistNameParts = artistName.split(/[,._+-]+/);
  return songs.find((song) => {
    return song.artists.some((artist) => {
      const artistNamePartsMatched = artist.name
        .split(/[\s,._+-]+/)
        .filter((part) => artistNameParts.some((namePart) => part.toLowerCase().includes(namePart.toLowerCase())));
      return artistNamePartsMatched.length > 0;
    });
  });
}

async function addSongToRunBeatPlaylist(playlistId: string, uris: string[]) {
  const spotifyApi = createSpotifyApi();
  if (spotifyApi) {
    try {
      spotifyApi.playlists.addItemsToPlaylist(playlistId, uris);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}

function cleanSongName(songName: string): string {
  return songName.replace(/'/g, '');
}


export async function getCategories() {
  const spotifyApi = createSpotifyApi();
  let spotifyCategories;
  await spotifyApi?.browse.getCategories(undefined, undefined, 50).then((categories) => {
    spotifyCategories = categories.categories.items;
    console.log("This are the categories found: ", categories.categories.items);
  });
  return spotifyCategories;
}

export const getSpotifyUser = async (): Promise<SpotifyUser | undefined> => {
  const accessToken: string | undefined = getStoragedAccessToken()?.accessToken;
  if (accessToken) {
    try {
      const url = "https://api.spotify.com/v1/me";
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
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
};
