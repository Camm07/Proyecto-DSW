// verSocios.js
// Importa Firebase modules
import { db } from './app.js';
import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// Función para cargar y mostrar todos los socios
async function loadSocios() {
    const sociosRef = collection(db, "Socios");
    const snapshot = await getDocs(sociosRef);
    displaySocios(snapshot);
}

// Función para mostrar los socios en la tabla
function displaySocios(snapshot) {
    const table = document.getElementById('sociosTable');
    let tbody = table.querySelector('tbody');
    if (!tbody) {
        tbody = document.createElement('tbody');
        table.appendChild(tbody);
    } else {
        tbody.innerHTML = ''; // Limpiar la tabla antes de añadir nuevos resultados
    }

    snapshot.forEach(doc => {
        const data = doc.data();
        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        nameCell.textContent = `${data.nombre} ${data.apellidos}`;
        const emailCell = document.createElement('td');
        emailCell.textContent = data.correo;
        const phoneCell = document.createElement('td');
        phoneCell.textContent = data.telefono;

        row.appendChild(nameCell);
        row.appendChild(emailCell);
        row.appendChild(phoneCell);
        tbody.appendChild(row);
    });
}

// Función para buscar socios por cualquier campo
async function searchSocios() {
    const searchTerm = document.getElementById('searchBox').value.toLowerCase();
    const sociosRef = collection(db, "Socios");
    const snapshot = await getDocs(sociosRef);
    const filteredDocs = snapshot.docs.filter(doc => {
        const data = doc.data();
        return `${data.nombre} ${data.apellidos}`.toLowerCase().includes(searchTerm) ||
               data.correo.toLowerCase().includes(searchTerm) ||
               data.telefono.includes(searchTerm);
    });

    displaySocios(filteredDocs);
}

document.addEventListener('DOMContentLoaded', function() {
    loadSocios();
    const searchBox = document.getElementById('searchBox');
    searchBox.addEventListener('input', searchSocios); // Búsqueda dinámica al escribir
});
