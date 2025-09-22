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

async function getTotalFollowing() {
    const res = await fetchWithRetry(`${SUNO_API}/profiles/following?page=1`);
    const data = await res.json();
    return Math.ceil(data.num_total_profiles / 20);
}

async function userStats(handle) {

    const clips = await fetchWithRetry(
        `${sunoAPI}/profiles/${handle}/recent_clips`
    ).then(r => r.json());


    const info = await fetchWithRetry(
        `${sunoAPI}/user/get-creator-info/${clips.user_id}`
    ).then(r => r.json());




    delete info.stats.last_login;
    return info.stats;
}



async function computeSocialScores(handles) {
    const list = Array.isArray(handles) ? handles : [handles];
    const scores = {};

    for (const h of list) {
        try {
            scores[h] = await userStats(h);
        } catch (e) {
            console.error(`❌ Failed for ${h}:`, e);
            scores[h] = null;
        }
        await delay(250);        // 250 ms between users
    }

    return Array.isArray(handles) ? scores : scores[list[0]];
}

const scores = await computeSocialScores(["sunowrapper"]);
console.table(scores);
