import { useRef, useContext } from "react";
import { SearchFormContext } from "../../../contexts/searchFormContext";
import Tags from "../../tags/src/Tags";
import "../styles/desktop.scss";
import "../styles/mobile.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../../state/store";

type SearchProps = {
  isSongNameSearch: boolean;
};

const Search = ({ isSongNameSearch }: SearchProps) => {
  const songNameinputRef = useRef<HTMLInputElement | null>(null);
  const artistNameinputRef = useRef<HTMLInputElement | null>(null);
  const { onSubmit } = useContext(SearchFormContext);
  const isLoading = useSelector((state: RootState) => state.search.isLoading);

  const onSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    if (isSongNameSearch) {
      const songName = songNameinputRef.current?.value;
      const artistName = artistNameinputRef.current?.value;
      onSubmit(event, songName, artistName);
    } else {
      const songBPM: string | undefined = songNameinputRef.current?.value;
      onSubmit(event, undefined, undefined, Number(songBPM));
    }
  };

  return (
    <form className="search__form" onSubmit={onSubmitHandler}>
      {!isSongNameSearch && <Tags />}
      <input
        name="songNameInput"
        className={isLoading ? "search__input-text-disabled" : "search__input-text"}
        type={isSongNameSearch ? "text" : "number"}
        ref={songNameinputRef}
        autoComplete="off"
        placeholder={isSongNameSearch ? "Enter song name (required)" : "Enter song bpm..."}
        required
      />
      {isSongNameSearch && (
        <input
          name="artistNameInput"
          className={isLoading ? "search__input-text-disabled" : "search__input-text"}
          type="text"
          ref={artistNameinputRef}
          autoComplete="off"
          placeholder="Enter artist name for more precision..."
        />
      )}
      <button className={"search__button"} type="submit" disabled={isLoading}>
        SEARCH
      </button>
    </form>
  );
};

export default Search;
