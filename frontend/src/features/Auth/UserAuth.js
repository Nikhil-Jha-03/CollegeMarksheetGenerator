import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'


const initialState = {
  isAuthenticated: false,
  user: null,
  loadong: false,
  error: null,
}

const userAuthReducer = createAsyncThunk('userAuth/fetchUserAuth', async () => {
  const response = await fetch('http://localhost:8080/api/auth/user', {
    method: 'GET',
    credentials: 'include',
  })
    if (!response.ok) {
        throw new Error('Failed to fetch user authentication data')
    }
    const data = await response.json()
    return data
})

const userAuthSlice = createSlice({
  name: 'userAuth',
  initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(userAuthReducer.pending, (state) => {GIT 
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
                state.error = action.error.message
            })
    },
})

export const {} = userAuthSlice.actions
export { userAuthReducer }
export default userAuthSlice.reducer