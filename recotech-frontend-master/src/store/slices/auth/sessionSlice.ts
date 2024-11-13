import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'
import { parseJwt } from '@/utils/sharedHelpers'
import { fetchUsers } from '@/api/userService'
import { useAppDispatch } from '@/store/hook'
import { setUser } from './userSlice'

export interface SessionState {
    signedIn: boolean
    token: string | null
}

const initialState: SessionState = {
    signedIn: false,
    token: null,
}

const sessionSlice = createSlice({
    name: `${SLICE_BASE_NAME}/session`,
    initialState,
    reducers: {
        signInSuccess(state, action: PayloadAction<string>) {
            state.signedIn = true
            state.token = action.payload
        },
        signOutSuccess(state) {
            state.signedIn = false
            state.token = null
            localStorage.removeItem('token');
        },
    },
})

export const { signInSuccess, signOutSuccess } = sessionSlice.actions
export default sessionSlice.reducer
