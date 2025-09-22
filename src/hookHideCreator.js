/*
   Social-Score Calculator
   author: diskrot
   Calculates a social-score (total likes) for one user — or for an
   array of users with a 250 ms pause between requests, retrying all
   API calls on transient failures.
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

            // retry on auth or server errors
            if ((res.status === 401 || res.status >= 500) && i < retries) {
                console.warn(`⚠️ ${res.status} on ${url}. Retrying in ${backoff} ms …`);
                await delay(backoff);
                continue;
            }

            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            return res;                         // ✅ success
        } catch (err) {
            if (i === retries) throw err;       // out of attempts
            console.warn(`⚠️ ${err}. Retrying in ${backoff} ms …`);
            await delay(backoff);
        }
    }
}

/*
https://studio-api.prod.suno.com/api/video/hooks/user_hooks?start_index=0&page_size=25&user_handle=alexayers

*/


async function hookFeed() {
    let bearerToken = await bearer();

    const hookFeed = await fetch(`${sunoAPI}/video/hooks/user_hooks?start_index=0&page_size=25&user_handle=alexayers`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + bearerToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({

        })
    })
        .then(res => console.log('Done!'))
        .catch(error => {
            console.error('Error:', error);
        });

    console.log("Hook Feed:", hookFeed);
}


await hookFeed();
