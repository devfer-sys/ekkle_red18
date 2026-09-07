/**
 * ============================================
 * app.js - Aplicación Principal
 * ============================================
 * 
 * Controla:
 * - Renderizado de tarjetas de células
 * - Búsqueda y filtros
 * - Navegación entre vistas
 * - Detalle de célula
 * - Integración con mapa, ubicación y contactos
 */

// ---------- Estado Global ----------
let currentFilter = 'todos';
let currentSearch = '';
let activeCelula = null;

// ---------- Inicialización ----------
document.addEventListener('DOMContentLoaded', () => {
  renderCards();
  setupEventListeners();
});

// ---------- Renderizado de Tarjetas ----------
function renderCards() {
  const grid = document.getElementById('cardsGrid');
  const noResults = document.getElementById('noResults');

  if (!grid) return;

  // Filtrar células
  let filtered = celulas.filter(c => {
    const matchesFilter = currentFilter === 'todos' || c.dia === currentFilter;
    const searchLower = currentSearch.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const nombreNormalized = c.nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const diaNormalized = c.dia.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const dirNormalized = c.direccion.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const refNormalized = c.referencia.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

    const matchesSearch = !searchLower ||
      nombreNormalized.includes(searchLower) ||
      diaNormalized.includes(searchLower) ||
      dirNormalized.includes(searchLower) ||
      refNormalized.includes(searchLower) ||
      c.hora.includes(searchLower) ||
      c.contactos.some(num => num.includes(searchLower));

    return matchesFilter && matchesSearch;
  });

  // Ordenar por distancia si hay ubicación del usuario
  if (userLocation) {
    filtered.sort((a, b) => {
      const distA = getDistanceToCelula(a);
      const distB = getDistanceToCelula(b);

      if (distA === null && distB === null) return 0;
      if (distA === null) return 1;
      if (distB === null) return -1;
      return distA - distB;
    });
  }

  // Mostrar/ocultar mensaje de sin resultados
  if (filtered.length === 0) {
    grid.innerHTML = '';
    noResults.style.display = 'block';
    return;
  }

  noResults.style.display = 'none';

  // Generar HTML de tarjetas
  grid.innerHTML = filtered.map((c, index) => {
    const dist = getDistanceToCelula(c);
    const distHtml = dist !== null
      ? `<div class="distance-badge visible"><i class="fa-solid fa-location-arrow"></i> ${formatDistance(dist)}</div>`
      : '';

    const horaFormateada = formatTime(c.hora);
    const direccionCorta = c.direccion.length > 55
      ? c.direccion.substring(0, 55) + '...'
      : c.direccion;

    return `
      <article class="celula-card" data-color="${c.color}" onclick="openDetail(${c.id})" style="animation-delay: ${index * 0.05}s">
        ${distHtml}
        <div class="card-header">
          <div class="card-title">Célula ${c.nombre}</div>
          <div class="card-members">
            <i class="fa-solid fa-users"></i> ${c.contactos.length} contactos disponibles
          </div>
        </div>
        <div class="card-body">
          <div class="info-row">
            <div class="info-icon ${c.color}">
              <i class="fa-regular fa-calendar"></i>
            </div>
            <div class="info-text">
              ${c.dia}
              <small><i class="fa-regular fa-clock"></i> ${horaFormateada}</small>
            </div>
          </div>
          <div class="info-row">
            <div class="info-icon ${c.color}">
              <i class="fa-solid fa-location-dot"></i>
            </div>
            <div class="info-text">${direccionCorta}</div>
          </div>
          <div class="info-row">
            <div class="info-icon ${c.color}">
              <i class="fa-solid fa-map-pin"></i>
            </div>
            <div class="info-text">${c.referencia}</div>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn-ver ${c.color}">
            Ver detalles <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </article>
    `;
  }).join('');
}

