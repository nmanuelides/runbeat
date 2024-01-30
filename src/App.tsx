import React, { useRef, useState, useEffect } from "react";
import "./App.scss";
import "./mobile.scss";
import { getGenres, getSongs, GSBSong } from "../src/services/getsongbpm/getSongsByBpm";
import { login, getAccessToken } from "../src/services/spotify/authentication";
import { SpotifyUser, getCategories, getOrCreatePlaylist, getSpotifyUser } from "./services/spotify/spotifyData";
import { isUserAuthenticated } from "./services/spotify/authenticationHelper";
import Toggle from "./components/toggle/src/Toggle";
import Song from "../src/components/song/src/Song";

function App() {
  const playlistName = "RunBeat Playlist";
  const SPOTIFY_USER_KEY = "spotifyUser";
  const inputRef = useRef<HTMLInputElement | null>(null);
  const speedInputRef = useRef<HTMLInputElement | null>(null);
  const heightInputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<GSBSong[]>([]);
  const [spotifyUser, setSpotifyUser] = useState<SpotifyUser>();
  const [spotifyIsConnected, setSpotifyIsConnected] = useState<boolean>();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");
    if (isUserAuthenticated()) {
      console.log("User is authenticated");
      setSpotifyIsConnected(true);
      const storagedUser = localStorage.getItem(SPOTIFY_USER_KEY);
      storagedUser && setSpotifyUser(JSON.parse(storagedUser));
    } else if (code) {
      setSpotifyIsConnected(false);
      console.log("User is NOT authenticated");
      getAccessToken(code).then(() => {
        handleSpotifyConnected();
      });
    } else {
      setSpotifyIsConnected(false);
      console.log("User is NOT authenticated");
    }
  }, []);

  const handleSpotifyConnected = () => {
    if (isUserAuthenticated()) {
      setSpotifyIsConnected(true);
      getSpotifyUser().then((spotifyUser) => {
        localStorage.setItem(SPOTIFY_USER_KEY, JSON.stringify(spotifyUser));
        spotifyUser && setSpotifyUser(spotifyUser);
      });
    }
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const inputValue = inputRef.current?.value;
    setIsLoading(true);

    try {
      const results = await getSongs(Number(inputValue));
      getGenres(Number(inputValue));
      setSearchResults(results);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="App">
        <header className="title">RUNBEAT.</header>
        <h1 className="subtitle">Run to the beat</h1>
        <div className={"search-box"}>
          <div className="tools-container">
            <div className="setting-container">
              <Toggle title="Speed" type="speed" />
              <input
                name="searchInput"
                className="setting-container__input"
                type="number"
                ref={speedInputRef}
                autoComplete="off"
                placeholder="speed"
              />
            </div>
            <div className="setting-container">
              <Toggle title="Height" type="height" />
              <input
                name="searchInput"
                className="setting-container__input"
                type="number"
                ref={heightInputRef}
                autoComplete="off"
                placeholder="height"
              />
            </div>
          </div>
          <div className="search-box__header">
            <div className="search-box__buttons-container">
              {!spotifyIsConnected && (
                <>
                  <button className="spotify-login-button" onClick={login} type="button">
                    Connect to Spotify
                  </button>
                  <span>Connect to your spotify account to create a playlist and start adding songs!</span>
                </>
              )}
            </div>
          </div>
          <form className="search-box__form" onSubmit={onSubmit}>
            <div className={"search-box__input-container"}>
              <div className="search-box__input-text-container">
                <input
                  name="searchInput"
                  className={isLoading ? "search-box__input-text-disabled" : "search-box__input-text"}
                  type="text"
                  ref={inputRef}
                  autoComplete="off"
                  placeholder="Enter bpm..."
                />
              </div>
              <button className={"search-box__button"} type="submit" disabled={isLoading}>
                BUSCAR
              </button>
            </div>
          </form>
        </div>
        {searchResults.length > 0 && (
          <ul className="results-list">
            {searchResults.map((song) => {
              return <Song key={song.song_id} song={song} userId={spotifyUser?.id} />;
            })}
          </ul>
        )}
      </div>
    </>
  );
}

export default App;