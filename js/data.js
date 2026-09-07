/**
 * ============================================
 * data.js - Datos de las Células
 * ============================================
 * 
 * Aquí se definen todas las células con su información.
 * Para agregar una nueva célula, copia un objeto existente
 * y modifica los valores.
 * 
 * IMPORTANTE SOBRE COORDENADAS:
 * - Si NO conoces latitud/longitud exactas, deja ambos como null
 * - Cuando tengas las coordenadas, reemplaza null por los números
 * - Puedes obtener coordenadas desde Google Maps (clic derecho → coordenadas)
 */

const celulas = [
  {
    id: 1,
    nombre: "Wilson, Xime, Raysa",
    dia: "Jueves",
    hora: "17:30",
    direccion: "Calle 20 de Octubre, casi esquina JJ Pérez, lado Aduana, piso 2, oficina 203",
    referencia: "A una cuadra del atrio de la UMSA",
    contactos: ["70672168", "70578836", "65616691"],
    latitud: null,   // ← Agregar coordenada cuando se conozca
    longitud: null,  // ← Agregar coordenada cuando se conozca
    color: "pink",
    hex: "#e91e63"
  },
  {
    id: 2,
    nombre: "Jhoselin, Gabriela",
    dia: "Sábado",
    hora: "15:30",
    direccion: "A una cuadra de la Plaza del Estudiante",
    referencia: "Cerca de la Plaza del Estudiante, La Paz",
    contactos: ["69965864", "73709294"],
    latitud: null,
    longitud: null,
    color: "teal",
    hex: "#00bcd4"
  },
  {
    id: 3,
    nombre: "Mady, Rodrigo",
    dia: "Sábado",
    hora: "15:00",
    direccion: "Entre Calle Chuquisaca y Av. América, Imprenta Lingraf",
    referencia: "A una cuadra de la Plaza Alonso de Mendoza",
    contactos: ["77727300", "62342955"],
    latitud: null,
    longitud: null,
    color: "orange",
    hex: "#ff9800"
  },
  {
    id: 4,
    nombre: "Cristhian, Angel, Rodrigo",
    dia: "Sábado",
    hora: "15:15",
    direccion: "El Tejar, Calle Silverio Menacho 1749",
    referencia: "Zona El Tejar, La Paz",
    contactos: ["60673165", "67082949", "73049635"],
    latitud: null,
    longitud: null,
    color: "purple",
    hex: "#9c27b0"
  },
  {
    id: 5,
    nombre: "Belén, Ariel, Oliver",
    dia: "Sábado",
    hora: "18:00",
    direccion: "Entre la Calle México y Colombia, Edif. México, Dep. 1501",
    referencia: "Edificio México, Departamento 1501",
    contactos: ["78950892", "78884336", "63247443"],
    latitud: null,
    longitud: null,
    color: "green",
    hex: "#4caf50"
  }
];

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { celulas };
}
