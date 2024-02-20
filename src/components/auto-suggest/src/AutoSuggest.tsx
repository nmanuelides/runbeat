import { useContext } from "react";
import { SearchFormContext } from "../../../contexts/searchFormContext";
import Tags from "../../tags/src/Tags";
import "../styles/desktop.scss";

const AutoSuggest = (): JSX.Element => {
  const { isLoading, onSubmit } = useContext(SearchFormContext);

  return (
    <div className="autoSuggest__container">
      <Tags />
      <form className="search__form" onSubmit={onSubmit}>
        <button className={"search__button"} type="submit" disabled={isLoading}>
          SEARCH
        </button>
      </form>
    </div>
  );
};

export default AutoSuggest;
