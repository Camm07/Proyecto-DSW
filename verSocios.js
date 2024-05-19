// verSocios.js
// Importa Firebase modules
import { db } from './app.js';
import { collection, query, where, getDocs, updateDoc,doc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';


// Función para cargar y mostrar todos los socios
document.addEventListener('DOMContentLoaded', function() {
    // Cargar todos los socios al cargar la página
    loadSocios();

    // Añadir evento al select para cargar socios según el filtro seleccionado
    document.getElementById('filterStatus-socio').addEventListener('change', loadSocios);
});

// Función para cargar y mostrar los socios según el filtro seleccionado
async function loadSocios() {
    const filter = document.getElementById('filterStatus-socio').value;
    const sociosRef = collection(db, "Socios");
    let querySnapshot;

    if (filter === "Todos") {
        querySnapshot = await getDocs(sociosRef);
    } else {
        const q = query(sociosRef, where("status", "==", filter));
        querySnapshot = await getDocs(q);
    }

    displaySocios(querySnapshot);
}


// Función para mostrar los socios en la tabla
var miid = "";
var e = "";

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

        const imgCell = document.createElement('td');
        const img = document.createElement('img');
        img.src = data.fotoPerfil || 'https://firebasestorage.googleapis.com/v0/b/proyecto-club-c2df1.appspot.com/o/socio.png?alt=media&token=b766c205-80ec-45c6-bc3b-d6aadbcbb010'; // Usa la foto de perfil o una imagen por defecto
        img.alt = 'Foto de Perfil';
        img.style.width = '50px'; // Ajusta el tamaño según necesites
        img.style.height = '50px'; // Ajusta el tamaño según necesites
        imgCell.appendChild(img);

        const nameCell = document.createElement('td');
        nameCell.textContent = `${data.nombre} ${data.apellidos}`;

        const emailCell = document.createElement('td');
        emailCell.textContent = data.correo;

        const phoneCell = document.createElement('td');
        phoneCell.textContent = data.telefono;

        const statusCell = document.createElement('td');
        statusCell.textContent = data.status;

        const editCell = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.classList.add('edit-button');
        editButton.addEventListener('click', () => {
            // Lógica para editar
            miid = doc.id;
            console.log("llegue aqui " + doc.id + " = " + miid);
            const data = doc.data();
            document.getElementById('editNombre').value = data.nombre;
            document.getElementById('editApellidos').value = data.apellidos;
            document.getElementById('editCorreo').value = data.correo;
            document.getElementById('editTelefono').value = data.telefono;
            document.getElementById('modal').style.display = 'block';
        });
        editCell.appendChild(editButton);

        const deleteCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', async () => {
            // Lógica para eliminar
            const confirmDelete = confirm("¿Estás seguro de que deseas dar de baja al socio?");
            if (confirmDelete) {
                await updateDoc(doc(db, "Socios", doc.id), { status: 'Inactivo' });
                alert("Socio dado de baja con éxito.");
                loadSocios();
            }
        });
        deleteCell.appendChild(deleteButton);

        row.appendChild(imgCell);
        row.appendChild(nameCell);
        row.appendChild(emailCell);
        row.appendChild(phoneCell);
        row.appendChild(statusCell);
        row.appendChild(editCell);
        row.appendChild(deleteCell);

        tbody.appendChild(row);
    });
}


// Evento para cerrar el modal
document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('modal').style.display = 'none';
});
// hijo de su she madre - oraaa
document.addEventListener('DOMContentLoaded', () => {
    console.log("aaaa 2");
    console.log(miid);
    const guardarCambiosBtn = document.getElementById('guardarCambios');
    guardarCambiosBtn.addEventListener('click', async () => {
        event.preventDefault(); 
        console.log("Entre aquixd");
        console.log("JAJA : "+miid);
        const nombre = document.getElementById('editNombre').value;
        const apellidos = document.getElementById('editApellidos').value;
        const correo = document.getElementById('editCorreo').value;
        const telefono = document.getElementById('editTelefono').value;

        try {
            const docRef = doc(db, 'Socios', miid);
            await updateDoc(docRef, {
                nombre: nombre,
                apellidos: apellidos,
                correo: correo,
                telefono: telefono
            });
            loadSocios();
            await loadSocios();
            console.log("NICE");
            alert('Modificación exitosa');
            document.getElementById('modal').style.display = 'none';
        } catch (error) {
            e=error;
            console.error("Error actualizando documento: "+ error);
            console.log(e);
            alert('Ha ocurrido un error al actualizar' + error);
        }
    });
});

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
