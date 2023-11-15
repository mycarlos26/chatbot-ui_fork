// import { MongoClient } from 'mongodb';

// // Configuración de la conexión a MongoDB
// const url = 'mongodb://localhost:27017'; // URL de la base de datos local
// const dbName = 'assistant_db'; // Nombre de la base de datos

// // Función para guardar el objeto en la base de datos
// export async function guardarthread(objeto:any) {
//   const client = new MongoClient(url);

//   try {
//     await client.connect(); // Conexión a la base de datos

//     const db = client.db(dbName); // Obtener la referencia a la base de datos
//     const collection = db.collection('threads'); // Obtener la referencia a la colección

//     const resultado = await collection.insertOne(objeto); // Insertar el objeto en la colección

//     console.log('Objeto guardado con éxito:', resultado.insertedId);
//   } catch (error) {
//     console.error('Error al guardar el objeto:', error);
//   } finally {
//     client.close(); // Cerrar la conexión
//   }
// };

// // Función para recuperar el objeto de la base de datos
// export async function recuperarthread() {
//     const client = new MongoClient(url);
  
//     try {
//       await client.connect(); // Conexión a la base de datos
  
//       const db = client.db(dbName); // Obtener la referencia a la base de datos
//       const collection = db.collection('threads'); // Obtener la referencia a la colección
  
//       const objetoRecuperado = await collection.findOne(); // Recuperar el primer documento de la colección
  
//       console.log('Objeto recuperado:', objetoRecuperado);

//       return objetoRecuperado;
//     } catch (error) {
//       console.error('Error al recuperar el objeto:', error);
//       return {};
//     } finally {
//       client.close(); // Cerrar la conexión
//     }
//   };