/*
   Song Hide Creator
   author: diskrot
   Creates a hidden song entry for a user in the system.
*/

const sunoAPI = "https://studio-api.prod.suno.com/api";

const delay = ms => new Promise(r => setTimeout(r, ms));

function getCookieValue(name) {
    const v = `; ${document.cookie}`;
    const p = v.split(`; ${name}=`);
    return p.length === 2 ? p.pop().split(";").shift() : null;
}

async function getBearer() {
    try {
        // cookieStore isn't supported everywhere; fall back to document.cookie
        return (await cookieStore.get("__session")).value;
    } catch {
        return getCookieValue("__session");
    }
}

async function fetchWithRetry(url, options = {}, retries = 3, backoff = 500) {
    let attempt = 0;
    while (attempt <= retries) {
        // refresh token each attempt in case it changes
        const token = await getBearer();
        const opts = {
            ...options,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                ...(options.headers || {}),
            },
        };

        try {
            const res = await fetch(url, opts);

            // retry on auth or server errors
            if ((res.status === 401 || res.status >= 500) && attempt < retries) {
                console.warn(`⚠️ ${res.status} on ${url}. Retrying in ${backoff} ms …`);
                await delay(backoff);
                attempt += 1;
                continue;
            }

            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
            return res; // ✅ success
        } catch (err) {
            if (attempt === retries) throw err; // out of attempts
            console.warn(`⚠️ ${err}. Retrying in ${backoff} ms …`);
            await delay(backoff);
            attempt += 1;
        }
    }
}

/**
 * Hide a creator for a given content type.
 */
async function hideCreator({ content_type = "HOOK", user_handle }) {
    if (!user_handle) throw new Error("user_handle is required");

    const token = await getBearer();
    if (!token) throw new Error("No __session bearer token found");

    const res = await fetchWithRetry(`${sunoAPI}/recommend/hide-creator`, {
        method: "POST",
        body: JSON.stringify({ content_type, user_handle }),
    });

    const data = await res.json().catch(() => ({}));
    console.log("Done!", data);
    return data;
}

hideCreator({ content_type: "CLIP", user_handle: "" })
    .then(() => console.log("Hide request completed"))
    .catch((error) => console.error("Error:", error));
