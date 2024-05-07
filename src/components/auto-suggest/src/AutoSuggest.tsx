import { useContext } from "react";
import { SearchFormContext } from "../../../contexts/searchFormContext";
import Tags from "../../tags/src/Tags";
import "../styles/desktop.scss";
import { useSelector } from "react-redux";
import { RootState } from "../../../state/store";

const AutoSuggest = (): JSX.Element => {
  const { onSubmit } = useContext(SearchFormContext);
  const isLoading = useSelector((state: RootState) => state.search.isLoading);

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
