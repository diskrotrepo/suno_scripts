/*
    Get all my Uploads
    by: diskrot

    This will display your uploads
*/


// Base API Path
const sunoAPI = "https://studio-api.prod.suno.com/api";

// Find Bearer token
function getCookieValue(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// How many pages do we need to search through to find our data?
async function howManyPages() {
    let bearerToken = getCookieValue('__session');
    try {
        let response = await fetch(`${sunoAPI}/project/default?page=0`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + bearerToken,
                'Content-Type': 'application/json',
            },
        });
        let data = await response.json();
        let totalPages = Math.ceil(data.clip_count / 20);
        console.log(`I found: ${totalPages}`);
        return totalPages;
    } catch (error) {
        console.error('Error:', error);
        return 0;
    }
}


async function getAllClips() {

    let totalPages = await howManyPages();
    let allClips = [];

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


    for (let i = 0; i < totalPages; i++) {
        let bearerToken = getCookieValue('__session');

        let response = await fetch(`${sunoAPI}/project/default?page=${i}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'Content-Type': 'application/json',
            },
        });

        let data = await response.json();
        allClips.push(...data.project_clips);
        console.log('working...');
        await delay(250);
    }

    return allClips;
}

async function filterByUploads() {
    let allClips = await getAllClips();
    let uploads = allClips.filter(e => e.clip.metadata.type == 'upload')
    console.log(uploads);
}

await filterByUploads();
