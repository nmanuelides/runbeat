import { GSBSong } from "../../../services/getsongbpm/getSongsByBpm";
import { useColor } from "color-thief-react";
import defaultArtistImage from "../../../assets/default-artist-image.png";
import "../styles/desktop.scss";
import "../styles/mobile.scss";
import { isGoodContrast } from "../../../colorContrast";

type SongProps = {
  song: GSBSong;
};

const Song = ({ song }: SongProps): JSX.Element => {
  const lightFontColor = "#e1fff0";
  const darkFontColor = "#00291e";
  const options = { crossOrigin: "Anonymous", quality: 80 };
  const { data } = useColor(song.artist.img, "hex", options);
  let rimColor;
  let backgroundColor;
  let songStyle;
  if (data) {
    rimColor = { "--rim-color": data };
    backgroundColor = { background: data };
    songStyle = { ...rimColor, ...backgroundColor };
  }
  const textColor = isGoodContrast(data, lightFontColor) || !data ? lightFontColor : darkFontColor;
  return (
    <div className="song" style={songStyle}>
      <img className="song__artist-image" src={song.artist.img ? song.artist.img : defaultArtistImage}></img>
      <div className="song__data" style={{ color: textColor }}>
        <span className="song__data-title">{song.song_title}</span>
        <span className="song__data-artist-name">{song.artist.name}</span>
        <span className="song__data-genres">{song.artist.genres}</span>
        <span className="song__data-tempo">{song.tempo}</span>
      </div>
    </div>
  );
};

export default Song;
