import { createContext } from "react";

type SearchFormState = {
  onSubmit: (
    event: React.FormEvent<HTMLFormElement>,
    songName?: string,
    artistName?: string,
    songBPM?: number
  ) => Promise<void>;
};

export const SearchFormContext = createContext<SearchFormState>({
  onSubmit: () => Promise.resolve(),
});
