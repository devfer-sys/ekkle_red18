
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

  // Separar la nota de las células normales
  const celulasNormales = celulas.filter(c => c.tipo !== 'nota');
  const nota = celulas.find(c => c.tipo === 'nota');

  // Normalizar búsqueda
  const searchLower = currentSearch
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  // Filtrar células
  let filtered = celulasNormales.filter(c => {

    // Filtro por día
    const matchesFilter =
      currentFilter === 'todos' ||
      c.dia === currentFilter;

    // Datos normalizados
    const nombreNormalized = c.nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const diaNormalized = c.dia
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const dirNormalized = c.direccion
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const refNormalized = c.referencia
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    // Horario original
    const horaOriginal = c.hora.toLowerCase();

    // Horario en formato AM/PM
    const horaFormateada = formatTime(c.hora)
      .toLowerCase();

    // Horario sin dos puntos
    const horaSinDosPuntos =
      c.hora.replace(':', '');

    // Ejemplo:
    // 18:00
    // 1800
    // 6:00 pm
    // 6 pm
    const matchesHora =
      horaOriginal.includes(searchLower) ||
      horaFormateada.includes(searchLower) ||
      horaSinDosPuntos.includes(searchLower);

    // Contactos
    const matchesContacto =
      c.contactos.some(num =>
        num.includes(searchLower)
      );

    // Búsqueda
    const matchesSearch =
      !searchLower ||
      nombreNormalized.includes(searchLower) ||
      diaNormalized.includes(searchLower) ||
      dirNormalized.includes(searchLower) ||
      refNormalized.includes(searchLower) ||
      matchesHora ||
      matchesContacto;

    return matchesFilter && matchesSearch;
  });

  // Ordenar por distancia si existe ubicación
  if (userLocation) {

    filtered.sort((a, b) => {

      const distA = getDistanceToCelula(a);
      const distB = getDistanceToCelula(b);

      if (distA === null && distB === null) {
        return 0;
      }

      if (distA === null) {
        return 1;
      }

      if (distB === null) {
        return -1;
      }

      return distA - distB;
    });
  }

  // ==========================================
  // HAY RESULTADOS
  // ==========================================

  if (filtered.length > 0) {

    noResults.style.display = 'none';

    const cardsHtml = filtered.map((c, index) => {

      const dist = getDistanceToCelula(c);

      const distHtml = dist !== null
        ? `
          <div class="distance-badge visible">
            <i class="fa-solid fa-location-arrow"></i>
            ${formatDistance(dist)}
          </div>
        `
        : '';

      const horaFormateada =
        formatTime(c.hora);

      // Contactos
      const contactosHtml =
        c.contactos.map(num => {

          const mensaje =
            encodeURIComponent(
              'Hola, quisiera obtener información sobre la célula.'
            );

          const waLink =
            `https://wa.me/591${num}?text=${mensaje}`;

          return `
            <li class="contact-item">

              <span class="contact-number">
                <i class="fa-solid fa-mobile-screen"></i>
                +591 ${formatPhone(num)}
              </span>

              <div class="contact-actions">

                <a
                  class="action-btn whatsapp"
                  href="${waLink}"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Enviar WhatsApp"
                  onclick="event.stopPropagation();"
                >
                  <i class="fa-brands fa-whatsapp"></i>
                </a>

                <a
                  class="action-btn call"
                  href="tel:+591${num}"
                  title="Llamar"
                  onclick="event.stopPropagation();"
                >
                  <i class="fa-solid fa-phone"></i>
                </a>

              </div>

            </li>
          `;
        }).join('');

      return `
        <article
          class="celula-card"
          data-color="${c.color}"
          style="animation-delay: ${index * 0.05}s"
          onclick="openDetail(${c.id})"
        >

          ${distHtml}

          <div class="card-header">

            <div class="card-title">
              Célula ${c.nombre}
            </div>

            <div class="card-members">
              <i class="fa-solid fa-users"></i>
              ${c.contactos.length}
              contactos disponibles
            </div>

          </div>

          <div class="card-body">

            <!-- HORARIO -->

            <div class="info-row">

              <div class="info-icon ${c.color}">
                <i class="fa-regular fa-clock"></i>
              </div>

              <div>

                <div class="info-label">
                  Horario
                </div>

                <div class="info-text">
                  ${c.dia} · ${horaFormateada}
                </div>

              </div>

            </div>

            <!-- DIRECCIÓN -->

            <div class="info-row">

              <div class="info-icon ${c.color}">
                <i class="fa-solid fa-location-dot"></i>
              </div>

              <div>

                <div class="info-label">
                  Dirección
                </div>

                <div class="info-text">
                  ${c.direccion}
                </div>

              </div>

            </div>

            <!-- REFERENCIA -->

            <div class="info-row">

              <div class="info-icon ${c.color}">
                <i class="fa-solid fa-map-pin"></i>
              </div>

              <div>

                <div class="info-label">
                  Referencia
                </div>

                <div class="info-text">
                  ${c.referencia}
                </div>

              </div>

            </div>

            <!-- CONTACTOS -->

            <div
              class="card-members"
              style="margin: 22px 0 12px;"
            >
              <i class="fa-solid fa-address-book"></i>
              Contactos
            </div>

            <ul class="contact-list">
              ${contactosHtml}
            </ul>

          </div>

          <!-- UBICACIÓN -->

          <div class="card-footer">

            <a
              href="${c.link}"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-ver ${c.color}"
              style="text-decoration: none;"
              onclick="event.stopPropagation();"
            >
              <i class="fa-solid fa-location-arrow"></i>
              Ir a la ubicación
            </a>

          </div>

        </article>
      `;
    }).join('');

    // IMPORTANTE:
    // La nota SOLO aparece cuando el filtro es "todos"
    // y no estamos haciendo una búsqueda.
    let notaHtml = '';

    if (
      currentFilter === 'todos' &&
      !searchLower &&
      nota
    ) {
      notaHtml = renderNota(nota);
    }

    grid.innerHTML =
      cardsHtml +
      notaHtml;

    return;
  }

  // ==========================================
  // NO HAY RESULTADOS
  // ==========================================

  grid.innerHTML = '';

  noResults.style.display = 'block';

  // Cuando NO hay resultados mostramos la nota
  if (nota) {

    grid.innerHTML =
      renderNota(nota);
  }
}

