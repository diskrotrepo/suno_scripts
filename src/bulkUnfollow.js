/*
    Mass Unfollow Script with Retry on 401 and Continuation
    Author: diskrot (With Improvements)
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

// Fetch with retry and token refresh
async function fetchWithRetry(url, options = {}, retries = 3, backoff = 500) {
    for (let i = 0; i <= retries; i++) {
        const token = getCookieValue('__session');
        const opts = {
            ...options,
            headers: {
                ...(options.headers || {}),
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        };

        try {
            const response = await fetch(url, opts);

            if (response.status === 401 && i < retries) {
                console.warn(`⚠️ Unauthorized. Retrying after ${backoff}ms...`);
                await delay(backoff);
                continue;
            }

            if (!response.ok && i < retries) {
                console.warn(`⚠️ Request failed with status ${response.status}. Retrying...`);
                await delay(backoff);
                continue;
            }

            return response;
        } catch (err) {
            console.error(`❌ Fetch error: ${err}. Retrying...`);
            await delay(backoff);
        }
    }

    throw new Error(`Failed to fetch ${url} after ${retries} retries.`);
}

// Fetch total number of pages
async function getTotalPages(type) {
    const res = await fetchWithRetry(`${SUNO_API}/profiles/${type}?page=1`);
    const data = await res.json();
    return Math.ceil(data.num_total_profiles / 20);
}

// Get list of followers
async function getFollowersSet() {
    const totalPages = await getTotalPages('followers');
    const followersSet = new Set();

    for (let i = 0; i < totalPages; i++) {
        try {
            const res = await fetchWithRetry(`${SUNO_API}/profiles/followers?page=${i + 1}`);
            const data = await res.json();

            if (Array.isArray(data.profiles)) {
                data.profiles.forEach(profile => followersSet.add(profile.handle));
                console.log(`✅ Processed followers page ${i + 1} of ${totalPages}`);
            } else {
                console.warn(`⚠️ Unexpected followers response on page ${i + 1}`);
            }

            await delay(120);
        } catch (err) {
            console.error(`❌ Failed on followers page ${i + 1}: ${err.message}`);
        }
    }

    return followersSet;
}

// Unfollow users not following back
async function performUnfollow(testMode) {
    const totalPages = await getTotalPages('following');
    const followersSet = await getFollowersSet();
    let totalUnfollowed = 0;

    for (let i = 0; i < totalPages; i++) {
        try {
            const res = await fetchWithRetry(`${SUNO_API}/profiles/following?page=${i + 1}`);
            const data = await res.json();
            const handles = data.profiles.map(profile => profile.handle);

            for (const handle of handles) {
                if (followersSet.has(handle)) {
                    console.log(`➡️ Skipping ${handle} (follows you)`);
                    continue;
                }

                totalUnfollowed++;

                if (testMode) {
                    console.log(`🧪 Test mode: Would unfollow ${handle}`);
                } else {
                    console.log(`🚫 Unfollowing ${handle}`);

                    await fetchWithRetry(`${SUNO_API}/profiles/follow`, {
                        method: 'POST',
                        body: JSON.stringify({ handle, unfollow: true }),
                    });

                    await delay(120);
                }
            }

            console.log(`✅ Processed following page ${i + 1} of ${totalPages}`);
            await delay(120);
        } catch (err) {
            console.error(`❌ Failed on following page ${i + 1}: ${err.message}`);
        }
    }

    console.log(testMode
        ? `🧪 Done. Would have unfollowed ${totalUnfollowed} users.`
        : `✅ Done. Unfollowed ${totalUnfollowed} users.`);
}

// Entry
async function bulkUnfollow() {
    console.log('🚀 Starting bulk unfollow...');
    await performUnfollow(true); // Set to false to actually unfollow
}

await bulkUnfollow();
