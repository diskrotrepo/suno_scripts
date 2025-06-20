/*
    Block Accounts
    author: diskrot
*/

const SUNO_API = "https://studio-api.prod.suno.com/api";

// Get cookie by name
function getCookieValue(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop().split(';').shift() : null;
}

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


await fetchWithRetry(`${SUNO_API}/profiles/block`, {
    method: 'POST',
    body: JSON.stringify({ "handle": "<username>", "unblock": false, "source": "profile_page" }),
});