// ---------- Renderizado de Nota ----------

function renderNota(nota) {

  const contactos = nota.contactos || [];

  const contactosHtml =
    contactos.map(num => {

      const mensaje =
        encodeURIComponent(
          'Hola, quisiera obtener información sobre los días de las células.'
        );

      const waLink =
        `https://wa.me/591${num}?text=${mensaje}`;

      return `
        <div class="nota-contact">

          <span class="nota-number">
            <i class="fa-solid fa-mobile-screen"></i>
            +591 ${formatPhone(num)}
          </span>

          <div class="nota-actions">

            <a
              href="${waLink}"
              target="_blank"
              rel="noopener noreferrer"
              class="nota-btn whatsapp"
              title="Enviar WhatsApp"
            >
              <i class="fa-brands fa-whatsapp"></i>
            </a>

            <a
              href="tel:+591${num}"
              class="nota-btn call"
              title="Llamar"
            >
              <i class="fa-solid fa-phone"></i>
            </a>

          </div>

        </div>
      `;
    }).join('');

  return `
    <article class="nota-card">
      <!--
      <div class="nota-icon">
        <i class="fa-solid fa-heart"></i>
      </div>
      -->

      <div class="nota-content">

        <h3>
          ¿No encuentras un día que te quede cómodo?
        </h3>

        <p>
          ${nota.mensaje}
        </p>
        <div class="nota-contacts">
          ${contactosHtml}
        </div>

      </div>

    </article>
  `;
}

// ---------- Vista de Detalle ----------

function openDetail(id) {

  const c = celulas.find(x => x.id === id);

  if (!c || c.tipo === 'nota') {
    return;
  }

  activeCelula = c;

  // Título
  document.getElementById('detailTitle').textContent =
    'Célula ' + c.nombre;

  // Subtítulo
  document.getElementById('detailSubtitle').innerHTML = `
    <i
      class="fa-regular fa-calendar"
      style="color: ${c.hex}"
    ></i>

    ${c.dia} &bull; ${formatTime(c.hora)}
  `;

  // Horario
  document.getElementById('detailHorario').innerHTML = `
    <strong style="color: ${c.hex}">
      ${c.dia}
    </strong>

    a las

    <strong>
      ${formatTime(c.hora)}
    </strong>
  `;

  // Dirección
  document.getElementById('detailDireccion').textContent =
    c.direccion;

  // Referencia
  document.getElementById('detailReferencia').textContent =
    c.referencia;

  // Contactos
  const contactosHtml =
    c.contactos.map(num => {

      const mensaje =
        encodeURIComponent(
          'Hola, quisiera obtener información sobre la célula.'
        );

      const waLink =
        `https://wa.me/591${num}?text=${mensaje}`;

      return `
        <li class="contact-item">

          <span class="contact-number">

            <i class="fa-solid fa-mobile-screen"></i>

            +591 ${formatPhone(num)}

          </span>

          <div class="contact-actions">

            <a
              class="action-btn whatsapp"
              href="${waLink}"
              target="_blank"
              rel="noopener noreferrer"
              title="Enviar WhatsApp"
            >
              <i class="fa-brands fa-whatsapp"></i>
            </a>

            <a
              class="action-btn call"
              href="tel:+591${num}"
              title="Llamar"
            >
              <i class="fa-solid fa-phone"></i>
            </a>

          </div>

        </li>
      `;

    }).join('');

  document.getElementById('detailContactos').innerHTML =
    contactosHtml;

  // Google Maps
  const gmapsBtn =
    document.getElementById('gmapsBtn');

  if (c.latitud && c.longitud) {

    gmapsBtn.onclick = () => {

      window.open(
        `https://www.google.com/maps/search/?api=1&query=${c.latitud},${c.longitud}`,
        '_blank'
      );

    };

    gmapsBtn.style.display = 'flex';

  } else {

    gmapsBtn.onclick = () => {

      const query =
        encodeURIComponent(
          c.direccion + ', La Paz, Bolivia'
        );

      window.open(
        `https://www.google.com/maps/search/?api=1&query=${query}`,
        '_blank'
      );

    };

    gmapsBtn.style.display = 'flex';
  }

  // Botón de ubicación
  const detailLocBtn =
    document.getElementById('detailLocationBtn');

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

  // Mostrar vista detalle
  const detailView =
    document.getElementById('detailView');

  detailView.classList.add('active');

  document.body.style.overflow = 'hidden';

  detailView.scrollTop = 0;
}

