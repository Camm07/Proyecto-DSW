// Importa Firebase modules directamente, asumiendo que se usará en un ambiente que soporte módulos ES
import { db } from './app.js'; // Asegúrate de que la ruta al archivo app.js es correcta
import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

document.getElementById('formularioSocio').addEventListener('submit', async function(event) {
    event.preventDefault();
    const nombre = document.getElementById('nombreSocio').value;
    const apellidos = document.getElementById('apellidoSocio').value;
    const curp = document.getElementById('curpSocio').value;
    const correo = document.getElementById('correoSocio').value;
    const contraseña = document.getElementById('contraseñaSocio').value;
    const telefono = document.getElementById('telefonoSocio').value;

    try {
        await addDoc(collection(db, "Socios"), {
            nombre: nombre,
            apellidos: apellidos,
            curp: curp,
            correo: correo,
            contraseña: contraseña,
            telefono: telefono,
            tipo: "socio"
        });
        console.log('Socio registrado con éxito');
        alert('Socio registrado con éxito');
        // Opcional: Limpia el formulario después de un registro exitoso
        document.getElementById('formularioSocio').reset();
    } catch (error) {
        console.error('Error al registrar el socio:', error);
        alert('Error al registrar el socio: ' + error.message);
    }
});