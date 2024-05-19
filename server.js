
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

app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
