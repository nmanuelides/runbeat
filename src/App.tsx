import React, {useRef, useState, useEffect} from 'react';
import './App.scss';
import { getSongs, Song } from '../src/services/getsongbpm/getSongsByBpm';
import { login, getAccessToken } from '../src/services/spotify/authentication';
import { SpotifyUser, getOrCreatePlaylist, getSpotifyUser } from './services/spotify/data';
import { isUserAuthenticated } from './services/spotify/authenticationHelper';
import Toggle from './components/toggle/src/Toggle';

function App() {
  const SPOTIFY_USER_KEY = 'spotifyUser';
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [spotifyUser, setSpotifyUser] = useState<SpotifyUser>();
  const [spotifyIsConnected, setSpotifyIsConnected] = useState<boolean>()


  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    console.log('userEffect called!!');
      if (isUserAuthenticated()) {
        console.log('User is authenticated');
        setSpotifyIsConnected(true);
        const storagedUser = localStorage.getItem(SPOTIFY_USER_KEY);
        storagedUser && setSpotifyUser(JSON.parse(storagedUser)) 
        } else if (code) {
          setSpotifyIsConnected(false);
          console.log('User is NOT authenticated');
          getAccessToken(code).then(() => {
          handleSpotifyConnected();
          });
        } else {
          setSpotifyIsConnected(false);
          console.log('User is NOT authenticated');
        }
    },[]);

const handleSpotifyConnected = () => {
  if(isUserAuthenticated()) {
    setSpotifyIsConnected(true); 
    getSpotifyUser().then((spotifyUser) => {
      localStorage.setItem(SPOTIFY_USER_KEY, JSON.stringify(spotifyUser));
      spotifyUser && setSpotifyUser(spotifyUser);
      });

  }
}

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const inputValue = inputRef.current?.value;
    setIsLoading(true);

    try {
      const results = await getSongs(Number(inputValue));
      setSearchResults(results);
      console.log(results.length);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="App">
      <header className="title">
        RUNBEAT.
      </header>
      <h1 className="subtitle">
        Run to the beat
      </h1>
      <form className={'search-box'} onSubmit={onSubmit}>
        <div className='tools-container'>
          <Toggle title='Kmh/Mph'/>
          <Toggle title='Speed/Pace'/>
        </div>
        <div className='search-box__header'>
          <div className='search-box__buttons-container'>
            {!spotifyIsConnected && <button className='spotify-login' onClick={login} type="button">Connect to Spotify</button>}
            <button className='get-playlists spotify-login' onClick={()=> {spotifyUser&& getOrCreatePlaylist(spotifyUser.id)}} type="button">Get Playlists</button>
          </div>
          {spotifyUser && <h1 className='user-name'>Hello {spotifyUser.display_name}</h1>}
        </div>
      <div className={'search-box__input-container'}>
        <div className='search-box__input-text-container'>
        <input
          name='searchInput'
          className={isLoading ? 'search-box__input-text-disabled' : 'search-box__input-text'}
          type="text"
          ref={inputRef}
          autoComplete="off"
          placeholder="Enter bpm..."
          disabled={isLoading}
        />
        </div>
        <button className={isLoading ? 'search-box__button-disabled' : 'search-box__button'} type='submit'disabled={isLoading}>
          BUSCAR
        </button>
      </div>
        </form>
        {searchResults.length > 0 &&
        <ul className='results-list'>
          {searchResults.map((song) => {
            return <li key={song.song_id} className='song'>
              <span className='song__title'>{song.song_title}</span>
              <span className='song__artist-name'>{song.artist.name}</span>
              <span className='song__genres'>{song.artist.genres}</span>
              <span className='song__tempo'>{song.tempo}</span>
              <a href={song.song_uri} className='song__link'>{song.song_uri}</a>
            </li>
          })}
        </ul>
          }
          <a className='footer-link' href='https://getsongbpm.com/' target='blank'>Powered by getSongBPM</a>
    </div>
  );
}

export default App;
