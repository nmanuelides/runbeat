import { createContext } from "react";

type SearchFormState = {
  isLoading: boolean;
  onSubmit: (
    event: React.FormEvent<HTMLFormElement>,
    songName?: string,
    artistName?: string,
    songBPM?: number
  ) => Promise<void>;
};

export const SearchFormContext = createContext<SearchFormState>({
  isLoading: false,
  onSubmit: () => Promise.resolve(),
});
