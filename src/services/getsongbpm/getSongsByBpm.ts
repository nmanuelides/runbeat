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
  const limit = "50";
  const url1 = `${baseTempoUrl}bpm=${bpm}&limit=${limit}`;
  const url2 = `${baseTempoUrl}bpm=${bpm - 1}&limit=${limit}`;
  const url3 = `${baseTempoUrl}bpm=${bpm + 1}&limit=${limit}`;
  const response1 = await fetch(url1);
  const response2 = await fetch(url2);
  const response3 = await fetch(url3);
  const data1 = await response1.json();
  const data2 = await response2.json();
  const data3 = await response3.json();
  const songs1 = getSongsFromResponse(data1);
  const songs2 = getSongsFromResponse(data2);
  const songs3 = getSongsFromResponse(data3);
  let interleavedSongs: GSBSong[] = [];
  if (bpm >= 82) {
    const url4 = `${baseTempoUrl}bpm=${Math.round(bpm / 2)}&limit=${limit}`;
    const url5 = `${baseTempoUrl}bpm=${Math.round(bpm / 2) - 1}&limit=${limit}`;
    const url6 = `${baseTempoUrl}bpm=${Math.round(bpm / 2) + 1}&limit=${limit}`;
    const response4 = await fetch(url4);
    const response5 = await fetch(url5);
    const response6 = await fetch(url6);
    const data4 = await response4.json();
    const data5 = await response5.json();
    const data6 = await response6.json();
    const songs4 = getSongsFromResponse(data4);
    const songs5 = getSongsFromResponse(data5);
    const songs6 = getSongsFromResponse(data6);
    interleavedSongs = interleaveSongsResults(songs1, songs2, songs3, songs4, songs5, songs6);
  } else {
    interleavedSongs = interleaveSongsResults(songs1, songs2, songs3);
  }
  if (genres && genres.length > 0) {
    return filterSongs(interleavedSongs, genres);
  }
  return interleavedSongs;
};

// function interleaveSongsResults<T>(arr1: GSBSong[], arr2: GSBSong[], arr3: GSBSong[]): GSBSong[] {
//   const result: GSBSong[] = [];

//   // Determine the maximum length among the three arrays
//   const maxLength = Math.max(arr1.length, arr2.length, arr3.length);

//   for (let i = 0; i < maxLength; i++) {
//     if (i < arr1.length) {
//       result.push(arr1[i]);
//     }
//     if (i < arr2.length) {
//       result.push(arr2[i]);
//     }
//     if (i < arr3.length) {
//       result.push(arr3[i]);
//     }
//   }

//   return result;
// }

function interleaveSongsResults<T>(...arrays: GSBSong[][]): GSBSong[] {
  const result: GSBSong[] = [];

  // Keep track of the current index for each array
  const indices: number[] = arrays.map(() => 0);

  // Loop until all arrays are empty
  while (arrays.some((arr) => arr.length > 0)) {
    // Loop over each array
    for (let i = 0; i < arrays.length; i++) {
      // Get the current array and index
      const arr = arrays[i];
      const index = indices[i];

      // If the array is not empty, push the element at the index to the result
      if (arr.length > 0) {
        result.push(arr[index]);
      }

      // Increment the index and remove the element from the array
      indices[i]++;
      arr.shift();
    }
  }

  return result;
}

const filterSongs = (songs: GSBSong[], genres: string[]): GSBSong[] => {
  let filteredSongs: GSBSong[] = [];
  songs.map((song) => {
    if (song) {
      const songGenres = song.artist.genres;
      if (songGenres) {
        songGenres.some((genre) => genres.includes(genre)) && filteredSongs.push(song);
      }
    }
  });
  return filteredSongs;
};
