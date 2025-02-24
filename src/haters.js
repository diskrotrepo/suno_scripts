/*
  SHOW ME THE HATERS
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

// Function to fetch and display the haters
async function showMeTheHaters() {
  const bearerToken = getCookieValue('__session');

  if (!bearerToken) {
    console.error("Bearer token not found. Please log in.");
    return;
  }

  try {
    const response = await fetch(`${sunoAPI}/notification`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const haters = data.notifications.filter(
      (e) =>
        e.notification_type.includes('unfollow') ||
        e.notification_type.includes('clip_unlike')
    );

    if (haters.length === 0) {
      console.log("No haters found. You're loved!");
    } else {
      console.log("Haters:", haters);
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
}

await showMeTheHaters();