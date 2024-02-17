import React, { useRef, useState, useEffect } from "react";
import "./App.scss";
import "./mobile.scss";
import { getSongs, getSongByArtistName, getSongBySongName, GSBSong } from "../src/services/getsongbpm/getSongsByBpm";
import { login, getAccessToken } from "../src/services/spotify/authentication";
import { SpotifyUser, getSpotifyUser } from "./services/spotify/spotifyData";
import { isUserAuthenticated } from "./services/spotify/authenticationHelper";
import Toggle, { ToggleType } from "./components/toggle/src/Toggle";
import Song from "../src/components/song/src/Song";
import { ShowSnackbarContext } from "./contexts/showSnackbarContext";
import Snackbar, { SnackbarProps } from "./components/snackbar/src/Snackbar";
import { getSPM } from "./helpers/formulaHelper";
import { getSBPMGenres } from "./helpers/genres";
import Tag from "../src/components/tags/src/Tag";

function App() {
  const BASE_PLAYLIST_NAME = "RunBeat";
  const SPOTIFY_USER_KEY = "spotifyUser";
  const DEFAULT_TAGS_CONTAINER_CLASS = "tags-container";
  const songNameinputRef = useRef<HTMLInputElement | null>(null);
  const artistNameinputRef = useRef<HTMLInputElement | null>(null);
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
  const [tagsClass, setTagsClass] = useState<string>(DEFAULT_TAGS_CONTAINER_CLASS + "__tags");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [searchByName, setSearchByName] = useState<boolean>(true);
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
    const inputValue = songNameinputRef.current?.value;
    const artistNameInputValue = artistNameinputRef.current?.value;
    speed = Number(speedInputRef.current?.value.trim());
    height = Number(heightInputRef.current?.value.trim());
    setIsLoading(true);

    try {
      // const searchParam = inputValue ? Number(inputValue) : getSPM(speed, height, speedUnit, heightUnit);
      const searchParam = inputValue ? Number(inputValue) : getSPM(speed, height, speedUnit, heightUnit);
      const artistNameParam = artistNameInputValue ? artistNameInputValue : "";
      const results = await getSongs(searchParam, selectedGenres.length > 0 ? selectedGenres : undefined);
      /*const results = searchByName
        ? await getSongBySongName(searchParam, artistNameParam)
        : await getSongs(Number(searchParam));*/
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

  const onSelectGenreHandler = (text: string, selected: boolean) => {
    if (selected) {
      setSelectedGenres((prevGenres) => [...prevGenres, text]);
    } else {
      setSelectedGenres((prevGenres) => prevGenres.filter((genre) => genre !== text));
    }
  };

  const onSelectGenresButtonClicked = () => {
    if (tagsClass === "tags-container__tags" || tagsClass === "tags-container__tags-closed") {
      setTagsClass("tags-container__tags-open");
    } else if (tagsClass === "tags-container__tags-open") {
      setTagsClass("tags-container__tags-closed");
    }
  };

  return (
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
          <button className="select-genres-button" onClick={onSelectGenresButtonClicked}>
            Select genres
          </button>
          <div className={DEFAULT_TAGS_CONTAINER_CLASS}>
            <div className={tagsClass}>
              {getSBPMGenres.map((genre) => {
                return <Tag key={genre} text={genre} selectable={true} onSelectHandler={onSelectGenreHandler} />;
              })}
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
            <span>Search by:</span>
            {/*<div className="search-box__selector-container">
              <button
                type="button"
                className={searchByName ? "name-button-selected" : "name-button"}
                onClick={() => setSearchByName(true)}
              >
                Name
              </button>
              <button type="button" className="bpm-button" onClick={() => setSearchByName(false)}>
                BPM
              </button>
              </div>*/}
            <div className={"search-box__input-container"}>
              <input
                name="songNameInput"
                className={isLoading ? "search-box__input-text-disabled" : "search-box__input-text"}
                type="text"
                ref={songNameinputRef}
                autoComplete="off"
                placeholder="Enter song name or bpm..."
              />
              {/*searchByName && (
                <input
                  name="artistNameInput"
                  className={isLoading ? "search-box__input-text-disabled" : "search-box__input-text"}
                  type="text"
                  ref={artistNameinputRef}
                  autoComplete="off"
                  placeholder="Enter artist name..."
                />
              )*/}
              <button className={"search-box__button"} type="submit" disabled={isLoading}>
                SEARCH
              </button>
            </div>
          </form>
        </div>
        {searchResults.length > 0 && (
          <ul className="results-list">
            {searchResults.map((song) => {
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
            })}
          </ul>
        )}
      </div>
      <Snackbar message={snackbarMessage} type={snackbarType} />
    </ShowSnackbarContext.Provider>
  );
}

export default App;
