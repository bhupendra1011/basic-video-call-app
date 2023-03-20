import { createSlice } from '@reduxjs/toolkit'

const appInitialState = {
    videoMuted: false,
    audioMuted: false,
    callActive: true,
    showCaption: false,
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
        },
        toggleCaption(state, action) {
            state.showCaption = !state.showCaption;

        }
    }

})
export const { toggleAudioMute, toggleVideoMute, callEnd, increaseUserCount, decreaseUserCount, toggleCaption } = appSlice.actions
export default appSlice.reducer