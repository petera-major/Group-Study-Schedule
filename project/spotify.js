async function displayPlaylistTracks() {
  try {
    const response = await fetch('/spotify-tracks'); // Fetch tracks from the backend
    if (!response.ok) {
      throw new Error('Failed to fetch playlist tracks');
    }
    const tracks = await response.json();

    const container = document.getElementById('spotifyTracks');
    if (!container) {
      console.error('Spotify container not found');
      return;
    }

    container.innerHTML = '<h3>Study Playlist</h3>';
    tracks.forEach((track) => {
      const trackDiv = document.createElement('div');
      trackDiv.className = 'track';
      trackDiv.innerHTML = `
        <img src="${track.albumArt}" alt="${track.name}" class="track-image">
        <div class="track-info">
          <p class="track-name">${track.name}</p>
          <p class="track-artist">${track.artists}</p>
        </div>
        ${track.previewUrl ? `<audio controls src="${track.previewUrl}"></audio>` : '<p></p>'}
      `;
      container.appendChild(trackDiv);
    });
  } catch (error) {
    console.error('Failed to display playlist tracks:', error);
    const container = document.getElementById('spotifyTracks');
    container.innerHTML = '<p>Failed to load tracks.</p>';
  }
}

document.addEventListener('DOMContentLoaded', displayPlaylistTracks); // Ensure it runs after the DOM is loaded
