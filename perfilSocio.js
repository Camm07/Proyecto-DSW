// perfilSocio.js
import { db, storage } from './app.js';
import { doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

document.addEventListener('DOMContentLoaded', async function() {
    const socioDocId = sessionStorage.getItem('socioDocId');
    if (socioDocId) {
        const socioDocRef = doc(db, "Socios", socioDocId);
        const docSnap = await getDoc(socioDocRef);
        if (docSnap.exists()) {
            const socioData = docSnap.data();
            document.getElementById('codigo').value = socioDocId;
            document.getElementById('usuario').value = `${socioData.nombre} ${socioData.apellidos}`;
            document.getElementById('email').value = socioData.correo;
            document.getElementById('tel').value = socioData.telefono;
            document.getElementById('profileImage').src = socioData.fotoPerfil || 'imagenes/socio.png';
        }
    }

    document.getElementById('changeProfilePic').addEventListener('click', function() {
        document.getElementById('fileInput').click();
    });

    document.getElementById('fileInput').addEventListener('change', async function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const storageRef = ref(storage, `profileImages/${socioDocId}`);
        await uploadBytes(storageRef, file);
        const photoURL = await getDownloadURL(storageRef);

        await updateDoc(doc(db, "Socios", socioDocId), { fotoPerfil: photoURL });
        document.getElementById('profileImage').src = photoURL;
    });
});


