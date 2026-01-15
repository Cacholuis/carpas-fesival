import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB2WJHlyqhSHOj0jgD4ziQ-gQWsvPZIvoc",
  authDomain: "mapacarpasclub.firebaseapp.com",
  databaseURL: "https://mapacarpasclub-default-rtdb.firebaseio.com",
  projectId: "mapacarpasclub",
  storageBucket: "mapacarpasclub.firebasestorage.app",
  messagingSenderId: "497734007666",
  appId: "1:497734007666:web:e9248d74c47aec145efbeb"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM
const mapa = document.querySelector('.mapa-inner');
const resetBtn = document.getElementById('resetBtn');
const carpas = [];

const filas = { izquierda: 20, derecha: 20, atras: 30 };

// Crear Mapa
function crearMapa() {
  mapa.innerHTML = '';

  // Escenario
  const escenario = document.createElement('div');
  escenario.classList.add('escenario');
  escenario.textContent = 'ESCENARIO';
  mapa.appendChild(escenario);

  // Fila izquierda
  const filaIzq = document.createElement('div');
  filaIzq.classList.add('fila-vertical', 'fila-izquierda');
  mapa.appendChild(filaIzq);
  for (let i = 1; i <= filas.izquierda; i++) crearCarpa(`L${i}`, filaIzq);

  // Fila derecha
  const filaDer = document.createElement('div');
  filaDer.classList.add('fila-vertical', 'fila-derecha');
  mapa.appendChild(filaDer);
  for (let i = 1; i <= filas.derecha; i++) crearCarpa(`R${i}`, filaDer);

  // Fila trasera
  const filaTras = document.createElement('div');
  filaTras.classList.add('fila-trasera');
  mapa.appendChild(filaTras);
  for (let i = 1; i <= filas.atras; i++) crearCarpa(`A${i}`, filaTras);
}

// Crear Carpa (versión corregida)
function crearCarpa(id, contenedor) {
  const div = document.createElement('div');
  div.classList.add('carpas');
  div.dataset.id = id;
  div.textContent = id;
  contenedor.appendChild(div);
  carpas.push(div);

  div.addEventListener('click', () => {
    // Si ya está ocupada, solo mostrar tooltip
    if (div.classList.contains('ocupada')) {
      mostrarTooltip(div);
      return;
    }

    // Si está libre, permitir reserva
    const nombre = prompt('Ingrese su nombre:');
    const dni = prompt('Ingrese su documento:');
    if (!nombre || !dni) return;
    set(ref(db, `carpas/${id}`), { nombre, dni });
  });
}

// Escuchar cambios Firebase
onValue(ref(db, 'carpas'), (snapshot) => {
  const data = snapshot.val() || {};
  carpas.forEach(div => {
    const id = div.dataset.id;
    if (data[id]) {
      div.classList.add('ocupada');
    } else {
      div.classList.remove('ocupada');
    }
  });
});

// Botón reinicio con PIN
resetBtn.addEventListener('click', () => {
  const pin = prompt('Ingrese el PIN para reiniciar:');
  if (pin !== '034211') {
    alert('PIN incorrecto');
    return;
  }
  set(ref(db, 'carpas'), {});
  carpas.forEach(div => div.classList.remove('ocupada'));
  alert('Mapa reiniciado correctamente');
});

// -------------------------------------------------------------
// TOOLTIP FLOTANTE - Muestra datos al pasar o tocar una carpa ocupada
// -------------------------------------------------------------
// Mostrar información de carpa ocupada en celulares o PC (modo simple)
const mapaContainer = document.getElementById('mapa');

mapaContainer.addEventListener('click', (e) => {
  const target = e.target.closest('.carpas');
  if (!target) return;

  const id = target.dataset.id;
  const infoRef = ref(db, `carpas/${id}`);

  onValue(infoRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Mostrar datos en un modal nativo
      alert(`Carpa ${id}\n\nOcupada por: ${data.nombre}\nDNI: ${data.dni}`);
    }
  }, { onlyOnce: true });
});

crearMapa();
