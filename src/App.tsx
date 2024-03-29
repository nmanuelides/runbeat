import React, { useRef, useState, useEffect, useContext } from "react";
import "./App.scss";
import "./mobile.scss";
import { getSongs, getSongBySongName, GSBSong } from "../src/services/getsongbpm/getSongsByBpm";
import { login, getAccessToken } from "../src/services/spotify/authentication";
import { SpotifyUser, getSpotifyUser } from "./services/spotify/spotifyData";
import { isUserAuthenticated } from "./services/spotify/authenticationHelper";
import Toggle, { ToggleType } from "./components/toggle/src/Toggle";
import Song from "../src/components/song/src/Song";
import { ShowSnackbarContext } from "./contexts/showSnackbarContext";
import { SearchFormContext } from "./contexts/searchFormContext";
import { GenresContext } from "./contexts/genresContext";
import Snackbar, { SnackbarProps } from "./components/snackbar/src/Snackbar";
import { getSPM } from "./helpers/formulaHelper";
import TabsContainer from "./components/tabs-container/src/TabsContainer";

function App() {
  const BASE_PLAYLIST_NAME = "RunBeat";
  const SPOTIFY_USER_KEY = "spotifyUser";
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
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  let speed: number;
  let speedUnit: "kmh" | "mph" = "kmh";
  let height: number;
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('from') === 'portfolio') {
      document.getElementsByClassName('curtain-off')[0].classList.add('curtain-on');
    }
  }, []);

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

  const onSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
    songName?: string,
    artistName?: string,
    songBPM?: number
  ) => {
    event.preventDefault();
    speed = Number(speedInputRef.current?.value.trim());
    height = Number(heightInputRef.current?.value.trim());
    setIsLoading(true);

    try {
      let searchParam: string | number;
      let results: GSBSong[] = [];
      if (songBPM) {
        //Search by BPM
        results = await getSongs(songBPM, selectedGenres);
      } else if (songName && artistName) {
        //Search by song name
        results = await getSongBySongName(songName, artistName);
      } else {
        //Auto Suggest
        results = await getSongs(getSPM(speed, height, speedUnit, heightUnit), selectedGenres);
      }
      searchParam = getSPM(speed, height, speedUnit, heightUnit);
      if (results.length > 0) {
        console.log("Songs found: " + results.length);
        setSearchResults(results);
      } else {
        setSearchResults(results);
        setSnackbarMessage("No songs found");
        setSnackbarType("error");
        setShowSnackbar(true);
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
    <GenresContext.Provider value={{ selectedGenres, setSelectedGenres }}>
      <SearchFormContext.Provider value={{ isLoading, onSubmit }}>
        <ShowSnackbarContext.Provider value={{ showSnackbar, setShowSnackbar }}>
          <div className="App">
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
              {!spotifyIsConnected && (
                <div className="search-box__buttons-container">
                  <button className="spotify-login-button" onClick={login} type="button">
                    Connect to Spotify
                  </button>
                  <span>Connect to your spotify account to create a playlist and start adding songs!</span>
                </div>
              )}
              <TabsContainer />
            </div>
            {searchResults.length > 0 && (
              <ul className="results-list">
                {searchResults.map((song) => {
                  if(song) {
                    return (
                      <Song
                        key={song.song_id}
                        song={song}
                        userId={spotifyUser?.id}
                        playlistName={`${BASE_PLAYLIST_NAME} ${speedInputRef.current?.value.trim()}${
                          speedUnit === "kmh" ? "km/h" : speedUnit
                        }`}
                      />
                    );
                  }
                })}
              </ul>
            )}
          </div>
          <Snackbar message={snackbarMessage} type={snackbarType} />
        </ShowSnackbarContext.Provider>
      </SearchFormContext.Provider>
    </GenresContext.Provider>
  );
}

export default App;
