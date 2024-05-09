// Import Firebase modules
//app.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, query, collection, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyArixMEtwWSmPkyL0hQeM9oJlOx8M-EYQw",
    authDomain: "proyecto-club-c2df1.firebaseapp.com",
    projectId: "proyecto-club-c2df1",
    storageBucket: "proyecto-club-c2df1.appspot.com",
    messagingSenderId: "23892425861",
    appId: "1:23892425861:web:90365701ddf91f255a3dec",
    measurementId: "G-P6JKL0L88M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export the database to be used in other modules
export { db };

// Function to handle login for both 'Usuario' and 'Socios' collections
async function handleLogin(email, password) {
    console.log("handleLogin started"); // Esto te mostrará si la función inicia
    let userFound = false; 
     // Flag to check if user is found

    // Query in 'Usuario' collection
    const usersRef = collection(db, "Usuario");
    const userQuery = query(usersRef, where("correo", "==", email));
    const userSnapshot = await getDocs(userQuery);
    
    userSnapshot.forEach(doc => {
        if (doc.data().contraseña === password) {
            console.log("Inicio de sesión exitoso como Usuario");
            window.location.href = doc.data().tipo === "administrador" ? 'inicioAdmin.html' : 'inicioSocio.html';
            userFound = true;  // Mark as found
        }
    });

    // Si no se encontró en 'Usuario', revisa en 'Socios'
    if (!userFound) {
        
        const sociosRef = collection(db, "Socios");
        const sociosQuery = query(sociosRef, where("correo", "==", email));
        const sociosSnapshot = await getDocs(sociosQuery);
       
        sociosSnapshot.forEach(doc => {
            if (doc.data().contraseña === password) {
                console.log("Inicio de sesión exitoso como Socio");
                window.location.href = 'inicioSocio.html';  // Assume socios go to the same page
                userFound = true;  // Mark as found
            }
        });
    }

    if (!userFound) {
        console.log("No user found or incorrect password");
        alert("Contraseña incorrecta o usuario no encontrado");
    }
}


// Event listener for form submission
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('formularioLogin');
    if (loginForm) {
        console.log("Form loaded and event listener attached.");
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            console.log("Form submitted");
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            await handleLogin(email, password);
        });
    } else {
        console.log("Form not found");
    }
});





