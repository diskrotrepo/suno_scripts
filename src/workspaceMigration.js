/*
    Migrate all songs into a single workspace.
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

// Fetch with retry and token refresh
async function fetchWithRetry(url, options = {}, retries = 3, backoff = 2000) {
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
                await delay(backoff + Math.floor(Math.random() * 250));
                continue;
            }

            if (!response.ok && i < retries) {
                console.warn(`⚠️ Request failed with status ${response.status}. Retrying...`);
                await delay(backoff + Math.floor(Math.random() * 250));
                continue;
            }

            return response;
        } catch (err) {
            console.error(`❌ Fetch error: ${err}. Retrying...`);
            await delay(backoff + Math.floor(Math.random() * 250));
        }
    }

    throw new Error(`Failed to fetch ${url} after ${retries} retries.`);
}


async function getProjects() {
    const res = await fetchWithRetry(`${SUNO_API}/project/me`);
    const data = await res.json();
    return data.projects;
}

// Follow users
async function performFollow() {
    const totalPages = await getTotalPages();
    let totalAdds = 0;

    for (let i = 568; i < totalPages; i++) {
        try {
            const res = await fetchWithRetry(`https://studio-api.prod.suno.com/api/profiles/marciocampos/followers?page=${i + 1}`);
            const data = await res.json();

            if (Array.isArray(data.profiles)) {

                for (const profile of data.profiles) {
                    const handle = profile.handle;

                    if (totalAdds >= 260) {
                        console.log(`✅ Reached limit of 260 follows. Stopping.`);
                        return;
                    }

                    await fetchWithRetry(`${SUNO_API}/profiles/follow`, {
                        method: 'POST',
                        body: JSON.stringify({ handle, unfollow: false }),
                    });

                    await fetchWithRetry(`${SUNO_API}/feed/v2?hide_disliked=true&hide_studio_clips=true&page=0`, {
                        method: 'GET'
                    });

                    console.log(`✅ Followed ${handle} (${totalAdds + 1}/${260})`);
                    await delay(5000 + Math.floor(Math.random() * 250));
                    totalAdds++;
                }

                await delay(250 + Math.floor(Math.random() * 250));

                console.log(`✅ Processed followers page ${i + 1} of ${totalPages}`);
            } else {
                console.warn(`⚠️ Unexpected followers response on page ${i + 1}`);
            }

            await delay(450 + Math.floor(Math.random() * 100));
        } catch (err) {
            console.error(`❌ Failed on followers page ${i + 1}: ${err.message}`);
        }
    }
}

async function getProjectSongs(projectId) {
    const res = await fetchWithRetry(`${SUNO_API}/project/${projectId}`);
    const data = await res.json();
    return data.project_clips || [];
}

// Entry
async function migrateData(workspaceToMigrateInto) {
    console.log('Starting migration...');
    const projects = await getProjects();
    console.log(`Found ${projects.length} projects.`);

    for (const project of projects) {
        if (project.id == workspaceToMigrateInto) {
            console.log(`Skipping project ${project.id}, not the target workspace.`);
            continue;
        }
        console.log(`Migrating project ${project.id}...`);
        const songs = await getProjectSongs(project.id);
        console.log(`  Found ${songs.length} songs in project ${project.id}.`);

        const songIds = songs.map(s => s.clip.id);
        console.log(`  Song IDs: ${songIds.join(', ')}`);

        const res = await fetchWithRetry(`${SUNO_API}/project/${project.id}/clips`, {
            method: 'POST',
            body: JSON.stringify({
                "update_type": "remove",
                "metadata": {
                    "clip_ids": songIds,
                }

            })
        });

        if (res.ok) {
            console.log(`  Removed ${songs.length} songs from project ${project.id}.`);
        }
    }

}

await migrateData('default');


