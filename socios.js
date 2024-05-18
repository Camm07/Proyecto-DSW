// Importa Firebase modules directamente, asumiendo que se usará en un ambiente que soporte módulos ES
import { db } from './app.js'; // Asegúrate de que la ruta al archivo app.js es correcta
import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

const auth = getAuth(); // Obtiene la instancia de FirebaseAuth

document.getElementById('formularioSocio').addEventListener('submit', async function(event) {
    event.preventDefault();
    const nombre = document.getElementById('nombreSocio').value;
    const apellidos = document.getElementById('apellidoSocio').value;
    const curp = document.getElementById('curpSocio').value;
    const correo = document.getElementById('correoSocio').value;
    const contraseña = document.getElementById('contraseñaSocio').value;
    const telefono = document.getElementById('telefonoSocio').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, correo, contraseña);
        const user = userCredential.user;
        console.log('Usuario de Firebase creado con UID:', user.uid);

        const docRef = await addDoc(collection(db, "Socios"), {
            nombre: nombre,
            apellidos: apellidos,
            curp: curp,
            correo: correo,
            telefono: telefono,
            tipo: "socio",
            uid: user.uid,// Guarda el UID proporcionado por Firebase Authentication
            status:"activo"  
        });
        console.log('Socio registrado con éxito, Document ID:', docRef.id);
        sessionStorage.setItem('socioDocId', docRef.id);  // Guardar el ID del documento para uso posterior
        alert('Socio registrado con éxito');
        document.getElementById('formularioSocio').reset(); // Limpia el formulario después de un registro exitoso
    } catch (error) {
        console.error('Error al registrar el socio:', error);
        alert('Error al registrar el socio: ' + error.message);
    }
});
