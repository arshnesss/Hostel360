import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../api/authApi";
import { complaintApi } from "../api/complaintApi";
import { adminApi } from "../api/adminApi";
import { userApi } from "../api/userApi";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [complaintApi.reducerPath]: complaintApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      complaintApi.middleware,
      adminApi.middleware,
      userApi.middleware
    ),
});

export default store;
