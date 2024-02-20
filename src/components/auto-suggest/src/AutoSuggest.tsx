import { useRef, useState, useContext } from "react";
import { SearchFormContext } from "../../../contexts/searchFormContext";
import { getSBPMGenres } from "../../../helpers/genres";
import Tag from "../../tags/src/Tag";
import "../styles/desktop.scss";

const AutoSuggest = (): JSX.Element => {
  const DEFAULT_TAGS_CONTAINER_CLASS = "tags-container";
  const songNameinputRef = useRef<HTMLInputElement | null>(null);
  const artistNameinputRef = useRef<HTMLInputElement | null>(null);
  const [tagsClass, setTagsClass] = useState<string>(DEFAULT_TAGS_CONTAINER_CLASS + "__tags");
  const { isLoading, onSubmit } = useContext(SearchFormContext);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const onSelectGenresButtonClicked = () => {
    if (tagsClass === "tags-container__tags" || tagsClass === "tags-container__tags-closed") {
      setTagsClass("tags-container__tags-open");
    } else if (tagsClass === "tags-container__tags-open") {
      setTagsClass("tags-container__tags-closed");
    }
  };

  const onSelectGenreHandler = (text: string, selected: boolean) => {
    if (selected) {
      setSelectedGenres((prevGenres) => [...prevGenres, text]);
    } else {
      setSelectedGenres((prevGenres) => prevGenres.filter((genre) => genre !== text));
    }
  };

  return (
    <div className="autoSuggest__container">
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
      <form className="search__form" onSubmit={onSubmit}>
        <button className={"search__button"} type="submit" disabled={isLoading}>
          SEARCH
        </button>
      </form>
    </div>
  );
};

export default AutoSuggest;
