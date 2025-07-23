/*
    Generate SRT File from Aligned Lyrics
    author: diskrot
*/

// Base API Path
const sunoAPI = "https://studio-api.prod.suno.com/api";

function getCookieValue(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function getLyricData(songId) {
    let bearerToken = getCookieValue('__session');
    try {
        let response = await fetch(`${sunoAPI}/gen/${songId}/aligned_lyrics/v2/`, {
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

function formatTimestamp(seconds) {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(Math.floor(seconds % 60)).padStart(2, '0');
    const ms = String(Math.floor((seconds % 1) * 1000)).padStart(3, '0');
    return `${h}:${m}:${s},${ms}`;
}

function generateSRT(lyrics) {
    return lyrics.map((entry, i) => {
        const start = formatTimestamp(entry.start_s);
        const end = formatTimestamp(entry.end_s);
        const text = entry.text.replace(/\n/g, ' ').trim();
        return `${i + 1}\n${start} --> ${end}\n${text}\n`;
    }).join('\n');
}

let srt = await getLyricData(songId);
console.log("SRT Data: ", srt);
const srtText = generateSRT(srt.aligned_lyrics);
console.log("SRT File: ", srt);

const blob = new Blob([srtText], { type: 'text/plain' });
const url = URL.createObjectURL(blob);

const a = document.createElement('a');
a.href = url;
a.download = 'output.srt';
a.click();

URL.revokeObjectURL(url);