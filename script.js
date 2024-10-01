console.log("Time for javascript");

let currentSong = new Audio();
let currfolder;


function formatTime(seconds) {

    if (seconds === null || isNaN(seconds)) {
        return "00:00"; // Return "00:00" for null or NaN
    }
    // Round the seconds to the nearest whole number
    seconds = Math.floor(seconds);

    let minutes = Math.floor(seconds / 60);  // Get the number of minutes
    let remainingSeconds = seconds % 60;     // Get the remaining seconds

    // Format minutes and seconds to always have two digits
    let formattedMinutes = minutes.toString().padStart(2, '0');
    let formattedSeconds = remainingSeconds.toString().padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`https://coderadarsh961.github.io/Spotify-Clone/${folder}/`);
    let response = await a.text();
    let parser = new DOMParser();
    let doc = parser.parseFromString(response, 'text/html');

    // Now find all anchor tags in the parsed document
    let as = doc.getElementsByTagName("a");
    songs = [];

    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        // Check if the link ends with ".mp3"
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]); // Extract the song name
        }
    }

    let songsUL = document.querySelector(".songslist").getElementsByTagName("ul")[0];
    songsUL.innerHTML = ""
    let newHTML = '';  // Collect the HTML in a single string

    for (const song of songs) {
        let songName = song.replaceAll("%20", " ");
        newHTML += `<li>
                            <img class = "inverted" src ="Img/music.svg" alt="">
                            <div class="info">
                                <div>${songName}</div>
                                <div>Adarsh</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class = "inverted" src="Img/play.svg" alt="">
                            </div>
                        </li>`;  // Add each song inside <li> tags
    }

    songsUL.innerHTML += newHTML;  // Append the new HTML all at once


    Array.from(document.querySelector(".songslist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })


    });

    // Now return the list of songs

    return songs;
    
}

const playMusic = (track, paused = false) => {
    //  let audio = new Audio("/songs/" + track)
    currentSong.src = `https://coderadarsh961.github.io/Spotify-Clone/${currfolder}/` + track
    if (!paused) {
        currentSong.play();
        play.src = "Img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}



async function displayAblums() {
    let a = await fetch(`https://coderadarsh961.github.io/Spotify-Clone/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let cardContainer = document.querySelector(".cardContainer")
    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors) 
        for (let index = 0; index < array.length; index++) {
            let e = array[index];
        if (e.href.includes("/songs")) {
            let folder = (e.href.split("/").slice(-2)[0]);

            if (folder === "songs") {
                continue;
            }

            let a = await fetch(`https://coderadarsh961.github.io/Spotify-Clone/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML =  cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
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
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
    
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
            playMusic(songs[0]);

        })
    })
    
}





async function main() {
    await getSongs("/songs/ncs");
    playMusic(songs[0], true)

    
    displayAblums();

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
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        document.querySelector(".circle").style.left = (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
        currentSong.currentTime = (currentSong.duration * (e.offsetX / e.target.getBoundingClientRect().width) * 100) / 100
    })


    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-150" + "%"
    })

    previous.addEventListener("click", () => {
        console.log("previous")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    next.addEventListener("click", () => {
        console.log("next")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
        else {
            playMusic(songs[0]); 0

        }
    })

    const container = document.querySelector(".songinfo");
    const text = container.innerText;
    const words = text.split(' ');  // Split the text into an array of words

    // Check if there are more than 3 words
    if (words.length > 3) {
        container.innerText = words.slice(0, 3).join(' ') + '...';  // Limit to 3 words and add '...'
    }

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log(e)
        currentSong.volume = (e.target.value) / 100;
    })

   
}
main();
