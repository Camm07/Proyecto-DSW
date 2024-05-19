
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const mailjet = require('node-mailjet').connect('e955e90da09c96256437e2984642cf0e', '28be751e034e879f59cee46569ae69fe');

admin.initializeApp();

exports.enviarCorreoBienvenida = functions.firestore
    .document('Socios/{socioDocId}')
    .onCreate((snap, context) => {
        const socioData = snap.data();
        const email = socioData.correo;
        const nombre = socioData.nombre;

        return mailjet.post("send", { version: 'v3.1' })
            .request({
                Messages: [{
                    From: {
                        Email: "tzluquingo@ittepic.edu.mx",
                        Name: "Gerencia del club deportivo del valle"
                    },
                    To: [{
                        Email: email,
                        Name: nombre
                    }],
                    TemplateID: 5977265,  // Asegúrate de reemplazar esto con el ID real de tu plantilla de Mailjet
                    TemplateLanguage: true,
                    Subject: "Bienvenido al Club Deportivo del Valle",
                    Variables: {
                        nombre: nombre
                    }
                }]
            })
            .then((response) => {
                console.log('Correo enviado con éxito:', response.body);
            })
            .catch((error) => {
                console.error('Error al enviar correo:', error);
            });
    });
