/*
    Grab all username from a comment section
    author: diskrot
*/

// Base API Path
const sunoAPI = "https://studio-api.prod.suno.com/api";
const handles = new Set();

function getCookieValue(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function collect(obj) {
    if (obj && typeof obj === "object") {
        if ("user_handle" in obj) handles.add(obj.user_handle);


        for (const value of Object.values(obj)) collect(value);
    }
}

async function getUsernamesFromComment(songId) {
    let bearerToken = getCookieValue('__session');
    try {
        let response = await fetch(`${sunoAPI}/gen/${songId}/comments?order=most_liked`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + bearerToken,
                'Content-Type': 'application/json',
            },
        });
        let data = await response.json();
        return collect(data);
    } catch (error) {
        console.error('Error fetching page count:', error);
        return 0;
    }

}

let usernames = await getUsernamesFromComment('<songId>');
console.log("Usernames collected: \n", Array.from(handles).sort().join("\n"));