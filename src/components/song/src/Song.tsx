import { useState } from "react";
import { GSBSong } from "../../../services/getsongbpm/getSongsByBpm";
import { useColor } from "color-thief-react";
import defaultArtistImage from "../../../assets/default-artist-image.jpg";
import "../styles/desktop.scss";
import "../styles/mobile.scss";
import addIcon from "../../../assets/light-plus-icon.png";
import { getSecondaryColor, getContrastyColor } from "../../../helpers/colorHelper";
import { addSong } from "../../../services/spotify/data";

type SongProps = {
  song: GSBSong;
  userId?: string;
};

type AddSongState = "idle" | "adding" | "added" | "error";

const Song = ({ song, userId }: SongProps): JSX.Element => {
  const playlistName = "RunBeat Playlist";
  const options = { crossOrigin: "Anonymous", quality: 80 };
  const { data } = useColor(song.artist.img, "hslString", options);
  const [addSongState, setAddSongState] = useState<AddSongState>("idle");

  const addSongToRunbeatPlaylist = async (songName: string, artistName:string) => {
    if (userId) {
      setAddSongState("adding");
      const response = await addSong(songName, artistName, userId, playlistName);
      response ? setAddSongState("added") : setAddSongState("error");
    }
  };

  function getAddSongButtonClass() {
    switch (addSongState) {
      case "idle":
        return "song__add-song-button-idle";
      case "adding":
        return "song__add-song-button-adding";
      case "added":
        return "song__add-song-button-added";
      case "error":
        return "song__add-song-button-error";
      default:
        return "song__add-song-button-idle";
    }
  }

  return (
    <div className="song" style={{ background: data }}>
      <div className="song__info">
        <img className="song__artist-image" src={song.artist.img ? song.artist.img : defaultArtistImage}></img>
        <div className="song__details" style={{ color: getContrastyColor(data) }}>
          <span className="song__details-title">{song.song_title}</span>
          <span className="song__details-artist-name">{song.artist.name}</span>
          <span className="song__details-genres">{song.artist.genres}</span>
          <span className="song__details-tempo">{song.tempo}</span>
        </div>
      </div>
      <button
        aria-label={"Add to your RunBeat playlist"}
        className={`song__add-song-button ${getAddSongButtonClass()}`}
        style={{ background: getSecondaryColor(data) }}
        onClick={() => addSongToRunbeatPlaylist(song.song_title, song.artist.name)}
      >
        <img className="song__add-song-button-icon" src={addIcon} />
      </button>
    </div>
  );
};

export default Song;
