import { createContext } from "react";

type SearchFormState = {
  isLoading: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const SearchFormContext = createContext<SearchFormState>({
  isLoading: false,
  onSubmit: () => {},
});
