import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
console.log("Conectado correctamente a Firebase.");

/* ===========================
   VARIABLES Y CONSTANTES
=========================== */
const mapa = document.getElementById("mapa");
const tooltip = document.getElementById("tooltip");
const ADMIN_PIN = "festival"; // clave del administrador

/* ===========================
   CREACIÓN DEL MAPA
=========================== */
function crearMapa() {
  mapa.innerHTML = "";

  const filaSuperior = document.createElement("div");
  filaSuperior.classList.add("fila-horizontal");

  // Carpas A1–A30 (fila superior)
  for (let i = 1; i <= 30; i++) {
    const id = `A${i}`;
    const carpa = crearCarpa(id);
    filaSuperior.appendChild(carpa);
  }

  const colIzquierda = document.createElement("div");
  colIzquierda.classList.add("columna-izquierda");

  // Carpas L1–L20 (columna izquierda)
  for (let i = 1; i <= 20; i++) {
    const id = `L${i}`;
    const carpa = crearCarpa(id);
    colIzquierda.appendChild(carpa);
  }

  const colDerecha = document.createElement("div");
  colDerecha.classList.add("columna-derecha");

  // Carpas R1–R20 (columna derecha)
  for (let i = 1; i <= 20; i++) {
    const id = `R${i}`;
    const carpa = crearCarpa(id);
    colDerecha.appendChild(carpa);
  }

  mapa.appendChild(filaSuperior);
  mapa.appendChild(colIzquierda);
  mapa.appendChild(colDerecha);
}

/* ===========================
   CREACIÓN DE CADA CARPA
=========================== */
function crearCarpa(id) {
  const div = document.createElement("div");
  div.classList.add("carpa", "libre");
  div.textContent = id;
  div.dataset.id = id;
  div.addEventListener("click", manejarReserva);
  return div;
}

/* ===========================
   LÓGICA DE RESERVA / CANCELACIÓN
=========================== */
async function manejarReserva(e) {
  const carpa = e.target;
  const id = carpa.dataset.id;
  const infoRef = ref(db, `carpas/${id}`);
  const snapshot = await get(infoRef);

  if (snapshot.exists()) {
    // Carpa ocupada → pedir PIN del administrador
    const pin = prompt("Ingrese la clave de administrador para cancelar la reserva:");
    if (pin === ADMIN_PIN) {
      await remove(infoRef);
      carpa.classList.remove("ocupada");
      carpa.classList.add("libre");
      alert(`Reserva de ${id} cancelada correctamente.`);
    } else if (pin !== null) {
      alert("Clave incorrecta. No se pudo cancelar la reserva.");
    }
  } else {
    // Carpa libre → reservar
    const nombre = prompt("Ingrese su nombre:");
    const dni = prompt("Ingrese su DNI:");
    if (nombre && dni) {
      await set(infoRef, { nombre, dni });
      carpa.classList.remove("libre");
      carpa.classList.add("ocupada");
    }
  }
}

/* ===========================
   TOOLTIP (mostrar info ocupante)
=========================== */
function activarTooltip(carpa, datos) {
  carpa.addEventListener("mouseenter", (e) => {
    tooltip.textContent = `${datos.nombre} - DNI ${datos.dni}`;
    tooltip.style.display = "block";
    tooltip.style.left = e.pageX + 10 + "px";
    tooltip.style.top = e.pageY + 10 + "px";
  });

  carpa.addEventListener("mouseleave", () => {
    tooltip.style.display = "none";
  });
}

/* ===========================
   ESCUCHA EN TIEMPO REAL (Firebase)
=========================== */
function escucharFirebase() {
  const carpasRef = ref(db, "carpas");
  onValue(carpasRef, (snapshot) => {
    const datos = snapshot.val() || {};
    document.querySelectorAll(".carpa").forEach((carpa) => {
      const id = carpa.dataset.id;
      if (datos[id]) {
        carpa.classList.remove("libre");
        carpa.classList.add("ocupada");
        activarTooltip(carpa, datos[id]);
      } else {
        carpa.classList.remove("ocupada");
        carpa.classList.add("libre");
      }
    });
  });
}

/* ===========================
   INICIALIZACIÓN
=========================== */
crearMapa();
escucharFirebase();
