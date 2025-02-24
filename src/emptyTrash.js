/*
    YUCK! TAKE OUT THE TRASH

    This script will empty your trash.
    Author: diskrot
*/

const sunoAPI = "https://studio-api.prod.suno.com/api";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Find Bearer token from cookies
function getCookieValue(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Function to empty the trash in batches
async function emptyTrash(batchSize) {

    let deletingSongs = true;
    let page = 0;

    do {
        try {
            let bearerToken = getCookieValue('__session');

            // Fetch trashed clips
            const res = await fetch(`${sunoAPI}/clips/trashed_v2?page=${page}&page_size=${batchSize}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${bearerToken}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await res.json();
            const totalPages = Math.ceil(data.num_total_results / batchSize);

            if (data.clips && data.clips.length > 0) {
                // Filter and delete clips
                const idsToDelete = data.clips
                    .filter((clip) => clip.is_trashed === true) // Ensure it's trashed
                    .filter((clip) => !('persona_id' in clip.metadata)) // Exclude persona clips
                    .filter((clip) => !('persona' in clip)) // Exclude persona clips
                    .map((clip) => clip.id);
                try {
                    if (idsToDelete.length > 0) {
                        let bearerToken = getCookieValue('__session');

                        await fetch(`${sunoAPI}/clips/delete`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${bearerToken}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ ids: idsToDelete })
                        });

                        console.log(`Deleted ${idsToDelete.length} songs on page ${page} of ${totalPages}`);
                    } else {
                        console.log(`No valid songs to delete on page ${page}`);
                    }

                } catch (error) {
                    console.log('Attempted to delete a persona song, since this will keep failing, skip to next page');
                }

                page++;

                await delay(250); // Avoid overwhelming the API
            } else {
                console.log('No more songs to delete');
                deletingSongs = false;
            }
        } catch (error) {
            console.log(`error ${error}`);
            console.log('If these is an authentication error, we can ignore it an refresh the token');
        }
    } while (deletingSongs);
}

(async () => {
    console.log('Starting trash cleanup...');
    await emptyTrash(20);
    console.log('Trash cleanup complete. Deleted all eligible songs.');
})();
