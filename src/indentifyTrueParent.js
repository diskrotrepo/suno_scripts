/*
    Find the the hidden parent of the song
    author: diskrot
*/

// Base API Path
const sunoAPI = "https://studio-api.prod.suno.com/api";

function getCookieValue(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function getHiddenTrack(songId) {
    let bearerToken = getCookieValue('__session');
    try {
        let response = await fetch(`${sunoAPI}/clips/parent?clip_id=${songId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + bearerToken,
                'Content-Type': 'application/json',
            },
        });
        let data = await response.json();
        return data;
    } catch (error) {


    }

}

let hiddenTrack = await getHiddenTrack('90246dfb-8193-4c1c-8f95-be0e7f5b3ef7');
console.log("Hidden Track: ", hiddenTrack);