import { useState, useContext } from "react";
import Tag from "./Tag";
import { getSBPMGenres } from "../../../helpers/genres";
import { GenresContext } from "../../../contexts/genresContext";

const Tags = () => {
  const DEFAULT_TAGS_CONTAINER_CLASS = "tags-container";
  const [tagsClass, setTagsClass] = useState<string>(DEFAULT_TAGS_CONTAINER_CLASS + "__tags");
  const { selectedGenres, setSelectedGenres } = useContext(GenresContext);

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
    <div className={DEFAULT_TAGS_CONTAINER_CLASS}>
      <button className="select-genres-button" onClick={onSelectGenresButtonClicked}>
        Select genres
      </button>
      <div className={tagsClass}>
        {getSBPMGenres.map((genre) => {
          return <Tag key={genre} text={genre} selectable={true} onSelectHandler={onSelectGenreHandler} />;
        })}
      </div>
    </div>
  );
};

export default Tags;
