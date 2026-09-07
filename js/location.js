/**
 * ============================================
 * location.js - Geolocalización y Cálculo de Distancia
 * ============================================
 * 
 * Maneja:
 * - Solicitud de permiso de geolocalización del navegador
 * - Cálculo de distancia con fórmula de Haversine
 * - Formateo de distancias
 * - Manejo de errores de geolocalización
 */

// Estado de la ubicación del usuario
let userLocation = null;

/**
 * Solicita la ubicación actual del usuario
 * @param {boolean} fromDetail - true si se llama desde la vista de detalle
 * @param {Function} callback - función a ejecutar cuando se obtenga la ubicación
 */
function requestLocation(fromDetail = false, callback = null) {
  if (!navigator.geolocation) {
    showToast('Tu navegador no soporta geolocalización', 'error');
    if (callback) callback(new Error('Geolocalización no soportada'));
    return;
  }

  showToast('Solicitando permiso de ubicación...', 'info');

  const options = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 60000
  };

  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      // Marcar botón como activo
      const locBtn = document.getElementById('locationBtn');
      if (locBtn) {
        locBtn.classList.add('active');
        locBtn.innerHTML = '<i class="fa-solid fa-check"></i> Ubicación activa';
      }

      showToast('✅ Ubicación obtenida correctamente', 'success');

      if (callback) callback(null, userLocation);
    },
    (error) => {
      let msg = 'No pudimos acceder a tu ubicación';
      let type = 'error';

      switch (error.code) {
        case error.PERMISSION_DENIED:
          msg = 'Permiso de ubicación denegado. Puedes abrir la ubicación directamente en Google Maps.';
          type = 'warning';
          break;
        case error.POSITION_UNAVAILABLE:
          msg = 'No se pudo determinar tu ubicación. Verifica que el GPS esté activado.';
          type = 'warning';
          break;
        case error.TIMEOUT:
          msg = 'Tiempo de espera agotado. Intenta de nuevo.';
          type = 'warning';
          break;
      }

      showToast(msg, type);
      if (callback) callback(error);
    },
    options
  );
}

/**
 * Fórmula de Haversine para calcular distancia entre dos puntos geográficos
 * @param {number} lat1 - Latitud punto 1
 * @param {number} lon1 - Longitud punto 1
 * @param {number} lat2 - Latitud punto 2
 * @param {number} lon2 - Longitud punto 2
 * @returns {number} Distancia en kilómetros
 */
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Formatea una distancia en km a texto legible
 * @param {number} km - Distancia en kilómetros
 * @returns {string} Texto formateado (ej: "850 m" o "1.4 km")
 */
function formatDistance(km) {
  if (km === null || km === undefined || isNaN(km)) {
    return 'Distancia no disponible';
  }
  if (km < 1) {
    return Math.round(km * 1000) + ' m';
  }
  return km.toFixed(1) + ' km';
}

/**
 * Obtiene la distancia desde la ubicación del usuario hasta una célula
 * @param {Object} celula - Objeto de célula con latitud y longitud
 * @returns {number|null} Distancia en km o null si no se puede calcular
 */
function getDistanceToCelula(celula) {
  if (!userLocation || !celula.latitud || !celula.longitud) {
    return null;
  }
  return calcularDistancia(
    userLocation.lat, userLocation.lng,
    celula.latitud, celula.longitud
  );
}

// Exportar funciones
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    requestLocation,
    calcularDistancia,
    formatDistance,
    getDistanceToCelula
  };
}
