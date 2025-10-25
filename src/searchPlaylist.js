/*
  Suno Playlist Index + Search (100-per-page pagination)
  Modes: Index (build/rebuild localStorage), Search (instant against local index)
  Author: diskrot
*/

(() => {
    // ---------- Config ----------
    const SUNO_API = "https://studio-api.prod.suno.com/api";
    const FETCH_PAGE_SIZE = 100;         // API page size
    const DEFAULT_UI_PAGE_SIZE = 20;     // Suno UI page size for page computation
    const RATE_LIMIT_DELAY_MS = 100;     // gentle pacing between calls
    const STORAGE_KEY = "suno_playlist_index_v1";

    // ---------- Utilities ----------
    function getCookieValue(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return undefined;
    }

    function sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    function loadIndex() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || !Array.isArray(parsed.items)) return null;
            return parsed;
        } catch {
            return null;
        }
    }

    function saveIndex(index) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(index));
    }

    function clearIndex() {
        localStorage.removeItem(STORAGE_KEY);
    }

    async function getTotalPlaylistSize() {
        const bearer = getCookieValue('__session');
        if (!bearer) throw new Error('No "__session" cookie found.');
        const res = await fetch(`${SUNO_API}/playlist/liked?page=1`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${bearer}`,
                'Content-Type': 'application/json'
            }
        });
        if (!res.ok) throw new Error(`Failed to fetch playlist size (${res.status})`);
        const data = await res.json();
        const size = Number(data?.num_total_results ?? 0);
        if (!Number.isFinite(size)) throw new Error('Invalid playlist size.');
        return size;
    }

    async function fetchPlaylistPage(page, pageSize = FETCH_PAGE_SIZE) {
        const bearer = getCookieValue('__session');
        if (!bearer) throw new Error('No "__session" cookie found.');
        const url = `${SUNO_API}/playlist/liked?page=${page}&page_size=${pageSize}`;
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${bearer}`,
                'Content-Type': 'application/json'
            }
        });
        if (!res.ok) throw new Error(`Failed page fetch p=${page} (${res.status})`);
        return res.json();
    }

    // Build a full index of playlist clips and store in localStorage.
    async function buildIndex(onProgress) {
        const total = await getTotalPlaylistSize();
        const totalPages = Math.ceil(total / FETCH_PAGE_SIZE);
        const items = [];

        for (let p = 0; p < totalPages; p++) {
            const data = await fetchPlaylistPage(p, FETCH_PAGE_SIZE);
            const playlist_clips = Array.isArray(data?.playlist_clips) ? data.playlist_clips : [];
            // Preserve API order so we can compute UI page by index later
            for (let i = 0; i < playlist_clips.length; i++) {
                const c = playlist_clips[i]["clip"] || {};
                console.log('Indexing clip:', c.id, c.title);
                items.push({
                    id: c.id,
                    title: String(c.title ?? '')
                });
            }

            if (typeof onProgress === 'function') {
                // Progress is based on pages complete, not items, to avoid off-by-one
                onProgress({
                    pagesDone: p + 1,
                    pagesTotal: totalPages,
                    itemsDone: items.length,
                    itemsTotal: total
                });
            }

            if (p < totalPages - 1) await sleep(RATE_LIMIT_DELAY_MS);
        }

        const index = {
            version: 1,
            createdAt: new Date().toISOString(),
            total: items.length,
            items
        };

        saveIndex(index);
        return index;
    }

    // Instant search against local index
    function searchIndex(query, index) {
        const q = String(query || '').trim().toLowerCase();
        if (!q) return [];
        const results = [];
        const items = index?.items || [];
        for (let idx = 0; idx < items.length; idx++) {
            const it = items[idx];
            const titleLower = (it.title || '').toLowerCase();
            if (titleLower.includes(q)) {
                const pageInUI = Math.floor(idx / DEFAULT_UI_PAGE_SIZE);
                results.push({
                    id: it.id,
                    title: it.title,
                    page: pageInUI
                });
            }
        }
        return results;
    }

    // ---------- UI ----------
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '10px';
    container.style.left = '50%';
    container.style.transform = 'translateX(-50%)';
    container.style.zIndex = '9999';
    container.style.backgroundColor = '#000000';
    container.style.border = '2px solid hotpink';
    container.style.borderRadius = '6px';
    container.style.padding = '12px';
    container.style.minWidth = '420px';
    container.style.color = '#FFFFFF';
    container.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
    container.style.boxShadow = '0 4px 12px rgba(0,0,0,0.35)';

    // Mode selector
    const modeRow = document.createElement('div');
    modeRow.style.display = 'flex';
    modeRow.style.alignItems = 'center';
    modeRow.style.gap = '10px';
    modeRow.style.marginBottom = '8px';

    const modeLabel = document.createElement('span');
    modeLabel.textContent = 'Mode:';
    modeLabel.style.opacity = '0.85';

    const modeSelect = document.createElement('select');
    modeSelect.style.background = '#000';
    modeSelect.style.color = '#fff';
    modeSelect.style.border = '1px solid hotpink';
    modeSelect.style.borderRadius = '4px';
    modeSelect.style.padding = '4px 6px';
    ['Search', 'Index'].forEach(opt => {
        const o = document.createElement('option');
        o.value = opt.toLowerCase();
        o.textContent = opt;
        modeSelect.appendChild(o);
    });

    modeRow.appendChild(modeLabel);
    modeRow.appendChild(modeSelect);

    // Search row
    const searchRow = document.createElement('div');
    searchRow.style.display = 'flex';
    searchRow.style.alignItems = 'center';
    searchRow.style.gap = '8px';
    searchRow.style.marginBottom = '8px';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search local index...';
    searchInput.style.flex = '1';
    searchInput.style.padding = '6px';
    searchInput.style.border = '1px solid hotpink';
    searchInput.style.borderRadius = '4px';
    searchInput.style.background = '#000';
    searchInput.style.color = '#fff';

    const searchBtn = document.createElement('button');
    searchBtn.textContent = 'Search';
    searchBtn.style.padding = '6px 10px';
    searchBtn.style.backgroundColor = '#000000';
    searchBtn.style.color = '#FFFFFF';
    searchBtn.style.border = '2px solid hotpink';
    searchBtn.style.borderRadius = '4px';
    searchBtn.style.cursor = 'pointer';

    searchRow.appendChild(searchInput);
    searchRow.appendChild(searchBtn);

    // Index row
    const indexRow = document.createElement('div');
    indexRow.style.display = 'flex';
    indexRow.style.alignItems = 'center';
    indexRow.style.gap = '8px';
    indexRow.style.marginBottom = '8px';

    const indexBtn = document.createElement('button');
    indexBtn.textContent = 'Build Index';
    indexBtn.style.padding = '6px 10px';
    indexBtn.style.backgroundColor = '#000000';
    indexBtn.style.color = '#FFFFFF';
    indexBtn.style.border = '2px solid hotpink';
    indexBtn.style.borderRadius = '4px';
    indexBtn.style.cursor = 'pointer';

    const reindexBtn = document.createElement('button');
    reindexBtn.textContent = 'Reindex';
    reindexBtn.style.padding = '6px 10px';
    reindexBtn.style.backgroundColor = '#000000';
    reindexBtn.style.color = '#FFFFFF';
    reindexBtn.style.border = '2px solid hotpink';
    reindexBtn.style.borderRadius = '4px';
    reindexBtn.style.cursor = 'pointer';

    const indexInfo = document.createElement('span');
    indexInfo.style.marginLeft = 'auto';
    indexInfo.style.fontSize = '12px';
    indexInfo.style.opacity = '0.8';

    indexRow.appendChild(indexBtn);
    indexRow.appendChild(reindexBtn);
    indexRow.appendChild(indexInfo);

    // Progress bar + status
    const progressBar = document.createElement('div');
    progressBar.style.width = '0%';
    progressBar.style.height = '5px';
    progressBar.style.backgroundColor = 'hotpink';
    progressBar.style.transition = 'width 0.2s ease';
    progressBar.style.marginTop = '4px';
    progressBar.style.marginBottom = '8px';

    const statusLine = document.createElement('div');
    statusLine.style.fontSize = '12px';
    statusLine.style.opacity = '0.9';
    statusLine.style.marginBottom = '8px';

    // Results panel
    const resultsToggleRow = document.createElement('div');
    resultsToggleRow.style.display = 'flex';
    resultsToggleRow.style.alignItems = 'center';
    resultsToggleRow.style.gap = '8px';
    resultsToggleRow.style.marginBottom = '6px';

    const resultsToggleBtn = document.createElement('button');
    resultsToggleBtn.textContent = 'Show Results';
    resultsToggleBtn.style.padding = '4px 8px';
    resultsToggleBtn.style.backgroundColor = '#000000';
    resultsToggleBtn.style.color = '#FFFFFF';
    resultsToggleBtn.style.border = '2px solid hotpink';
    resultsToggleBtn.style.borderRadius = '4px';
    resultsToggleBtn.style.cursor = 'pointer';

    const resultsCount = document.createElement('span');
    resultsCount.style.fontSize = '12px';
    resultsCount.style.opacity = '0.9';
    resultsCount.textContent = '';

    resultsToggleRow.appendChild(resultsToggleBtn);
    resultsToggleRow.appendChild(resultsCount);

    const resultsBox = document.createElement('div');
    resultsBox.style.display = 'none';
    resultsBox.style.maxHeight = '300px';
    resultsBox.style.overflowY = 'auto';
    resultsBox.style.borderTop = '1px solid hotpink';
    resultsBox.style.paddingTop = '8px';

    // Mount UI
    container.appendChild(modeRow);
    container.appendChild(searchRow);
    container.appendChild(indexRow);
    container.appendChild(progressBar);
    container.appendChild(statusLine);
    container.appendChild(resultsToggleRow);
    container.appendChild(resultsBox);
    document.body.appendChild(container);

    // ---------- UI Helpers ----------
    function setBusy(el, busy) {
        el.disabled = !!busy;
        el.style.opacity = busy ? '0.6' : '1';
        el.style.pointerEvents = busy ? 'none' : 'auto';
    }

    function renderIndexInfo() {
        const idx = loadIndex();
        if (idx) {
            const when = new Date(idx.createdAt);
            const dt = Number.isFinite(when.getTime()) ? when.toLocaleString() : idx.createdAt;
            indexInfo.textContent = `Indexed: ${idx.total} items • ${dt}`;
            reindexBtn.style.display = '';
        } else {
            indexInfo.textContent = 'No local index';
            reindexBtn.style.display = 'none';
        }
    }

    function renderResults(list) {
        resultsBox.innerHTML = '';
        const items = Array.isArray(list) ? list : [];
        resultsCount.textContent = items.length ? `${items.length} result(s)` : '';
        if (!items.length) {
            resultsBox.textContent = 'No results.';
            return;
        }
        items.forEach(r => {
            const row = document.createElement('div');
            row.style.marginBottom = '8px';

            const a = document.createElement('a');
            a.href = `https://www.suno.com/song/${r.id}`;
            a.target = '_blank';
            a.style.color = 'hotpink';
            a.style.textDecoration = 'none';
            a.textContent = `${r.title} (Page: ${r.page})`;

            row.appendChild(a);
            resultsBox.appendChild(row);
        });
    }

    function setModeUI(mode) {
        // mode: 'search' | 'index'
        const isSearch = mode === 'search';
        searchRow.style.display = isSearch ? 'flex' : 'none';
        indexRow.style.display = isSearch ? 'none' : 'flex';
        resultsToggleRow.style.display = isSearch ? 'flex' : 'none';
        resultsBox.style.display = isSearch ? resultsBox.style.display : 'none';
        statusLine.textContent = '';
        progressBar.style.width = '0%';
    }

    // ---------- Event Handlers ----------
    modeSelect.onchange = () => {
        setModeUI(modeSelect.value);
    };

    resultsToggleBtn.onclick = () => {
        const hidden = resultsBox.style.display === 'none';
        resultsBox.style.display = hidden ? 'block' : 'none';
        resultsToggleBtn.textContent = hidden ? 'Hide Results' : 'Show Results';
    };

    searchBtn.onclick = () => {
        const idx = loadIndex();
        if (!idx) {
            alert('No local index found. Switch to "Index" mode and build the index first.');
            return;
        }
        const q = searchInput.value.trim();
        if (!q) {
            alert('Enter a search term.');
            return;
        }
        const t0 = performance.now();
        const results = searchIndex(q, idx);
        const t1 = performance.now();
        renderResults(results);
        resultsBox.style.display = 'block';
        resultsToggleBtn.textContent = 'Hide Results';
        statusLine.textContent = `Searched ${idx.total} indexed items in ${(t1 - t0).toFixed(1)} ms`;
    };

    async function runIndex(rebuild = false) {
        try {
            if (!rebuild) {
                const exists = loadIndex();
                if (exists) {
                    alert('An index already exists. Use "Reindex" to build a fresh one.');
                    return;
                }
            } else {
                clearIndex();
            }

            setBusy(indexBtn, true);
            setBusy(reindexBtn, true);
            progressBar.style.width = '0%';
            statusLine.textContent = 'Starting indexing…';

            const startedAt = Date.now();
            const index = await buildIndex(({ pagesDone, pagesTotal, itemsDone, itemsTotal }) => {
                const pct = pagesTotal ? Math.round((pagesDone / pagesTotal) * 100) : 0;
                progressBar.style.width = `${pct}%`;
                statusLine.textContent = `Indexing… ${itemsDone}/${itemsTotal} items (${pagesDone}/${pagesTotal} pages)`;
            });

            const secs = ((Date.now() - startedAt) / 1000).toFixed(1);
            statusLine.textContent = `Index complete: ${index.total} items • ${secs}s`;
            renderIndexInfo();
        } catch (err) {
            console.error(err);
            statusLine.textContent = `Error: ${err.message}`;
        } finally {
            setBusy(indexBtn, false);
            setBusy(reindexBtn, false);
            // reset progress slowly so it's visible
            setTimeout(() => (progressBar.style.width = '0%'), 800);
        }
    }

    indexBtn.onclick = () => runIndex(false);
    reindexBtn.onclick = () => runIndex(true);

    // ---------- Init ----------
    renderIndexInfo();
    setModeUI('search'); // default
})();
