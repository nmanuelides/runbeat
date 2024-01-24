const apiKey = "7f4ee100c384a5b02d15d09906bceffd";
const baseUrl = `https://api.getsongbpm.com/tempo/?api_key=${apiKey}&`;

type GSBArtist = {
  id: string;
  name: string;
  uri: string;
  img: string;
  genres: string[];
  from: string;
  mbid: string;
};

type GSBAlbum = {
  title: string;
  uri: string;
  img: string;
  year: number;
};

export type GSBSong = {
  song_id: string;
  song_title: string;
  song_uri: string;
  artist: GSBArtist;
  album: GSBAlbum[];
  tempo: number;
};

type GSBPMResponse = {
  tempo: GSBSong[];
};

const getSongsFromResponse = (response: GSBPMResponse): GSBSong[] => {
  return response.tempo;
};

export const getSongs = async (bpm: number, genre?: string): Promise<GSBSong[]> => {
  const url = `${baseUrl}bpm=${bpm}`;
  const response = await fetch(url);
  const data = await response.json();
  const songs = getSongsFromResponse(data);
  return songs;
};

export const getGenres = async (bpm: number) => {
  const songs: GSBSong[] = await getSongs(bpm);
  const genres: string[] = [];
  songs.forEach((song: GSBSong) => {
    song.artist.genres &&
      song.artist.genres.forEach((genre: string) => {
        if (!genres.includes(genre)) {
          genres.push(genre);
        }
      });
  });
  console.log(`Found ${songs.length} genres: `, genres);
};

const getSongsByBPM = (bpm: number) => {};
