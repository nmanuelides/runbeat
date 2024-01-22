import React, {useRef, useState, useEffect} from 'react';
import './App.scss';
import { getSongs, Song } from '../src/services/getsongbpm/getSongsByBpm';
import { login, getAccessToken, getSpotifyUser, SpotifyUser } from '../src/services/spotify/authentication';
import { isUserAuthenticated } from './services/spotify/authenticationHelper';

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
          console.log('User is NOT authenticated');
          getAccessToken(code).then(() => {
            handleSpotifyConnected();
          });
        }
    },[]);

const handleSpotifyConnected = () => {
  setSpotifyIsConnected(true); 
  getSpotifyUser().then((spotifyUser) => {
    localStorage.setItem(SPOTIFY_USER_KEY, JSON.stringify(spotifyUser));
    spotifyUser && setSpotifyUser(spotifyUser);
    });
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
        Run to your beat
      </h1>
      <form className={'search-box'} onSubmit={onSubmit}>
        {!spotifyIsConnected && <button className='spotify-login' onClick={login}>Connect to Spotify</button>}
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
        {spotifyUser && <h1>Hello {spotifyUser.display_name}</h1>}
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
