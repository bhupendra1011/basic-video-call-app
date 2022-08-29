import "./style.css";
import AgoraRTC from "agora-rtc-sdk-ng";
import { store as appStore, store } from "./store"
import { toggleAudioMute, toggleVideoMute, callEnd, increaseUserCount, decreaseUserCount } from "./reducer"
import Toastify from 'toastify-js'
import "toastify-js/src/toastify.css"

const localUserContainer = document.querySelector('#localUser');
const remoteUserContainer = document.querySelector('#remoteUsers')
const controls = document.querySelector('#controls')
const numOfUsers = document.querySelector('#usersCount');
const mic = document.querySelector('#mic');
const micOff = document.querySelector("#mic-off");
const video = document.querySelector("#video");
const videoOff = document.querySelector("#video-off");
const callOff = document.querySelector("#call-off");
const share = document.querySelector("#share")


const appID = '392bdd4cf5da44db84328a29d247b405' // appID from console
let channelName = ''

const toastNotifyConfig = {
    duration: 3000,
    close: true,
    gravity: "top", // `top` or `bottom`
    position: "right", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
        color: '#1b1b1b',
        background: "linear-gradient(90deg, #f5f7fa 0%, #c3cfe2 100%)",
    },
}


window.onload = () => {
    const params = new URLSearchParams(window.location.search)
    if (params.has('channelName')) {
        channelName = params.get('channelName');
        init();
    } else {
        channelName = window.prompt('Enter Meeting Name');
        if (channelName) {
            document.getElementById('meetingName').innerText = channelName
            init();
        }
    }

}


// store local audio & video tracks
const tracks = {
    localVideoTrack: null,
    localAudioTrack: null
}

/**
 * 
 * @param {string} text - text of notification
 * @param {fucntion} callback - function to be called on click of the toast
 */
const showNotification = (text, callback = () => { }, duration = 3000) => {
    Toastify({
        ...toastNotifyConfig,
        duration: duration,
        text: text,
        callback: callback
    }).showToast();

}



/**
 * Subscribe to the changes in the store
 * returns unsunscribe to stop listening to store updates
 */
const unsubscribe = appStore.subscribe(() => {
    const { audioMuted, videoMuted, callActive, userCount } = store.getState().app
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
    if (!callActive) {
        showNotification('Meeting Ended !', () => {
            window.location.reload()
        }, 700)

    }
    numOfUsers.innerText = userCount;
})

/**
 * Creates placeholders to show video of remote users
 * @param {string} uid - id of the remote user
 * @returns 
 */
const createRemoteContainers = (uid) => {
    const div = document.createElement('div');
    div.id = uid;
    div.className = 'remoteUser border';
    const title = document.createElement('span');
    title.innerText = `user - ${uid}`;
    title.className = 'userInfo';
    div.appendChild(title)
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
    callOff.addEventListener('click', handleCallEnd, false);
    share.addEventListener('click', handleShare, false)

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

const handleCallEnd = () => {
    appStore.dispatch(callEnd())
}

const handleUserLeft = (user, reason) => {
    const { uid } = user
    showNotification(`User - ${uid} has left `);
    document.getElementById(uid).remove();
    appStore.dispatch(decreaseUserCount())
    console.log(`${user.uid} left due to ${reason}`)

}
const handleUserJoined = (user) => {
    const { uid } = user
    showNotification(`User - ${uid} has joined`);
    appStore.dispatch(increaseUserCount())
}
const handleShare = () => {
    if (!channelName) return;
    const url = new URL(window.location.href);
    url.searchParams.append('channelName', channelName);
    window.open(url, '_blank');
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
    controls.classList.remove('hidden');

    // show user count as 1 for local user initially
    numOfUsers.innerText = 1;

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

    client.on("user-left", handleUserLeft);
    client.on("user-joined", handleUserJoined)
    // joing the channel (meeting rooms)
    const uid = await client.join(appID, channelName, null, null)
    console.log('joined chanel using UID:', uid)
    // publish our local video & audio track into the channel
    await client.publish([audioTrack, videoTrack]);
    console.log('channel published')
}

addControlEvents();
//init();





