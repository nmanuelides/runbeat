import { useRef, useContext } from "react";
import { SearchFormContext } from "../../../contexts/searchFormContext";
import "../styles/desktop.scss";

type SearchProps = {
  isSongNameSearch: boolean;
};

const Search = ({ isSongNameSearch }: SearchProps) => {
  const songNameinputRef = useRef<HTMLInputElement | null>(null);
  const artistNameinputRef = useRef<HTMLInputElement | null>(null);
  const { isLoading, onSubmit } = useContext(SearchFormContext);
  return (
    <form className="search__form" onSubmit={onSubmit}>
      <input
        name="songNameInput"
        className={isLoading ? "search__input-text-disabled" : "search__input-text"}
        type={isSongNameSearch ? "text" : "number"}
        ref={songNameinputRef}
        autoComplete="off"
        placeholder="Enter song name or bpm..."
      />
      {isSongNameSearch && (
        <input
          name="artistNameInput"
          className={isLoading ? "search__input-text-disabled" : "search__input-text"}
          type="text"
          ref={artistNameinputRef}
          autoComplete="off"
          placeholder="Enter artist name..."
        />
      )}
      <button className={"search__button"} type="submit" disabled={isLoading}>
        SEARCH
      </button>
    </form>
  );
};

export default Search;
