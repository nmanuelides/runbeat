import React, {useRef, useState, useEffect} from 'react';
import './App.scss';
import {getSongs, Song} from '../src/services/getsongbpm/getSongsByBpm';
import {login, getAccessToken, getSpotifyUser, SpotifyUser} from '../src/services/spotify/authentication';

function App() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [spotifyAcessToken, setSpotifyAccessToken] = useState<string>();
  const [spotifyUser, setSpotifyUser] = useState<SpotifyUser>();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    if (code && !spotifyAcessToken) {
      getAccessToken(code)
        .then(accessToken => {
          console.log("Requested Access Token: ", accessToken);
          setSpotifyAccessToken(accessToken);
          setSpotifyUser(getSpotifyUser(accessToken));
          console.log("User: ", getSpotifyUser(accessToken));
        })
        .catch(error => {
          console.error(error);
          // handle the error here
        });
    }
  }, [spotifyAcessToken])

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
      <header className="App-header">
        RUNBEAT.
      </header>
      <form className={'search-box'} onSubmit={onSubmit}>
      <div className={'search-box__input-container'}>
        <div className='search-box__input-text-container'>
          <button className='spotify-login' onClick={login}>Connect to Spotify</button>
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
