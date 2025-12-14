import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../api/authApi";
import { complaintApi } from "../api/complaintApi";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [complaintApi.reducerPath]: complaintApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      complaintApi.middleware
    ),
});

export default store;
