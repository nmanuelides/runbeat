const apiKey = '7f4ee100c384a5b02d15d09906bceffd';
const baseUrl = `https://api.getsongbpm.com/tempo/?api_key=${apiKey}&`;

type GSBPMArtist = {
    id: string;
    name: string;
    uri: string;
    img: string;
    genres: string[];
    from: string;
    mbid: string;
}

export type Song = {
 song_id: string;
 song_title: string;
 song_uri: string;
 artist: GSBPMArtist;
 album: string[];
 tempo: number;
}

type GSBPMResponse = {
    tempo: Song[]
}

const getSongsFromResponse = (response: GSBPMResponse): Song[] => {
    return response.tempo;
}

export const getSongs = async (bpm: number, genre?: string): Promise<Song[]> => {
    const url = `${baseUrl}bpm=${bpm}`;
    const response = await fetch(url);
    const data = await response.json();
    const songs = getSongsFromResponse(data);
    return songs;
}

const getSongsByBPM = (bpm: number) => { 

}