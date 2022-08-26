import "./style.css";
import AgoraRTC from "agora-rtc-sdk-ng";
import { store as appStore, store } from "./store"
import { toggleAudioMute, toggleVideoMute } from "./reducer"

const localUserContainer = document.querySelector('#localUser');
const remoteUserContainer = document.querySelector('#remoteUsers')
const controls = document.querySelector('#controls')
const mic = document.querySelector('#mic');
const micOff = document.querySelector("#mic-off");
const video = document.querySelector("#video");
const videoOff = document.querySelector("#video-off");

const appID = '392bdd4cf5da44db84328a29d247b405' // appID from console
const channelName = 'My Meeting Room'

// store local audio & video tracks
const tracks = {
    localVideoTrack: null,
    localAudioTrack: null
}

/**
 * Subbribes to the changes in the store
 * returns unsunscribe to stop listening to store updates
 */
const unsubscribe = appStore.subscribe(() => {
    const { audioMuted, videoMuted } = store.getState().app
    if (audioMuted) {
        mic.classList.add('hidden')
        micOff.classList.remove('hidden')
        tracks.localAudioTrack.setEnabled(false)

    } else {
        mic.classList.remove('hidden')
        micOff.classList.add('hidden')
        tracks.localAudioTrack.setEnabled(true)
    }
    if (videoMuted) {
        video.classList.add('hidden')
        videoOff.classList.remove('hidden');
        tracks.localVideoTrack.setEnabled(false)
    } else {
        video.classList.remove('hidden')
        videoOff.classList.add('hidden')
        tracks.localVideoTrack.setEnabled(true)

    }
})

/**
 * Creates placeholders to show video of remote users
 * @param {} uid - id of the remote user
 * @returns 
 */
const createRemoteContainers = (uid) => {
    const div = document.createElement('div');
    div.className = 'remoteUser border';
    return div;
}

console.log("Hello World - Agora Video Web SDK")
console.log('Initial State', appStore.getState())

/**
 * add event listeners to control bar for video
 */
const addControlEvents = () => {
    mic.addEventListener('click', handleToggleMic, false);
    micOff.addEventListener('click', handleToggleMic, false);
    video.addEventListener('click', handleToggleVideo, false);
    videoOff.addEventListener('click', handleToggleVideo, false);
}

/**
 * Dispatching Action to the Reducer
 */
const handleToggleMic = () => {
    appStore.dispatch(toggleAudioMute())
}
const handleToggleVideo = () => {
    appStore.dispatch(toggleVideoMute())
}


/**
 * Asks permission to access audio and video devices
 * Play the local or remote video stream on the browser
 * local Audio is not played as we would be hearing our own voice
 */
const init = async () => {


    const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
    tracks.localAudioTrack = audioTrack;
    tracks.localVideoTrack = videoTrack

    const videoConfig = {
        fit: 'cover' //default
    }
    videoTrack.play(localUserContainer, videoConfig);
    // show control bar
    controls.classList.remove('hidden')

    const client = AgoraRTC.createClient({
        mode: 'rtc',
        codec: 'vp8'
    })

    //listening for events 
    // can check for network quality of remote user and only subscribe to his audio track in order to save video bandwitdh
    client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video") {
            console.log("subscribe video success");
            const container = createRemoteContainers(user.uid);
            user.videoTrack.play(container);
            remoteUserContainer.appendChild(container)
        }
        if (mediaType === "audio") {
            console.log("subscribe audio success");
            user.audioTrack.play();
        }
    })
    // joing the channel (meeting rooms)
    const uid = await client.join(appID, channelName, null, null)
    console.log('joined chanel using UID:', uid)
    // publish our local video & audio track into the channel
    await client.publish([audioTrack, videoTrack]);
    console.log('channel published')




}

addControlEvents();
init();




