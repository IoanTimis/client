import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    data: null,
};

const templateSlice = createSlice({
    name: "template",
    initialState,
    reducers: {
        // Define your reducers here
    },
});

export const { } = templateSlice.actions;
export default templateSlice.reducer;
