import { configureStore} from '@reduxjs/toolkit';
import userAuthReducer from '../features/Auth/UserAuth.js';

export const store = configureStore({
  reducer: {
    userAuth: userAuthReducer,
  },
});