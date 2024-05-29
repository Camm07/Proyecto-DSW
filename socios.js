//socios.js
// Importa Firebase modules
import { db } from './app.js';
import {  getFirestore, collection, query, where, getDocs, addDoc, updateDoc, doc} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

const auth = getAuth(); // Obtiene la instancia de FirebaseAuth

document.getElementById('formularioSocio').addEventListener('submit', async function(event) {
    event.preventDefault();

    const defaultImageUrl = "https://firebasestorage.googleapis.com/v0/b/proyecto-club-c2df1.appspot.com/o/socio.png?alt=media&token=b766c205-80ec-45c6-bc3b-d6aadbcbb010";
    
    const nombre = document.getElementById('nombreSocio').value;
    const apellidos = document.getElementById('apellidoSocio').value;
    const curp = document.getElementById('curpSocio').value;
    const correo = document.getElementById('correoSocio').value;
    const contraseña = document.getElementById('contraseñaSocio').value;
    const telefono = document.getElementById('telefonoSocio').value;

    try {
        // Consultar si el usuario ya existe
        const querySnapshot = await getDocs(query(collection(db, "Socios"), where("correo", "==", correo)));
        
        if (!querySnapshot.empty) {
            let usuarioExistente = null;
            
            querySnapshot.forEach((doc) => {
                usuarioExistente = { id: doc.id, data: doc.data() };
            });
    
            if (usuarioExistente.data.status === "Inactivo") {
                // Actualizar estado a Activo
                await updateDoc(doc(db, "Socios", usuarioExistente.id), {
                    status: "Activo"
                });
                showMessageModal(`El usuario ${correo} ha sido reactivado.`);
            } else {
                showMessageModal(`El usuario ${correo} ya está activo.`);
            }
        } else {
            // Si el usuario no existe, registrar nuevo usuario en Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, correo, contraseña);
            const user = userCredential.user;
            console.log('Usuario de Firebase creado con UID:', user.uid);
    
            // Registrar nuevo usuario en Firestore
            const docRef = await addDoc(collection(db, "Socios"), {
                nombre: nombre,
                apellidos: apellidos,
                curp: curp,
                correo: correo,
                telefono: telefono,
                tipo: "socio",
                uid: user.uid,
                status: "Activo",
                fotoPerfil: defaultImageUrl
            });
            console.log('Socio registrado con éxito, Document ID:', docRef.id);
    
            // Guardar el ID del documento en sessionStorage
            sessionStorage.setItem('socioDocId', docRef.id);
            sessionStorage.setItem('socioCorreo', correo);
            sessionStorage.setItem('socioNombre', nombre);
    
            console.log('Datos almacenados en sessionStorage:', {
                id: docRef.id,
                correo: correo,
                nombre: nombre
            });
            // Enviar el correo de bienvenida
            const correoEnviado = await enviarCorreoBienvenida(nombre, correo);
            showMessageModal('Socio registrado con éxito y correo de bienvenida enviado.');
        }
    
        // Limpiar el formulario después de un registro exitoso o reactivación
        document.getElementById('formularioSocio').reset();
    
    } catch (error) {
        console.error('Error al registrar el socio:', error);
        showMessageModal('Error al registrar el socio: ' + error.message);
    }
    
});

function showMessageModal(message) {
    const modalBody = document.getElementById('messageModalBody');
    modalBody.textContent = message;
    const messageModal = new bootstrap.Modal(document.getElementById('messageModal'), {
      keyboard: false
    });
    messageModal.show();
  }
  

async function enviarCorreoBienvenida(nombre, email) {
    try {
        const response = await fetch('http://localhost:3000/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, email })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Correo de bienvenida enviado con éxito:', data);
        } else {
            throw new Error('Error al enviar el correo de bienvenida');
        }
    } catch (error) {
        console.error('Error al enviar el correo de bienvenida:', error);
    }
}

