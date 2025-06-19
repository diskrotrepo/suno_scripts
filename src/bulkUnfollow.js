/*
    Mass Unfollow Script

    Actually..... I don't want to follow anyone anymore.
    Author: diskrot
*/

const SUNO_API = "https://studio-api.prod.suno.com/api";

// Get cookie by name
function getCookieValue(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop().split(';').shift() : null;
}

// Fetch total number of pages of followed profiles
async function getTotalPages() {
    const bearerToken = getCookieValue('__session');
    const response = await fetch(`${SUNO_API}/profiles/following?page=1`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
        },
    });
    const data = await response.json();
    return Math.ceil(data.num_total_profiles / 20);
}

// Bulk unfollow function
async function performUnfollow() {
    const bearerToken = getCookieValue('__session');
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const totalPages = await getTotalPages();

    for (let i = 0; i < totalPages; i++) {
        const response = await fetch(`${SUNO_API}/profiles/following?page=${i + 1}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        const handles = data.profiles.map(profile => profile.handle);

        for (const handle of handles) {
            console.log(`Unfollowing handle: ${handle}`);

            const response = await fetch(`${SUNO_API}/profiles/follow`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${bearerToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ handle: handle, unfollow: true }),
            });

            await delay(120); // Throttle requests
        }


        console.log(`Processed page ${i + 1} of ${totalPages}`);
        await delay(120); // Throttle requests
    }
}

async function bulkUnfollow() {
    const following = await performUnfollow();

}

await bulkUnfollow();
