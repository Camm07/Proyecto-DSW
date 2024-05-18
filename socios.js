//socios.js
// Importa Firebase modules
import { db } from './app.js';
import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

const auth = getAuth(); // Obtiene la instancia de FirebaseAuth

document.getElementById('formularioSocio').addEventListener('submit', async function(event) {
    event.preventDefault();

    // URL de la imagen por defecto
    const defaultImageUrl = "https://firebasestorage.googleapis.com/v0/b/proyecto-club-c2df1.appspot.com/o/socio.png?alt=media&token=b766c205-80ec-45c6-bc3b-d6aadbcbb010";

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
            uid: user.uid, // Guarda el UID proporcionado por Firebase Authentication
            status: "activo",
            fotoPerfil: defaultImageUrl  // Asigna la URL de la imagen por defecto
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

