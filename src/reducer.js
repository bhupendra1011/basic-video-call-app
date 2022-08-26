import { createSlice } from '@reduxjs/toolkit'

const appInitialState = {
    videoMuted: false,
    audioMuted: false
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

        }
    }

})
export const { toggleAudioMute, toggleVideoMute } = appSlice.actions
export default appSlice.reducer