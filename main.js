const APP_ID = "cc975bbbb09946eeab5201d80524583c";
const TOKEN =
  "007eJxTYNjtNfe58a/L0XwV3b/EY+e9PyYeljn/o+u3KeaymzfqhicrMCQnW5qbJgGBgaWliVlqamKSqZGBYYqFgamRiamFcfLnw86pDYGMDBk9cUyMDBAI4rMw5CZm5jEwAAC4ZCCM";
const CHANNEL = "main";
let UID1 = null;

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

let localTracks = [];
let remoteUsers = {};

let joinAndDisplayLocalStream = async () => {
  client.on("user-published", handleUserJoined);

  client.on("user-left", handleUserLeft);

  UID1 = await client.join(APP_ID, CHANNEL, TOKEN, null);

  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

  let player = `<div class="video-container" id="user-container-${UID1}">
                        <div class="video-player" id="user-${UID1}"></div>
                </div>`;
  document
    .getElementById("video-streams")
    .insertAdjacentHTML("beforeend", player);

  localTracks[1].play(`user-${UID1}`);

  console.log(localTracks);

  await client.publish([localTracks[0], localTracks[1]]);
};

let joinStream = async () => {
  await joinAndDisplayLocalStream();
  document.getElementById("join-btn").style.display = "none";
  document.getElementById("stream-controls").style.display = "flex";
};

let handleUserJoined = async (user, mediaType) => {
  remoteUsers[user.uid] = user;
  await client.subscribe(user, mediaType);

  if (mediaType === "video") {
    let player = document.getElementById(`user-container-${user.uid}`);
    if (player != null) {
      player.remove();
    }

    player = `<div class="video-container" id="user-container-${user.uid}">
                        <div class="video-player" id="user-${user.uid}"></div> 
                 </div>`;
    document
      .getElementById("video-streams")
      .insertAdjacentHTML("beforeend", player);

    user.videoTrack.play(`user-${user.uid}`);
  }

  if (mediaType === "audio") {
    user.audioTrack.play();
  }
};

let handleUserLeft = async (user) => {
  delete remoteUsers[user.uid];
  document.getElementById(`user-container-${user.uid}`).remove();
};

let leaveAndRemoveLocalStream = async () => {
  for (let i = 0; localTracks.length > i; i++) {
    localTracks[i].stop();
    localTracks[i].close();
  }

  await client.leave();
  document.getElementById("join-btn").style.display = "block";
  document.getElementById("stream-controls").style.display = "none";
  document.getElementById("video-streams").innerHTML = "";
};

let toggleMic = async (e) => {
  if (localTracks[0].muted) {
    await localTracks[0].setMuted(false);
    e.target.innerText = "Mic on";
    e.target.style.backgroundColor = "cadetblue";
  } else {
    await localTracks[0].setMuted(true);
    e.target.innerText = "Mic off";
    e.target.style.backgroundColor = "#EE4B2B";
  }
};

let toggleCamera = async (e) => {
  if (localTracks[1].muted) {
    await localTracks[1].setMuted(false);
    e.target.innerText = "Camera on";
    e.target.style.backgroundColor = "cadetblue";
  } else {
    await localTracks[1].setMuted(true);
    e.target.innerText = "Camera off";
    e.target.style.backgroundColor = "#EE4B2B";
  }
};

document.getElementById("join-btn").addEventListener("click", joinStream);
document
  .getElementById("leave-btn")
  .addEventListener("click", leaveAndRemoveLocalStream);
document.getElementById("mic-btn").addEventListener("click", toggleMic);
document.getElementById("camera-btn").addEventListener("click", toggleCamera);

// SECOND CAMERA FEED

// Create the second client
const client2 = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

// ... (Second client code)

let joinAndDisplayLocalStream2 = async () => {
  client2.on("user-published", handleUserJoined2);
  client2.on("user-left", handleUserLeft2);

  let UID2 = await client2.join(APP_ID, CHANNEL, TOKEN, null);

  const localTracks2 = await AgoraRTC.createMicrophoneAndCameraTracks();

  const cameras = await AgoraRTC.getCameras();

  const hihihi = await AgoraRTC.createCameraVideoTrack({
    cameraId: cameras[1].deviceId,
  });

  let player2 = `<div class="video-container" id="user-container-${UID2}">
                    <div class="video-player" id="user-${UID2}"></div>
                </div>`;

  document
    .getElementById("video-streams")
    .insertAdjacentHTML("beforeend", player2);

  hihihi.play(`user-${UID2}`);

  await client2.publish([hihihi]);
};

let joinStream2 = async () => {
  await joinAndDisplayLocalStream2();
  document.getElementById("join-btn-1").style.display = "none";
  document.getElementById("stream-controls-1").style.display = "flex";
};

let handleUserJoined2 = async (user, mediaType) => {};

let handleUserLeft2 = async (user) => {};

let leaveAndRemoveLocalStream2 = async () => {};

document.getElementById("join-btn-1").addEventListener("click", joinStream2);
document
  .getElementById("leave-btn-1")
  .addEventListener("click", leaveAndRemoveLocalStream2);

// SHARE SCREEN FUNCTIONALITY

// 1. Share Screen Button

let isSharingEnabled = false;
let isMuteVideo = false;
let screenSharingTrack = null;

document.getElementById("inItScreen").onclick = async function () {
  if (isSharingEnabled === false) {
    // Stop the default screen sharing track (if it exists)
    if (screenSharingTrack) {
      screenSharingTrack.stop();
    }

    screenSharingTrack = await AgoraRTC.createScreenVideoTrack();

    document.getElementById(`inItScreen`).innerHTML = "Stop Sharing";

    isSharingEnabled = true;

    document.getElementById(`user-${UID1}`).innerHTML = "";

    screenSharingTrack.play(`user-${UID1}`);

    await client.unpublish([localTracks[0], localTracks[1]]);

    await client.publish([localTracks[0], screenSharingTrack]);
  } else {
    screenSharingTrack.stop();

    document.getElementById(`user-${UID1}`).innerHTML = "";

    localTracks[1].play(`user-${UID1}`);

    await client.publish([localTracks[0], screenSharingTrack]);

    await client.publish([localTracks[0], localTracks[1]]);

    document.getElementById(`inItScreen`).innerHTML = "Share Screen";

    isSharingEnabled = false;
  }
};

document
  .getElementById("localAudioVolume")
  .addEventListener("change", function (event) {
    client.localAudioTrack.setVolume(parseInt(event.target.value));
  });

document
  .getElementById("remoteAudioVolume")
  .addEventListener("change", function (event) {
    client.remoteAudioTracks.setVolume(parseInt(event.target.value));
  });