// ---------- Cerrar Detalle ----------

function closeDetail() {

  const detailView =
    document.getElementById('detailView');

  detailView.classList.remove('active');

  document.body.style.overflow = '';

  activeCelula = null;

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

  const hour =
    parseInt(h, 10);

  const ampm =
    hour >= 12 ? 'PM' : 'AM';

  const displayHour =
    hour > 12
      ? hour - 12
      : (hour === 0 ? 12 : hour);

  return `${displayHour}:${m} ${ampm}`;
}

function formatPhone(num) {

  if (num.length === 8) {

    return (
      num.slice(0, 4) +
      ' ' +
      num.slice(4)
    );
  }

  return num;
}

// ---------- Toast Notification ----------

function showToast(
  message,
  type = 'info'
) {

  const toast =
    document.getElementById('toast');

  const toastIcon =
    document.getElementById('toastIcon');

  const toastMessage =
    document.getElementById('toastMessage');

  if (!toast) {
    return;
  }

  const icons = {

    info:
      'fa-solid fa-circle-info',

    success:
      'fa-solid fa-circle-check',

    error:
      'fa-solid fa-circle-xmark',

    warning:
      'fa-solid fa-triangle-exclamation'
  };

  toastIcon.className =
    icons[type] || icons.info;

  toastMessage.textContent =
    message;

  toast.className =
    `toast ${type} show`;

  setTimeout(() => {

    toast.classList.remove('show');

  }, 4000);
}

// ---------- Event Listeners ----------

function setupEventListeners() {

  // Búsqueda en tiempo real
  const searchInput =
    document.getElementById('searchInput');

  if (searchInput) {

    searchInput.addEventListener(
      'input',
      (e) => {

        currentSearch =
          e.target.value;

        renderCards();
      }
    );
  }

  // Filtros por día
  document
    .querySelectorAll('.filter-btn')
    .forEach(btn => {

      btn.addEventListener(
        'click',
        () => {

          document
            .querySelectorAll('.filter-btn')
            .forEach(b => {

              b.classList.remove('active');

            });

          btn.classList.add('active');

          currentFilter =
            btn.dataset.filter;

          renderCards();
        }
      );

    });

  // Botón de ubicación principal
  const locationBtn =
    document.getElementById('locationBtn');

  if (locationBtn) {

    locationBtn.addEventListener(
      'click',
      () => {

        requestLocation(
          false,
          (err) => {

            if (!err) {
              renderCards();
            }

          }
        );

      }
    );
  }

  // Botón volver
  const backBtn =
    document.getElementById('backBtn');

  if (backBtn) {

    backBtn.addEventListener(
      'click',
      closeDetail
    );
  }

  // Escape
  document.addEventListener(
    'keydown',
    (e) => {

      if (e.key === 'Escape') {
        closeDetail();
      }

    }
  );

  // Cerrar detalle al hacer clic fuera
  const detailView =
    document.getElementById('detailView');

  if (detailView) {

    detailView.addEventListener(
      'click',
      (e) => {

        if (e.target === detailView) {
          closeDetail();
        }

      }
    );
  }
}

// ---------- Geocodificación ----------

function geocodificarDireccion(
  direccion,
  callback
) {

  const query =
    encodeURIComponent(
      direccion + ', La Paz, Bolivia'
    );

  const url =
    `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;

  fetch(url)

    .then(res => res.json())

    .then(data => {

      if (
        data &&
        data.length > 0
      ) {

        callback(null, {

          lat:
            parseFloat(data[0].lat),

          lng:
            parseFloat(data[0].lon)

        });

      } else {

        callback(
          new Error(
            'No se encontraron resultados'
          )
        );
      }

    })

    .catch(err =>
      callback(err)
    );
}

// ---------- Exportar funciones ----------

if (
  typeof module !== 'undefined' &&
  module.exports
) {

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

