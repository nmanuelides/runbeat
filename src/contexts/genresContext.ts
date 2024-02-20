import { createContext } from "react";

type GenresState = {
  selectedGenres: string[];
  setSelectedGenres: React.Dispatch<React.SetStateAction<string[]>>;
};

export const GenresContext = createContext<GenresState>({
  selectedGenres: [],
  setSelectedGenres: () => {},
});