// ---------- Vista de Detalle ----------
function openDetail(id) {
  const c = celulas.find(x => x.id === id);
  if (!c) return;

  activeCelula = c;

  // Título y subtítulo
  document.getElementById('detailTitle').textContent = 'Célula ' + c.nombre;
  document.getElementById('detailSubtitle').innerHTML = `
    <i class="fa-regular fa-calendar" style="color: ${c.hex}"></i>
    ${c.dia} &bull; ${formatTime(c.hora)}
  `;

  // Horario
  document.getElementById('detailHorario').innerHTML = `
    <strong style="color: ${c.hex}">${c.dia}</strong> a las <strong>${formatTime(c.hora)}</strong>
  `;

  // Dirección
  document.getElementById('detailDireccion').textContent = c.direccion;

  // Referencia
  document.getElementById('detailReferencia').textContent = c.referencia;

  // Contactos con botones de acción
  const contactosHtml = c.contactos.map(num => {
    const mensaje = encodeURIComponent('Hola, quisiera obtener información sobre la célula.');
    const waLink = `https://wa.me/591${num}?text=${mensaje}`;

    return `
      <li class="contact-item">
        <span class="contact-number">
          <i class="fa-solid fa-mobile-screen"></i> +591 ${formatPhone(num)}
        </span>
        <div class="contact-actions">
          <button class="action-btn whatsapp" onclick="event.stopPropagation(); window.open('${waLink}', '_blank')" title="Enviar WhatsApp">
            <i class="fa-brands fa-whatsapp"></i>
          </button>
          <button class="action-btn call" onclick="event.stopPropagation(); window.location.href='tel:+591${num}'" title="Llamar">
            <i class="fa-solid fa-phone"></i>
          </button>
        </div>
      </li>
    `;
  }).join('');

  document.getElementById('detailContactos').innerHTML = contactosHtml;

  // Configurar botón Google Maps
  const gmapsBtn = document.getElementById('gmapsBtn');
  if (c.latitud && c.longitud) {
    gmapsBtn.onclick = () => {
      window.open(`https://www.google.com/maps/search/?api=1&query=${c.latitud},${c.longitud}`, '_blank');
    };
    gmapsBtn.style.display = 'flex';
  } else {
    // Sin coordenadas: buscar por dirección
    gmapsBtn.onclick = () => {
      const query = encodeURIComponent(c.direccion + ', La Paz, Bolivia');
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    };
    gmapsBtn.style.display = 'flex';
  }

  // Configurar botón de ubicación en detalle
  const detailLocBtn = document.getElementById('detailLocationBtn');
  detailLocBtn.onclick = () => {
    requestLocation(true, (err) => {
      if (!err && activeCelula) {
        showMapForCelula(activeCelula);
        updateDistanceDisplay(activeCelula);
      }
    });
  };

  // Mostrar mapa
  showMapForCelula(c);
  updateDistanceDisplay(c);

  // Mostrar vista de detalle
  const detailView = document.getElementById('detailView');
  detailView.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Scroll al inicio
  detailView.scrollTop = 0;
}

function closeDetail() {
  const detailView = document.getElementById('detailView');
  detailView.classList.remove('active');
  document.body.style.overflow = '';
  activeCelula = null;

  // Limpiar mapa después de un momento
  setTimeout(() => {
    clearMapMarkers();
    if (map) {
      map.remove();
      map = null;
      mapInitialized = false;
    }
  }, 400);
}

// ---------- Utilidades ----------
function formatTime(hora) {
  const [h, m] = hora.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
  return `${displayHour}:${m} ${ampm}`;
}

function formatPhone(num) {
  // Formato: 7XXXXXXX → 7XXXX XXX
  if (num.length === 8) {
    return num.slice(0, 4) + ' ' + num.slice(4);
  }
  return num;
}

// ---------- Toast Notification ----------
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const toastIcon = document.getElementById('toastIcon');
  const toastMessage = document.getElementById('toastMessage');

  if (!toast) return;

  // Iconos según tipo
  const icons = {
    info: 'fa-solid fa-circle-info',
    success: 'fa-solid fa-circle-check',
    error: 'fa-solid fa-circle-xmark',
    warning: 'fa-solid fa-triangle-exclamation'
  };

  toastIcon.className = icons[type] || icons.info;
  toastMessage.textContent = message;
  toast.className = `toast ${type} show`;

  // Auto-ocultar
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// ---------- Event Listeners ----------
function setupEventListeners() {
  // Búsqueda en tiempo real
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      renderCards();
    });
  }

  // Filtros por día
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderCards();
    });
  });

  // Botón de ubicación principal
  const locationBtn = document.getElementById('locationBtn');
  if (locationBtn) {
    locationBtn.addEventListener('click', () => {
      requestLocation(false, (err) => {
        if (!err) {
          renderCards();
        }
      });
    });
  }

  // Botón volver
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', closeDetail);
  }

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDetail();
    }
  });

  // Cerrar al hacer clic fuera del contenido (en el fondo oscuro)
  const detailView = document.getElementById('detailView');
  if (detailView) {
    detailView.addEventListener('click', (e) => {
      if (e.target === detailView) {
        closeDetail();
      }
    });
  }
}

// ---------- Geocodificación (opcional) ----------
/**
 * Función para geocodificar una dirección usando Nominatim (OpenStreetMap)
 * NOTA: Solo para uso de desarrollo. En producción, usa coordenadas fijas.
 * @param {string} direccion - Dirección a geocodificar
 * @param {Function} callback - (error, {lat, lng}) => {}
 */
function geocodificarDireccion(direccion, callback) {
  const query = encodeURIComponent(direccion + ', La Paz, Bolivia');
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      if (data && data.length > 0) {
        callback(null, {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        });
      } else {
        callback(new Error('No se encontraron resultados'));
      }
    })
    .catch(err => callback(err));
}

// Exportar funciones
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    renderCards,
    openDetail,
    closeDetail,
    formatTime,
    formatPhone,
    showToast,
    geocodificarDireccion
  };
}
