const nodemailer = require('nodemailer');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mailjet = require('node-mailjet').apiConnect('e955e90da09c96256437e2984642cf0e', '28be751e034e879f59cee46569ae69fe');

const app = express();
const port = 3000;

// Habilitar CORS para todas las solicitudes
app.use(cors());

// Middleware para analizar JSON
app.use(express.json());

app.post('/send-email', (req, res) => {
    const { nombre, email } = req.body;

    const request = mailjet.post("send", { 'version': 'v3.1' }).request({
        "Messages": [{
            "From": {
                "Email": "tzluquingo@ittepic.edu.mx",
                "Name": "Gerencia del club deportivo del valle"
            },
            "To": [{
                "Email": email,
                "Name": nombre
            }],
            "TemplateID": 5977265,
            "TemplateLanguage": true,
            "Subject": "Bienvenido al Club Deportivo del Valle",

        }]
    });

    request.then((result) => {
        res.status(200).send('Correo enviado con éxito');
    }).catch((err) => {
        console.error('Error al enviar el correo:', err.statusCode, err.message);
        res.status(500).send('Error al enviar el correo');
    });
});

/*
// correo reservaciones

app.post('/reserve', (req, res) => {
    const { idSocio, espacio, fechaIn, email, nombre,contraseña } = req.body;
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Puedes usar otro servicio de correo si lo prefieres
        auth: {
            user: email, 
            pass: contraseña 
        }
    });
    // Datos del administrador
    const adminEmail = 'clubdelvalleproyecto@hotmail.com'; // Reemplaza con el correo del administrador

    const mailOptions = {
        from: email,
        to: adminEmail,
        subject: 'Nueva Reserva Realizada',
        text: `Estimado Administrador,\n\nEl socio ${nombre} (${email}) ha realizado una reserva.\n\nDetalles de la reserva:\n- Espacio: ${espacio}\n- Fecha: ${fechaIn}\n\nSaludos,\nClub Deportivo del Valle`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error al enviar el correo:', error);
            res.status(500).send('Error al enviar el correo');
        } else {
            console.log('Correo enviado:', info.response);
            res.status(200).send('Reserva creada y correo enviado con éxito');
        }
    });
});
*/
//enviarcorreo administrador reservaciones
app.post('/correo-reservacion', (req, res) => {
    const { nombre, email, espacio, fechaReservacion, comentario, estatus } = req.body;

    const request = mailjet.post("send", { 'version': 'v3.1' }).request({
        "Messages": [{
            "From": {
                "Email": "tzluquingo@ittepic.edu.mx",
                "Name": "Gerencia del club deportivo del valle"
            },
            "To": [{
                "Email": email,
                "Name": nombre
            }],
            "Subject": `Reservación ${estatus} - Club Deportivo del Valle`,
            "TextPart": `Estimado ${nombre},\n\nSu reservación para el espacio ${espacio} el día ${fechaReservacion} ha sido ${estatus.toLowerCase()}.\n\nComentario del administrador: ${comentario}\n\nSaludos,\nClub Deportivo del Valle`
        }]
    });

    request.then((result) => {
        res.status(200).send('Correo enviado con éxito');
    }).catch((err) => {
        console.error('Error al enviar el correo:', err.statusCode, err.message);
        res.status(500).send('Error al enviar el correo');
    });
});

//enviarcorreo administrador solicitudes
app.post('/correo-solicitud', (req, res) => {
    const { nombre, email, comentario, estatus } = req.body;

    const request = mailjet.post("send", { 'version': 'v3.1' }).request({
        "Messages": [{
            "From": {
                "Email": "tzluquingo@ittepic.edu.mx",
                "Name": "Gerencia del club deportivo del valle"
            },
            "To": [{
                "Email": email,
                "Name": nombre
            }],
            "Subject": `Solicitud ${estatus} - Club Deportivo del Valle`,
            "TextPart": `Estimado socio ${nombre},\n\nSu solicitud ha sido ${estatus.toLowerCase()}.\n\nComentario del administrador: ${comentario}\n\nSaludos,\nClub Deportivo del Valle`
        }]
    });

    request.then((result) => {
        res.status(200).send('Correo enviado con éxito');
    }).catch((err) => {
        console.error('Error al enviar el correo:', err.statusCode, err.message);
        res.status(500).send('Error al enviar el correo');
    });
});
app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
