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

// Delay utility
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch total number of pages of followed/followers
async function getTotalPages(type) {
    const bearerToken = getCookieValue('__session');
    const response = await fetch(`${SUNO_API}/profiles/${type}?page=1`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
        },
    });
    const data = await response.json();
    return Math.ceil(data.num_total_profiles / 20);
}

async function getFollowersSet() {
    const bearerToken = getCookieValue('__session');
    const totalPages = await getTotalPages('followers');
    const followersSet = new Set();

    for (let i = 0; i < totalPages; i++) {
        const response = await fetch(`${SUNO_API}/profiles/followers?page=${i + 1}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        data.profiles.forEach(profile => followersSet.add(profile.handle));

        console.log(`Processed followers page ${i + 1} of ${totalPages}`);
        await delay(120);
    }

    return followersSet;
}

// Unfollow everyone who is not following you back
async function performUnfollow(testMode) {
    const bearerToken = getCookieValue('__session');
    const totalPages = await getTotalPages('following');
    const followersSet = await getFollowersSet();
    let totalUnfollowed = 0;

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
            if (followersSet.has(handle)) {
                console.log(`Skipping handle: ${handle} because they are following you.`);
                continue;
            }

            totalUnfollowed++;

            if (testMode) {
                console.log(`Would unfollow ${handle}, but in test mode, no action is taken.`);
                continue;
            }

            console.log(`Unfollowing handle: ${handle}`);

            await fetch(`${SUNO_API}/profiles/follow`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${bearerToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ handle, unfollow: true }),
            });

            await delay(120);
        }

        console.log(`Processed following page ${i + 1} of ${totalPages}`);
        await delay(120);
    }

    console.log(testMode
        ? `In test mode, but would have unfollowed: ${totalUnfollowed}`
        : `Total unfollowed: ${totalUnfollowed}`);
}

async function bulkUnfollow() {
    console.log('Starting bulk unfollow process...');
    await performUnfollow(true); // Set to false when ready to perform actual unfollowing
}

await bulkUnfollow();
