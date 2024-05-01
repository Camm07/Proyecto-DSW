import { db } from './conexion.js';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

// Añadir un nuevo socio
export async function agregarSocio(datosSocio) {
    try {
        const docRef = await addDoc(collection(db, "Socios"), datosSocio);
        console.log("Socio agregado con ID:", docRef.id);
    } catch (error) {
        console.error("Error al añadir socio:", error);
    }
}

// Obtener todos los socios
export async function obtenerSocios() {
    try {
        const querySnapshot = await getDocs(collection(db, "Socios"));
        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
        });
    } catch (error) {
        console.error("Error al obtener socios:", error);
    }
}

// Actualizar datos del socio
export async function actualizarSocio(docId, nuevosDatos) {
    try {
        const socioRef = doc(db, "Socios", docId);
        await updateDoc(socioRef, nuevosDatos);
        console.log("Datos del socio actualizados");
    } catch (error) {
        console.error("Error al actualizar datos del socio:", error);
    }
}

// Eliminar un socio
export async function eliminarSocio(docId) {
    try {
        await deleteDoc(doc(db, "Socios", docId));
        console.log("Socio eliminado");
    } catch (error) {
        console.error("Error al eliminar socio:", error);
    }
}
