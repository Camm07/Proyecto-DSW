import { agregarSocio } from './socios.js'; // Asumiendo que la función agregarSocio está exportada desde socios.js

document.getElementById('formularioSocio').addEventListener('submit', function(event) {
    event.preventDefault(); // Previene la recarga de la página

    // Obtener los valores del formulario
    const nombre = document.getElementById('nombre').value;
    const apellidos = document.getElementById('apellidos').value;
    const correoElectronico = document.getElementById('correoElectronico').value;
    const telefono = document.getElementById('telefono').value;
    const curp = document.getElementById('curp').value;

    // Crear un objeto con los datos del socio
    const datosSocio = {
        nombre,
        apellidos,
        correoElectronico,
        telefono,
        curp
    };

    // Llamar a la función que añade el socio a Firestore
    agregarSocio(datosSocio)
        .then(() => {
            console.log('Socio registrado con éxito');
            // Aquí puedes limpiar el formulario o dar feedback al usuario
        })
        .catch(error => {
            console.error('Error al registrar el socio:', error);
        });
});
