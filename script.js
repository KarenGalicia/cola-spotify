let accessToken = '';

async function getToken() {
    try {
        const response = await fetch('http://localhost:3000/get-token');
        const data = await response.json();

        if (response.ok) {
            accessToken = data.access_token;
            console.log("✅ Token obtenido:", accessToken);
        } else {
            console.error("❌ Error obteniendo el token:", data);
        }
    } catch (error) {
        console.error("❌ Error en la petición del token:", error);
    }
}

async function searchTrack() {
    if (!accessToken) {
        console.warn("⚠️ El token aún no está listo, obteniéndolo...");
        await getToken();
    }

    const query = document.getElementById('search').value.trim();
    if (!query) return;

    try {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5`, {
            headers: { 'Authorization': 'Bearer ' + accessToken }
        });

        if (!response.ok) {
            console.error("❌ Error en la búsqueda:", response.status, response.statusText);
            return;
        }

        const data = await response.json();
        if (!data.tracks) {
            console.error("❌ La API no devolvió resultados válidos.");
            return;
        }

        const resultsContainer = document.getElementById('results');
        resultsContainer.innerHTML = '';

        data.tracks.items.forEach(track => {
            const card = document.createElement('div');
            card.className = "col-lg-4 col-md-6 mb-4";
            card.innerHTML = `
                <div class="card h-100 bg-dark text-white border-0 spotify-card">
                    <div class="position-relative">
                        <img src="${track.album.images[0].url}" class="card-img-top" alt="${track.name}">
                        <div class="card-img-overlay d-flex align-items-end p-0">
                            <div class="w-100 glass-effect p-3">
                                <h6 class="card-title text-truncate mb-1">${track.name}</h6>
                                <p class="card-text text-truncate mb-2"><small>${track.artists[0].name}</small></p>
                                <div class="d-flex justify-content-between">
                                    <button class="btn btn-success btn-sm w-50 me-1" onclick="addToQueue('${track.name}', '${track.artists[0].name}', '${track.album.images[0].url}', false)">
                                        <i class="fas fa-plus-circle me-1"></i>Normal
                                    </button>
                                    <button class="btn btn-warning btn-sm w-50" onclick="addToQueue('${track.name}', '${track.artists[0].name}', '${track.album.images[0].url}', true)">
                                        <i class="fas fa-star me-1"></i>Prioridad
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            resultsContainer.appendChild(card);
        });

    } catch (error) {
        console.error("❌ Error en la petición de búsqueda:", error);
    }
}

function addToQueue(name, artist, image, priority) {
    const queueContainer = document.getElementById('queue');
    const card = document.createElement('div');
    card.className = "col-lg-4 col-md-6 mb-4";
    card.innerHTML = `
        <div class="card h-100 bg-dark text-white border-0 spotify-card">
            <div class="position-relative">
                <img src="${image}" class="card-img-top" alt="${name}">
                <div class="card-img-overlay d-flex align-items-end p-0">
                    <div class="w-100 glass-effect p-3">
                        <h6 class="card-title text-truncate mb-1">${name}</h6>
                        <p class="card-text text-truncate mb-2"><small>${artist}</small></p>
                    </div>
                </div>
            </div>
        </div>
    `;

    if (priority) {
        queueContainer.prepend(card); // Agregar al inicio si es prioridad
    } else {
        queueContainer.appendChild(card); // Agregar al final si es normal
    }
}

// Elimina solo la primera canción en la cola (FIFO)
function removeFirstFromQueue() {
    const queueContainer = document.getElementById('queue');
    if (queueContainer.children.length > 0) {
        queueContainer.children[0].remove();
    }
}

// Obtener la configuración y el token al cargar la página
document.addEventListener("DOMContentLoaded", getToken);
