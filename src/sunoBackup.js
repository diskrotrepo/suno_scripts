/*
    Backup My Data.
    by: diskrot

    This will grab your song metadata and provide you with a JSON file and a ZIP file containing the metadata, music, and art files.
*/

// Base API Path
const sunoAPI = "https://studio-api.prod.suno.com/api";

// Dynamically load JSZip library
const loadJSZip = () => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
        script.type = "text/javascript";
        script.onload = () => {
            console.log('JSZip loaded successfully');
            resolve();
        };
        script.onerror = () => reject(new Error('Failed to load JSZip'));
        document.head.appendChild(script);
    });
};

// Find Bearer token
function getCookieValue(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Calculate the number of pages
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
        return Math.ceil(data.clip_count / 20);
    } catch (error) {
        console.error('Error fetching page count:', error);
        return 0;
    }
}

// Fetch and process all clips
async function getAllClips(filter) {
    const zip = new JSZip();
    const sunoFolder = zip.folder('suno');
    const musicFolder = sunoFolder.folder('music');
    const artFolder = sunoFolder.folder('art');
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

        for (let j = 0; j < data.project_clips.length; j++) {
            let clip = data.project_clips[j].clip;
            let { id, title, audio_url: mp3, image_url: songArt, is_public } = clip;

            // Skip clips based on filter
            if (is_public && !filter.filters.includePublic) continue;
            if (!is_public && !filter.filters.includePrivate) continue;

            // Process music files
            if (filter.downloadMusic) {
                try {
                    let response = await fetch(mp3, { method: 'GET' });
                    let blob = await response.blob();
                    musicFolder.file(`${id}_${title}.mp3`, blob);
                    console.log(`Added music: ${id}_${title}.mp3`);
                } catch (error) {
                    console.error(`Failed to fetch music: ${mp3}`, error);
                }
            }

            // Process art files
            if (filter.downloadArt) {
                try {
                    let response = await fetch(songArt, { method: 'GET' });
                    let blob = await response.blob();
                    artFolder.file(`${id}_${title}.jpeg`, blob);
                    console.log(`Added art: ${id}_${title}.jpeg`);
                } catch (error) {
                    console.error(`Failed to fetch art: ${songArt}`, error);
                }
            }

            allClips.push(clip);
        }

        console.log(`Processed page ${i + 1} of ${totalPages}`);
        await delay(250); // Add delay to avoid overwhelming the API
    }

    // Add metadata JSON to the ZIP archive
    const json = JSON.stringify(allClips, null, 2);
    sunoFolder.file('metadata.json', json);

    // Generate and download the ZIP archive
    zip.generateAsync({ type: "blob" }).then((zipBlob) => {
        const zipUrl = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = zipUrl;
        a.download = 'suno_backup.zip'; // Name of the ZIP file
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(zipUrl);
        console.log('ZIP file downloaded as suno_backup.zip');
    });

    return allClips;
}

// Backup data
async function backupSuno(filter) {
    await loadJSZip(); // Ensure JSZip is loaded
    await getAllClips(filter);
}

// Execute backup
await backupSuno({
    downloadArt: false,
    downloadMusic: false,
    filters: {
        includePublic: true,
        includePrivate: true,
    },
});
