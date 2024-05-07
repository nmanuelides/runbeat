import { createSlice } from "@reduxjs/toolkit";

interface SearchState {
  isLoading: boolean;
}

const initialState: SearchState = {
  isLoading: false,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    toggleIsLoading: (state) => {
        state.isLoading = !state.isLoading;
        console.log("toggleIsLoading dispatched!", state.isLoading);
    },
  },
});

export const { toggleIsLoading } = searchSlice.actions;

export default searchSlice.reducer;
