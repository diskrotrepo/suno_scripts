/*
    This library allows you to perform useful actions once authenticated with Suno.
    Author: diskrot
*/

const sunoAPI = "https://studio-api.prod.suno.com/api";

// Find Bearer token
function getCookieValue(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// Find total items in trash
async function getTotalTrashSize() {
  let bearerToken = getCookieValue('__session');
  await fetch(`${sunoAPI}/clips/trashed_v2?page=0&page_size=1`, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + bearerToken,
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then(data => {
      size = data.num_total_results;
    })
    .catch(error => {
      console.error('Error:', error);
    });

  return size;
}

// Search trash for a given song
async function searchTrash(search) {
  let bearerToken = getCookieValue('__session');
  let trashSize = await getTotalTrashSize();
  let searchResults;
  await fetch(`${sunoAPI}/clips/trashed_v2?page=0&page_size=${trashSize}`, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + bearerToken,
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.json())
    .then(data => {

      /*
        Perform a search against title for each song returned. Calculate the page by dividing the index by the default
        total page size 20.
      */
      searchResults = data.clips
        .map((e, index) => ({ title: e.title, page: Math.round(index / 20), id: e.id }))
        .filter(e => e.title.includes(search));

      console.log(searchResults);
    })
    .catch(error => {
      console.error('Error:', error);
    });

  return searchResults;
}

// Create the search bar container with high z-index
const searchBarContainer = document.createElement('div');
searchBarContainer.style.position = 'fixed';
searchBarContainer.style.top = '10px';
searchBarContainer.style.left = '50%';
searchBarContainer.style.transform = 'translateX(-50%)';
searchBarContainer.style.zIndex = '9999';
searchBarContainer.style.backgroundColor = '#000000';
searchBarContainer.style.border = '2px solid hotpink';
searchBarContainer.style.borderRadius = '5px';
searchBarContainer.style.padding = '10px';
searchBarContainer.style.boxShadow = '0px 4px 6px rgba(0,0,0,0.1)';
searchBarContainer.style.display = 'block'; // Search bar is always visible

// Create the search input field
const searchInput = document.createElement('input');
searchInput.type = 'text';
searchInput.placeholder = 'Search trash...';
searchInput.style.width = '200px';
searchInput.style.marginRight = '10px';
searchInput.style.padding = '5px';
searchInput.style.border = '1px solid hotpink';
searchInput.style.borderRadius = '3px';
searchInput.style.color = '#FFFFFF';
searchInput.style.backgroundColor = '#000000';

// Create the search button
const searchButton = document.createElement('button');
searchButton.textContent = 'Search';
searchButton.style.padding = '5px 10px';
searchButton.style.backgroundColor = '#000000';
searchButton.style.color = '#FFFFFF';
searchButton.style.border = '2px solid hotpink';
searchButton.style.borderRadius = '3px';
searchButton.style.cursor = 'pointer';

// Create the results toggle button
const resultsToggleButton = document.createElement('button');
resultsToggleButton.textContent = 'Show Results';
resultsToggleButton.style.marginLeft = '10px';
resultsToggleButton.style.padding = '5px 10px';
resultsToggleButton.style.backgroundColor = '#000000';
resultsToggleButton.style.color = '#FFFFFF';
resultsToggleButton.style.border = '2px solid hotpink';
resultsToggleButton.style.borderRadius = '3px';
resultsToggleButton.style.cursor = 'pointer';

// Create the result container
const resultContainer = document.createElement('div');
resultContainer.style.marginTop = '10px';
resultContainer.style.maxHeight = '300px';
resultContainer.style.overflowY = 'auto';
resultContainer.style.borderTop = '1px solid hotpink';
resultContainer.style.paddingTop = '10px';
resultContainer.style.color = '#FFFFFF';
resultContainer.style.display = 'none'; // Initially collapsed

// Create a progress indicator
const progressIndicator = document.createElement('div');
progressIndicator.style.width = '0%';
progressIndicator.style.height = '5px';
progressIndicator.style.backgroundColor = 'hotpink';
progressIndicator.style.marginTop = '5px';
progressIndicator.style.transition = 'width 0.3s ease';

// Add click event to the search button
searchButton.onclick = async () => {
  const searchValue = searchInput.value.trim();
  if (!searchValue) {
    alert('Please enter a search term!');
    return;
  }
  console.log(`Searching for: ${searchValue}`);

  // Show progress indicator
  progressIndicator.style.width = '50%';

  const results = await searchTrash(searchValue);

  // Update progress indicator to full
  progressIndicator.style.width = '100%';

  console.log('Search Results:', results);

  // Clear previous results
  resultContainer.innerHTML = '';

  if (results && results.length > 0) {
    results.forEach(result => {
      const resultItem = document.createElement('div');
      resultItem.style.marginBottom = '10px';

      const link = document.createElement('a');
      link.href = `https://www.suno.com/song/${result.id}`;
      link.target = '_blank';
      link.style.color = 'hotpink';
      link.style.textDecoration = 'none';
      link.textContent = `${result.title} (Page: ${result.page})`;

      resultItem.appendChild(link);
      resultContainer.appendChild(resultItem);
    });
  } else {
    resultContainer.textContent = 'No results found.';
  }

  // Reset progress indicator
  setTimeout(() => {
    progressIndicator.style.width = '0%';
  }, 1000);

  // Automatically show results and update the toggle button
  resultContainer.style.display = 'block';
  resultsToggleButton.textContent = 'Hide Results';
};

// Add toggle functionality to the results toggle button
resultsToggleButton.onclick = () => {
  if (resultContainer.style.display === 'none') {
    resultContainer.style.display = 'block';
    resultsToggleButton.textContent = 'Hide Results';
  } else {
    resultContainer.style.display = 'none';
    resultsToggleButton.textContent = 'Show Results';
  }
};

// Append elements to the container
searchBarContainer.appendChild(searchInput);
searchBarContainer.appendChild(searchButton);
searchBarContainer.appendChild(resultsToggleButton);
searchBarContainer.appendChild(progressIndicator);
searchBarContainer.appendChild(resultContainer);

// Append the search bar container to the document body
document.body.appendChild(searchBarContainer);
