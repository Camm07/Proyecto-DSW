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

//correo reservaciones socio de socio a administrador
app.post('/correo-reserva', (req, res) => {
    const { nombre, email, espacio, fechaReservacion,telefono} = req.body;

    const transporter = nodemailer.createTransport({
        service: 'hotmail', 
        auth: {
            user: "clubdelvalleproyecto@hotmail.com", // Correo del socio
            pass: 'ProyectoClub123456' // Contraseña del socio
        }
    });

    const mailOptions = {
        from: "clubdelvalleproyecto@hotmail.com",
        to: 'clubdelvalleproyecto@hotmail.com', // Correo del administrador
        subject: `Nueva Reservación de ${email}`,
        text: `Estimado Administrador,

        El socio ${nombre} con (${email}) ha realizado una reservación.

        Detalles de la reservación
        Espacio: ${espacio}
        Fecha de Reservación: ${fechaReservacion}
        Teléfono: ${telefono}`
        
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error al enviar el correo:', error);
            res.status(500).send('Error al enviar el correo');
        } else {
            console.log('Correo enviado con éxito:', info.response);
            res.status(200).send('Correo enviado con éxito');
        }
    });
});

//correo solicitudes socio, de socio a administrador
app.post('/correo-soli', (req, res) => {
    const { nombre, email, comentario,telefono} = req.body;

    const transporter = nodemailer.createTransport({
        service: 'hotmail', 
        auth: {
            user: "clubdelvalleproyecto@hotmail.com", // Correo del socio
            pass: 'ProyectoClub123456' // Contraseña del socio
        }
    });

    const mailOptions = {
        from: "clubdelvalleproyecto@hotmail.com",
        to: 'clubdelvalleproyecto@hotmail.com', // Correo del administrador
        subject: `Nueva Solicitud de ${email}`,
        text: `Estimado Administrador,

        El socio ${nombre} con (${email}) ha realizado una solicitud.

        Detalles de la solicitud
        Comentario: ${comentario}
        Teléfono: ${telefono}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error al enviar el correo:', error);
            res.status(500).send('Error al enviar el correo');
        } else {
            console.log('Correo enviado con éxito:', info.response);
            res.status(200).send('Correo enviado con éxito');
        }
    });
});

//enviarcorreo administrador reservaciones de administrador a socio
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

//enviarcorreo administrador solicitudes - de administrador a socio
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
