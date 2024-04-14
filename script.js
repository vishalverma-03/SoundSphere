console.log("hello js");
let currentSong = new Audio();
let songs;
let currFolder;


// Function to convert the minutes to seconds
function convertSecondsToTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

// Function to fetch songs from the specified folder
async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}`);
  console.log(a);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;

  let as = div.querySelectorAll("ul#files.view-tiles li a");
  songs = [];

  as.forEach((element) => {
    if (element.classList.contains("icon-mp3")) {
      // Use the absolute path for audio playback
      const audioPath = new URL(
        element.getAttribute("href"),
        window.location.href
      ).pathname;
      songs.push(audioPath);
    }
  });

  let songUL = document
    .querySelector(".song-list")
    .getElementsByTagName("ul")[0];

  songUL.innerHTML = "";
  for (const song of songs) {
    // Remove date and time information from the song name
    let songName = song.split("/").pop();
    let orignal_song = song;

    // Replace %20 with space in the modified song name
    songName = songName.replace(/%20/g, " ");
    let [modifiedSongName, artistName] = songName
      .split("-")
      .map((part) => part.trim());
  artistName = artistName.replace(/\.mp3$/, "");
    // Add ".mp3" to the modified song name
    modifiedSongName = `${modifiedSongName}.mp3`;

    songUL.innerHTML += `            
      <li>
        <div class="music-icon invert"><img src="music.svg" alt=""></div>
        <div class="info"> <div class="org">${orignal_song}</div>${modifiedSongName} <br>${artistName}</div>
        <div class="play-lib-music"><img src="play-btn-lib.svg" alt=""></div>
      </li>`;
  }

  // Event listener for each song
  Array.from(
    document.querySelector(".song-list").getElementsByTagName("li")
  ).forEach((e) => {
    console.log(e);
    e.addEventListener("click", () => {
      let originalSongName = e.querySelector(".info .org").innerHTML;
      console.log(originalSongName);
      playMusic(originalSongName);
    });
  });

  return songs;
}

// Function to play music
const playMusic = (track, pause = false) => {
  currentSong.src =track;
  if (!pause) {
    currentSong.play();
    play.src = "pause.svg";
  }
  document.querySelector(".song-info").innerHTML = decodeURI(track).replace(
    /song/,
    " "
  );
  document.querySelector(".song-time").innerHTML = "00:00/00:00";
};

 //function to access the dynamic albumns
 async function displayAlbum(){
  let a = await fetch(`/songs/`);
  let response = await a.text();
  
  let div = document.createElement("div");
  div.innerHTML = response;
  // console.log(div);
  let anchor=div.getElementsByTagName("a");
  // console.log(anchor)
  let array=Array.from(anchor);
  let cardContainer=document.querySelector(".card-container");
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if(e.href.includes("songs/")){
      let folder=(e.href.split("/").slice(-1));
      let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
      let response= await a.json();
      // console.log(response);
     cardContainer.innerHTML+=`<div class="card-container">
      <div data-folder="${folder}" class="card">
        <div class="play">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="24" viewBox="0 0 24 24" fill="none"
            class="injected-svg" data-src="/icons/play-circle-stroke-sharp.svg"
            xmlns:xlink="http://www.w3.org/1999/xlink" role="img" color="#000000">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.5 16V8L16 12L9.5 16Z"></path>
          </svg>
        </div>
        <img class="rounded" src="songs/${folder}/cover.jpeg" alt="">
        <h2>${response.tittle}</h2>
        <p>${response.discription}</p>
      </div>`
    }
  }
  // Event listeners for folder selection
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    //  console.log(e);
    e.addEventListener("click", async (item) => {
      // console.log(item, item.currentTarget.dataset);
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
      // console.log(songs);
    });
  });
 }
 document.querySelector(".log-btn").addEventListener("click", function() {
  window.location.href = "login.html";
});


// Main function
async function main() {
  await getSongs("songs/ncp");
  playMusic(songs[0], true);
  
  displayAlbum();

  // Event listener for play button
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg";
    } else {
      currentSong.pause();
      play.src = "play.svg";
    }
  });

  // Time update
  currentSong.addEventListener("timeupdate", () => {
    // console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".song-time").innerHTML = `${convertSecondsToTime(
      currentSong.currentTime
    )}/${convertSecondsToTime(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Event listener for seek bar
  document.querySelector(".seek-bar").addEventListener("click", (e) => {
    let percent =
      (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Event listeners for UI interactions
  document.querySelector(".hamburger").addEventListener("click", (e) => {
    document.querySelector(".left").style.left = "0";
  });
  document.querySelector(".cut").addEventListener("click", (e) => {
    document.querySelector(".left").style.left = "-115%";
  });

  // Variables to keep track of the current song index
  let currentSongIndex = 0;

  // Function to play the next song
  const playNext = () => {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    playMusic(songs[currentSongIndex]);
    console.log("Playing next song. Current index:", currentSongIndex);
  };

  // Function to play the previous song
  const playPrevious = () => {
    currentSongIndex =
      (currentSongIndex - 1 + songs.length) % songs.length;
    playMusic(songs[currentSongIndex]);
    console.log("Playing previous song. Current index:", currentSongIndex);
  };

  // Event listeners for next and previous buttons
  document.querySelector("#next").addEventListener("click", playNext);
  document.querySelector("#prev").addEventListener("click", playPrevious);

  // Event listeners for volume control
  document.querySelector(".volume").addEventListener("mouseenter", function () {
    document.querySelector(".input-vol").style.display = "block";
  });

  document.querySelector(".volume").addEventListener("mouseleave", function () {
    document.querySelector(".input-vol").style.display = "none";
  });

  document.querySelector(".input-vol").addEventListener("input", function () {
    // Adjust the volume of the current song based on the input value
    currentSong.volume = parseFloat(this.value / 100);
  });

  // Event listener for volume control toggle
  document.getElementById("vol-image").addEventListener("click", function () {
    if (currentSong.volume !== 0) {
      console.log("Setting volume to zero");
      document.querySelector(".input-vol").value = 0;
      document.getElementById("vol-image").src = "mute.svg";
      currentSong.volume = 0;
    } else {
      console.log("Setting volume to 0.5");
      document.querySelector(".input-vol").value = 0.7 * 100;
      document.getElementById("vol-image").src = "volume-high.svg";

      currentSong.volume = 0.7;
    }
  });

  // Event listener for updating volume control image
  document.querySelector(".input-vol").addEventListener("input", function () {
    let volume_song = currentSong.volume;
    const volumeImage = document.getElementById("vol-image");

    if (volume_song > 0 && volume_song < 0.45) {
      volumeImage.src = "volume.svg"; // Change the image src to low.svg
    } else if (volume_song > 0.45) {
      volumeImage.src = "volume-high.svg"; // Change the image src to high.svg
    }

    if (volume_song == 0) {
      volumeImage.src = "mute.svg"; // Change the image src to mute.svg
    }
  });

 
}

main();