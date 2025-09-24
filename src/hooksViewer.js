/*
   View Hooks feed
   author: diskrot
   This allows you to a view a user's hooks feed.
*/

const sunoAPI = "https://studio-api.prod.suno.com/api";

const delay = ms => new Promise(r => setTimeout(r, ms));

function getCookieValue(name) {
    const v = `; ${document.cookie}`;
    const p = v.split(`; ${name}=`);
    return p.length === 2 ? p.pop().split(';').shift() : null;
}

async function bearer() {
    try {
        return (await cookieStore.get("__session")).value;
    } catch {
        return getCookieValue("__session");
    }
}

async function fetchWithRetry(url, options = {}, retries = 3, backoff = 500) {
    for (let i = 0; i <= retries; i++) {
        const token = getCookieValue("__session");
        const opts = {
            ...options,
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        };

        try {
            const res = await fetch(url, opts);

            if ((res.status === 401 || res.status >= 500) && i < retries) {
                console.warn(`⚠️ ${res.status} on ${url}. Retrying in ${backoff} ms …`);
                await delay(backoff);
                continue;
            }

            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            return res;
        } catch (err) {
            if (i === retries) throw err;
            console.warn(`⚠️ ${err}. Retrying in ${backoff} ms …`);
            await delay(backoff);
        }
    }
}

async function hookFeed(username) {
    let bearerToken = await bearer();

    const response = await fetch(`${sunoAPI}/video/hooks/user_hooks?start_index=0&page_size=10&user_handle=${username}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + bearerToken,
            'Content-Type': 'application/json'
        },
    });

    const hookFeed = await response.json();
    console.log("Hook Feed:", hookFeed);
}


await hookFeed('alexayers');

