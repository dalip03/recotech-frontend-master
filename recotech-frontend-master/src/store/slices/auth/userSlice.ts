import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'

export type UserState = {
    id?: string
    username?: string
    name?: string
    authority: string
    profilePicture?: string
}

const initialState: UserState = {
    id: '',
    username: '',
    name: '',
    authority: '',
    profilePicture: '',
}

const userSlice = createSlice({
    name: `${SLICE_BASE_NAME}/user`,
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<UserState>) {
            state.id = action.payload?.id
            state.username = action.payload?.username
            state.name = action.payload?.name
            state.authority = action.payload?.authority
            state.profilePicture = action.payload?.profilePicture
        },
    },
})

export const { setUser } = userSlice.actions
export default userSlice.reducer
