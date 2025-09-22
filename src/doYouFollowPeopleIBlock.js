/*
   Do You Like People I Think Suck
   author: diskrot
   Evaluates if you follow people I think suck, and if you do, then
   what percentage of the people you follow suck.
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

async function computeSocialScores(handles) {
    let response = await fetchWithRetry(`${sunoAPI}/search/`, {
        method: 'POST',
        body: JSON.stringify({
            "search_queries": [
                {
                    name: "user",
                    search_type: "user",
                    term: "",
                    from_index: 0,
                    size: 400,
                    rank_by: "trending"
                }
            ]
        }),
    });

    const data = await response.json();
    console.log(data);
    let users = data["result"]["user"]["result"];

    console.log(users);

    return users;

}

const users = await computeSocialScores();
const flatRows = users.map(({ handle, display_name, stats }) => ({
    handle,
    display_name,
    followers_count: stats.followers_count,
    likes_count: stats.likes_count,
    clips_count: stats.clips_count,
    last_login: stats.last_login
}));

console.table(flatRows);

