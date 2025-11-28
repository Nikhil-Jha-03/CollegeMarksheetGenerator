import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const initialState = {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
}

export const userAuthReducer = createAsyncThunk(
    'userAuth/fetchUserAuth',
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}api/user`, {
                withCredentials: true,
            });

            return res.data.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || 'Failed to fetch user')
        }
    }
)

const userAuthSlice = createSlice({
    name: 'userAuth',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(userAuthReducer.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(userAuthReducer.fulfilled, (state, action) => {
                state.loading = false
                state.isAuthenticated = true
                state.user = action.payload
            })
            .addCase(userAuthReducer.rejected, (state, action) => {
                state.loading = false
                state.isAuthenticated = false
                state.user = null
                state.error = action.payload
            })
    },
})

export default userAuthSlice.reducer
