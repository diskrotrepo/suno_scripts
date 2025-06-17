/*
  Restore ma' song
  by: diskrot
*/

// Base API Path
const sunoAPI = "https://studio-api.prod.suno.com/api";

// Find Bearer token
function getCookieValue(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// Restore your song
async function restoreMySong(songID) {
  let bearerToken = getCookieValue('__session');
  await fetch(`${sunoAPI}/gen/trash/`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + bearerToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      clip_ids: [songID],
      trash: false
    })
  })
    .then(res => console.log('Done!'))
    .catch(error => {
      console.error('Error:', error);
    });
}

