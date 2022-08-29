import { createSlice } from '@reduxjs/toolkit'

const appInitialState = {
    videoMuted: false,
    audioMuted: false,
    callActive: true,
    userCount: 1,
}

const appSlice = createSlice({
    name: 'app',
    initialState: appInitialState,
    reducers: {
        toggleVideoMute(state, action) {
            state.videoMuted = !state.videoMuted

        },
        toggleAudioMute(state, action) {
            state.audioMuted = !state.audioMuted
        },
        callEnd(state, action) {
            state.callActive = false
        },
        increaseUserCount(state, action) {
            state.userCount++;
        },
        decreaseUserCount(state, action) {
            state.userCount--;
        }
    }

})
export const { toggleAudioMute, toggleVideoMute, callEnd, increaseUserCount, decreaseUserCount } = appSlice.actions
export default appSlice.reducer