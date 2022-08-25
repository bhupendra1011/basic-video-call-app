import AgoraRTC from "agora-rtc-sdk-ng";
import "./style.css";
console.log("Hello World - Agora Video Web SDK")

const localUserContainer = document.querySelector('#localUser');
const remoteUserContainer = document.querySelector('#remoteUsers')
const appID = '392bdd4cf5da44db84328a29d247b405' // appID from console
const channelName = 'My Meeting Room'


const createRemoteContainers = (uid) => {
    const div = document.createElement('div');
    div.className = 'remoteUser border';
    return div;
}

/**
 * Asks permission to access audio and video devices
 * Play the local or remote video stream on the browser
 * local Audio is not played as we would be hearing our own voice
 */
const init = async () => {
    const [localAudio, localVideo] = await AgoraRTC.createMicrophoneAndCameraTracks();
    const videoConfig = {
        fit: 'cover' //default
    }
    localVideo.play(localUserContainer, videoConfig);
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
    await client.publish([localAudio, localVideo]);
    console.log('channel published')




}

init();



