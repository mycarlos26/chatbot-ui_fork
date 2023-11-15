
export async function insertDocument(data) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    // Use CORS headers if required by target server, otherwise remove this line
    myHeaders.append("Access-Control-Allow-Origin", "*");
    myHeaders.append("api-key", "pbeOctEGyCNUyDqIsUxGvV33XTTDKTkVoC70ScZB7pQiowpF3lJZETCC5l2ZfFhr");
  
    const raw = JSON.stringify({
      "dataSource": "Cluster0",
      "database": "GPT_Test",
      "collection": "threads",
      "document": data,
    });
  
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
  
    try {
      const response = await fetch("https://us-east-1.aws.data.mongodb-api.com/app/data-irbhf/endpoint/data/v1/action/insertOne", requestOptions);
      const result = await response.json(); // Usar .json() si la respuesta es JSON
      console.log(result);
    } catch (error) {
      console.error('Error during document insertion:', error);
    }
};

// Creamos una función asíncrona para realizar la búsqueda de un documento.
export async function findDocument() {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    // Aquí se usa `Access-Control-Allow-Origin`, pero como cliente generalmente no es necesario
    // especificarlo a menos que crees un cliente que se ejecute fuera del navegador (como en Node.js).
    myHeaders.append("api-key", "pbeOctEGyCNUyDqIsUxGvV33XTTDKTkVoC70ScZB7pQiowpF3lJZETCC5l2ZfFhr");
    myHeaders.append("Accept", "application/json");
  
    const raw = JSON.stringify({
      "dataSource": "Cluster0",
      "database": "GPT_Test",
      "collection": "threads",
      "filter": {
        "id": "thread_bs4R3njPK2NXJNbtBA7TdbzC"
      }
    });
  
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
  
    try {
      // La respuesta del endpoint es asumida como JSON según la cabecera "Accept" especificada.
      // Usamos `fetch` con `await` para esperar la respuesta.
      const response = await fetch("https://us-east-1.aws.data.mongodb-api.com/app/data-irbhf/endpoint/data/v1/action/findOne", requestOptions);
      if (!response.ok) {
        // Si la respuesta no es exitosa, lanzamos un error con el estado de la respuesta.
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      // Asumiendo que la respuesta es JSON, parseamos el resultado.
      const result = await response.json();
      return result;
      //console.log(result);
    } catch (error) {
      // Manejamos cualquier error que haya ocurrido durante la solicitud.
      console.error('Error fetching the document:', error);
    }
};