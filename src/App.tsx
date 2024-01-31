import React, { useRef, useState, useEffect } from "react";
import "./App.scss";
import "./mobile.scss";
import { getSongs, GSBSong } from "../src/services/getsongbpm/getSongsByBpm";
import { login, getAccessToken } from "../src/services/spotify/authentication";
import { SpotifyUser, getSpotifyUser } from "./services/spotify/spotifyData";
import { isUserAuthenticated } from "./services/spotify/authenticationHelper";
import Toggle, { ToggleType } from "./components/toggle/src/Toggle";
import Song from "../src/components/song/src/Song";
import { ShowSnackbarContext } from "./contexts/showSnackbarContext";
import Snackbar, { SnackbarProps } from "./components/snackbar/src/Snackbar";
import { getSPM } from "./helpers/formulaHelper";

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
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<SnackbarProps["type"]>("error");
  const [heightUnit, setHeightUnit] = useState<"cm" | "in">("cm");
  let speed: number;
  let speedUnit: "kmh" | "mph" = "kmh";
  let height: number;

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
    speed = Number(speedInputRef.current?.value);
    height = Number(heightInputRef.current?.value);
    setIsLoading(true);

    try {
      const searchParam = inputValue ? Number(inputValue) : getSPM(speed, height, speedUnit, heightUnit);
      const results = await getSongs(searchParam);
      if (results.length > 0) {
        console.log("Songs found: " + results.length);
        setSearchResults(results);
      } else {
        setSnackbarMessage("No songs found");
        setSnackbarType("error");
        setSearchResults(results);
      }
    } catch (error) {
      setShowSnackbar(true);
      setSnackbarMessage("An error ocurred trying to search for songs, please try again later.");
      setSnackbarType("error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (type: ToggleType, e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "speed") {
      speedUnit = e.target.checked ? "mph" : "kmh";
    } else {
      setHeightUnit(e.target.checked ? "in" : "cm");
    }
    console.log(
      type + " Toogle is: ",
      type === "speed" ? (e.target.checked ? "mph" : "kmh") : e.target.checked ? "in" : "cm"
    );
  };

  return (
    <ShowSnackbarContext.Provider value={{ showSnackbar, setShowSnackbar }}>
      <div className="App">
        <header className="title">RUNBEAT.</header>
        <h1 className="subtitle">Run to the beat</h1>
        <div className={"search-box"}>
          <div className="tools-container">
            <div className="setting-container">
              <Toggle title="Speed" type="speed" handleToggle={handleToggle} />
              <input
                name="speedInput"
                className="setting-container__input"
                type="number"
                ref={speedInputRef}
                autoComplete="off"
                placeholder="i.e: 8"
              />
            </div>
            <div className="setting-container">
              <Toggle title="Height" type="height" handleToggle={handleToggle} />
              <input
                name="heightInput"
                className="setting-container__input"
                type="number"
                ref={heightInputRef}
                autoComplete="off"
                placeholder={heightUnit === "cm" ? "i.e: 178" : "i.e 70.7"}
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
              {/* <input
                  name="searchInput"
                  className={isLoading ? "search-box__input-text-disabled" : "search-box__input-text"}
                  type="text"
                  ref={inputRef}
                  autoComplete="off"
                  placeholder="Enter bpm..."
                /> */}
              <button className={"search-box__button"} type="submit" disabled={isLoading}>
                SEARCH
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
      <Snackbar message={snackbarMessage} type={snackbarType} />
    </ShowSnackbarContext.Provider>
  );
}

export default App;
