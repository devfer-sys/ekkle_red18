/**
 * ============================================
 * map.js - Mapa Interactivo con Leaflet.js
 * ============================================
 * 
 * Maneja:
 * - Inicialización del mapa Leaflet
 * - Marcadores de células
 * - Marcador de ubicación del usuario
 * - Línea de distancia entre usuario y célula
 * - Popups informativos
 * - Botón "Abrir en Google Maps"
 */

let map = null;
let mapMarkers = [];
let userMarker = null;
let distanceLine = null;
let mapInitialized = false;

/**
 * Inicializa el mapa Leaflet en el contenedor especificado
 * @param {number} lat - Latitud inicial
 * @param {number} lng - Longitud inicial
 * @param {number} zoom - Nivel de zoom inicial
 */
function initMap(lat, lng, zoom = 15) {
  const container = document.getElementById('mapContainer');
  if (!container) return;

  // Limpiar contenedor
  container.innerHTML = '';

  // Crear mapa
  map = L.map('mapContainer', {
    zoomControl: true,
    attributionControl: true
  }).setView([lat, lng], zoom);

  // Capa de OpenStreetMap (gratuita, sin API key)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);

  mapInitialized = true;
}

/**
 * Agrega un marcador de célula al mapa
 * @param {Object} celula - Objeto de célula
 * @param {boolean} isSelected - true si es la célula seleccionada actualmente
 */
function addCelulaMarker(celula, isSelected = true) {
  if (!map || !celula.latitud || !celula.longitud) return;

  // Crear icono personalizado
  const iconHtml = `<div class="custom-marker" style="background: ${celula.hex};">
    <i class="fa-solid fa-house-chimney" style="font-size: 0.8rem;"></i>
  </div>`;

  const customIcon = L.divIcon({
    html: iconHtml,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -40]
  });

  const marker = L.marker([celula.latitud, celula.longitud], { icon: customIcon })
    .addTo(map)
    .bindPopup(`
      <strong style="color: ${celula.hex};">📍 Célula ${celula.nombre}</strong><br>
      <small>${celula.direccion}</small><br>
      <small><strong>${celula.dia}</strong> a las ${formatTime(celula.hora)}</small>
    `);

  mapMarkers.push(marker);

  if (isSelected) {
    marker.openPopup();
  }
}

/**
 * Agrega el marcador de ubicación del usuario
 */
function addUserMarker() {
  if (!map || !userLocation) return;

  // Remover marcador anterior si existe
  if (userMarker) {
    map.removeLayer(userMarker);
  }

  const iconHtml = `<div class="user-marker">
    <i class="fa-solid fa-user" style="font-size: 0.8rem;"></i>
  </div>`;

  const userIcon = L.divIcon({
    html: iconHtml,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -40]
  });

  userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
    .addTo(map)
    .bindPopup('<strong>📍 Tu ubicación</strong>');

  // Ajustar vista para mostrar ambos puntos
  fitBoundsToMarkers();
}

/**
 * Dibuja una línea entre la ubicación del usuario y la célula
 * @param {Object} celula - Objeto de célula
 */
function drawDistanceLine(celula) {
  if (!map || !userLocation || !celula.latitud || !celula.longitud) return;

  // Remover línea anterior
  if (distanceLine) {
    map.removeLayer(distanceLine);
  }

  distanceLine = L.polyline(
    [
      [userLocation.lat, userLocation.lng],
      [celula.latitud, celula.longitud]
    ],
    {
      color: '#00bcd4',
      weight: 3,
      opacity: 0.7,
      dashArray: '10, 10',
      lineCap: 'round'
    }
  ).addTo(map);

  fitBoundsToMarkers();
}

/**
 * Ajusta el mapa para mostrar todos los marcadores
 */
function fitBoundsToMarkers() {
  if (!map) return;

  const bounds = [];

  mapMarkers.forEach(m => {
    bounds.push(m.getLatLng());
  });

  if (userMarker) {
    bounds.push(userMarker.getLatLng());
  }

  if (bounds.length > 1) {
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
  } else if (bounds.length === 1) {
    map.setView(bounds[0], 15);
  }
}

/**
 * Muestra el mapa para una célula específica
 * @param {Object} celula - Objeto de célula
 */
function showMapForCelula(celula) {
  // Limpiar marcadores anteriores
  clearMapMarkers();

  if (celula.latitud && celula.longitud) {
    // Si hay coordenadas, mostrar mapa normal
    initMap(celula.latitud, celula.longitud, 15);
    addCelulaMarker(celula, true);

    // Si hay ubicación del usuario, mostrar también
    if (userLocation) {
      addUserMarker();
      drawDistanceLine(celula);
    }
  } else {
    // Sin coordenadas: mostrar mapa centrado en La Paz, Bolivia
    initMap(-16.5000, -68.1500, 12);
    showMapStatus('warning', '⚠️ Esta célula aún no tiene coordenadas registradas. Puedes abrir la dirección en Google Maps.');
  }
}

/**
 * Limpia todos los marcadores del mapa
 */
function clearMapMarkers() {
  if (!map) return;

  mapMarkers.forEach(m => map.removeLayer(m));
  mapMarkers = [];

  if (userMarker) {
    map.removeLayer(userMarker);
    userMarker = null;
  }

  if (distanceLine) {
    map.removeLayer(distanceLine);
    distanceLine = null;
  }
}

/**
 * Muestra un mensaje de estado en el mapa
 * @param {string} type - 'info', 'warning', 'error'
 * @param {string} message - Mensaje a mostrar
 */
function showMapStatus(type, message) {
  const statusEl = document.getElementById('mapStatus');
  if (!statusEl) return;

  statusEl.className = `map-status ${type} visible`;
  statusEl.innerHTML = `<i class="fa-solid fa-circle-info"></i> ${message}`;
}

/**
 * Oculta el mensaje de estado del mapa
 */
function hideMapStatus() {
  const statusEl = document.getElementById('mapStatus');
  if (statusEl) {
    statusEl.classList.remove('visible');
  }
}

/**
 * Actualiza la distancia mostrada en el detalle
 * @param {Object} celula - Objeto de célula
 */
function updateDistanceDisplay(celula) {
  const distInfo = document.getElementById('distanceInfo');
  const distText = document.getElementById('distanceText');

  if (!distInfo || !distText) return;

  if (!userLocation) {
    distInfo.classList.remove('visible');
    return;
  }

  if (celula.latitud && celula.longitud) {
    const dist = calcularDistancia(
      userLocation.lat, userLocation.lng,
      celula.latitud, celula.longitud
    );
    distText.innerHTML = `<i class="fa-solid fa-route"></i> Estás aproximadamente a <strong>${formatDistance(dist)}</strong> de esta célula`;
    distInfo.classList.add('visible');
  } else {
    distText.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> No hay coordenadas registradas para calcular la distancia`;
    distInfo.classList.add('visible');
  }
}

// Exportar funciones
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initMap,
    addCelulaMarker,
    addUserMarker,
    drawDistanceLine,
    showMapForCelula,
    clearMapMarkers,
    updateDistanceDisplay
  };
}
