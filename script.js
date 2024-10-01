console.log("Time for javascript");

let currentSong = new Audio();
let currfolder;
let songs = []; // Initialize songs array

// Function to format time in MM:SS format
function formatTime(seconds) {
    if (seconds === null || isNaN(seconds)) {
        return "00:00"; // Return "00:00" for null or NaN
    }
    seconds = Math.floor(seconds); // Round the seconds to the nearest whole number
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    let formattedMinutes = minutes.toString().padStart(2, '0');
    let formattedSeconds = remainingSeconds.toString().padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

// Function to fetch songs from a specified folder
async function getSongs(folder) {
    currfolder = folder;
    try {
        let response = await fetch(`https://coderadarsh961.github.io/Spotify-Clone/${folder}/`);
        if (!response.ok) throw new Error('Network response was not ok');
        let text = await response.text();
        let parser = new DOMParser();
        let doc = parser.parseFromString(text, 'text/html');

        let as = doc.getElementsByTagName("a");
        songs = []; // Reset songs array on each fetch

        for (let i = 0; i < as.length; i++) {
            const element = as[i];
            if (element.href.endsWith(".mp3")) {
                songs.push(element.href.split(`/${currfolder}/`)[1]); // Extract the song name
            }
        }

        let songsUL = document.querySelector(".songslist").getElementsByTagName("ul")[0];
        songsUL.innerHTML = ""; // Clear the current song list
        let newHTML = '';

        for (const song of songs) {
            let songName = song.replaceAll("%20", " ");
            newHTML += `<li>
                            <img class="inverted" src="Img/music.svg" alt="">
                            <div class="info">
                                <div>${songName}</div>
                                <div>Adarsh</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="inverted" src="Img/play.svg" alt="">
                            </div>
                        </li>`;
        }

        songsUL.innerHTML = newHTML;

        // Add click event listeners to each song
        Array.from(document.querySelector(".songslist").getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", () => {
                playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
            });
        });

        return songs;

    } catch (error) {
        console.error('Error fetching songs:', error);
    }
}

// Function to play the selected music track
const playMusic = (track, paused = false) => {
    currentSong.src = `https://coderadarsh961.github.io/Spotify-Clone/${currfolder}/` + track;
    if (!paused) {
        currentSong.play();
        play.src = "Img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}

// Function to display albums
async function displayAlbums() {
    try {
        let response = await fetch(`https://coderadarsh961.github.io/Spotify-Clone/songs/`);
        if (!response.ok) throw new Error('Network response was not ok');
        let text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;
        let cardContainer = document.querySelector(".cardContainer");
        let anchors = div.getElementsByTagName("a");
        let array = Array.from(anchors);

        for (let index = 0; index < array.length; index++) {
            let e = array[index];
            if (e.href.includes("/songs")) {
                let folder = (e.href.split("/").slice(-2)[0]);

                if (folder === "songs") {
                    continue;
                }

                let infoResponse = await fetch(`https://coderadarsh961.github.io/Spotify-Clone/songs/${folder}/info.json`);
                let responseJson = await infoResponse.json();
                console.log(responseJson);

                cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                                                <div class="Play-Container">
                                                    <div class="play">
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                                            xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M5 20V4L19 12L5 20Z" stroke="black" fill="#000" stroke-width="1.5"
                                                                stroke-linejoin="round" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <img src="/songs/${folder}/cover.jpg" alt="">
                                                <h2>${responseJson.title}</h2>
                                                <p>${responseJson.description}</p>
                                            </div>`;
            }
        }

        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
                if (songs.length > 0) {
                    playMusic(songs[0]);
                }
            });
        });

    } catch (error) {
        console.error('Error displaying albums:', error);
    }
}

// Main function to initialize the app
async function main() {
    await displayAlbums(); // Load albums first
    if (songs.length > 0) {
        playMusic(songs[0], true); // Play the first song if available
    }

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "Img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "Img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        document.querySelector(".circle").style.left = (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
        currentSong.currentTime = currentSong.duration * (e.offsetX / e.target.getBoundingClientRect().width);
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-150%";
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            playMusic(songs[0]);
        }
    });

    const container = document.querySelector(".songinfo");
    const text = container.innerText;
    const words = text.split(' '); // Split the text into an array of words

    // Check if there are more than 3 words
    if (words.length > 3) {
        container.innerText = words.slice(0, 3).join(' ') + '...'; // Limit to 3 words and add '...'
    }

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("input", (event) => {
        currentSong.volume = event.target.value;
    });

    // Add an event listener to handle when the audio ends
    currentSong.addEventListener("ended", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        } else {
            playMusic(songs[0]);
        }
    });
}

// Call the main function to start the application
main();
