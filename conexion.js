// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
// Inicializar Firebase Authentication
const auth = getAuth(app);
// Inicializar Firestore
const db = getFirestore(app);
// Exportar para uso en otros archivos
export { auth, db };