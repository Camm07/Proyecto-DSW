const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const admin = require('firebase-admin');
const cors = require('cors');
//const serviceAccount = require('./proyecto-club-c2df1-firebase-adminsdk-dk4nz-ac366ea757.json');
const serviceAccount = require('./firebase-config.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();
app.use(cors());

const typeDefs = gql`
  type Reservation {
    id: ID!
    socioId: ID!
    fechaReservacion: String
    espacio: String
    estatus: String
    comentario: String
    fechaHoraSolicitud: String
  }

  type Query {
    reservations(socioId: ID!): [Reservation]
  }

  type Mutation {
    updateReservation(id: ID!, estatus: String!, comentario: String): Reservation
  }
`;

const resolvers = {
  Query: {
    reservations: async (_, { socioId }) => {
      try {
        const snapshot = await db.collection('Coleccion_Reservacion').where('Id_Socio', '==', socioId).get();
        return snapshot.docs.map(doc => {
          const data = doc.data();
          const fechaReservacion = data.Fecha_Reservacion; // Ya es un string, no se necesita convertir
          const fechaHoraSolicitud = data.Fecha_Hora_Solicitud ? new Date(data.Fecha_Hora_Solicitud.seconds * 1000).toISOString() : null;
          return {
            id: doc.id,
            socioId: data.Id_Socio,
            fechaReservacion: fechaReservacion, // Usar directamente como string
            espacio: data.Espacio,
            estatus: data.Estatus,
            comentario: data.Comentario,
            fechaHoraSolicitud: fechaHoraSolicitud // Convertir solo si es un timestamp
          };
        });
      } catch (error) {
        console.error("Error fetching reservations: ", error);
        throw new Error('Error fetching reservations');
      }
    }
  },
  Mutation: {
    updateReservation: async (_, { id, estatus, comentario }) => {
      const reservationRef = db.collection('Coleccion_Reservacion').doc(id);
      await reservationRef.update({ Estatus: estatus, Comentario: comentario });
      const updatedDoc = await reservationRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() };
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
server.start().then(res => {
  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
});
