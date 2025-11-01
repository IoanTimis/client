import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  info: null,
  accessToken: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.info = action.payload.data;
      state.accessToken = action.payload.accessToken;
    },
    clearUser: (state) => {
      state.info = null;
      state.accessToken = null;
    }
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
