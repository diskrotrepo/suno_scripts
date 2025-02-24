/*
  Block all Trending Accounts
  by: diskrot
*/

// Base API Path
const sunoAPI = "https://studio-api.prod.suno.com/api";

// Find Bearer token
function getCookieValue(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Block anyone that trends
async function blockAllTrenders() {
    const bearerToken = getCookieValue('__session');

    if (!bearerToken) {
        console.error("Bearer token not found. Please log in.");
        return null;
    }

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const globalTrendingResponse = await fetch(`${sunoAPI}/discover`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "page": 1,
            "page_size": 1,
            "section_name": "trending_songs",
            "section_content": "Global",
            "secondary_section_content": "Now"
        })
    });

    const trendingJson = await globalTrendingResponse.json();
    const songs = trendingJson['sections'][0]['items'];

    console.log(songs);

    for (let i = 0; i < songs.length; i++) {
        let song = songs[i];
        let songId = song['id'];

        try {
            const blockReponse = await fetch(`${sunoAPI}/recommend/feedback/song/${songId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${bearerToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "feedback_type": "creator_not_interested"
                })
            });

            console.log(`Blocking ${song['display_name']}`);

        } catch (e) {
            console.error(e);
        }

        await delay(1000); // Add delay to avoid overwhelming the API
    }

}

(async () => {
    await blockAllTrenders();
    console.log('Complete');
})();
