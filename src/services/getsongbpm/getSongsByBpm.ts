const apiKey = "7f4ee100c384a5b02d15d09906bceffd";
const baseTempoUrl = `https://api.getsongbpm.com/tempo/?api_key=${apiKey}&`;
const baseSearchUrl = `https://api.getsongbpm.com/search/?api_key=${apiKey}&`;

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

export const getSongBySongName = async (songName: string, artistName: string) => {
  const url = `${baseSearchUrl}type=both&lookup=song:${songName}artist:${artistName}`;
  const response = await fetch(url);
  const data = await response.json();
  
  return data.search;
};

export const getSongByArtistName = async (artistName: string) => {
  const url = `${baseSearchUrl}type=artist&lookup=${encodeURI(artistName)}`;
  const response = await fetch(url);
  const data = await response.json();

  return data.search;
};

export const getSongs = async (bpm: number, genres?: string[]): Promise<GSBSong[]> => {
  const url1 = `${baseTempoUrl}bpm=${bpm}&limit=100`;
  const url2 = `${baseTempoUrl}bpm=${bpm - 1}&limit=100`;
  const url3 = `${baseTempoUrl}bpm=${bpm + 1}&limit=100`;
  const response1 = await fetch(url1);
  const response2 = await fetch(url2);
  const response3 = await fetch(url3);
  const data1 = await response1.json();
  const data2 = await response2.json();
  const data3 = await response3.json();
  const songs1 = getSongsFromResponse(data1);
  const songs2 = getSongsFromResponse(data2);
  const songs3 = getSongsFromResponse(data3);
  const interleavedSongs = interleaveSongsResults(songs1, songs2, songs3);
  if (genres) {
    return filterSongs(interleavedSongs, genres);
  }
  return interleavedSongs;
};

// export const getGenres = async (bpm: number) => {
//   const songs: GSBSong[] = await getSongs(bpm);
//   const genres: string[] = [];
//   if (songs.length > 0) {
//     songs.forEach((song: GSBSong) => {
//       song.artist.genres &&
//         song.artist.genres.forEach((genre: string) => {
//           if (!genres.includes(genre)) {
//             genres.push(genre);
//           }
//         });
//     });
//     console.log(`Found ${genres.length} genres: `, genres);
//   }
// };

function interleaveSongsResults<T>(arr1: GSBSong[], arr2: GSBSong[], arr3: GSBSong[]): GSBSong[] {
  const result: GSBSong[] = [];

  // Determine the maximum length among the three arrays
  const maxLength = Math.max(arr1.length, arr2.length, arr3.length);

  for (let i = 0; i < maxLength; i++) {
    if (i < arr1.length) {
      result.push(arr1[i]);
    }
    if (i < arr2.length) {
      result.push(arr2[i]);
    }
    if (i < arr3.length) {
      result.push(arr3[i]);
    }
  }

  return result;
}
const filterSongs = (songs: GSBSong[], genres: string[]): GSBSong[] => {
  let filteredSongs: GSBSong[] = [];
  songs.map((song) => {
    const songGenres = song.artist.genres;
    if (songGenres) {
      songGenres.some((genre) => genres.includes(genre)) && filteredSongs.push(song);
    }
  });
  return filteredSongs;
};
