const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Asegúrate de tener tu API key en una variable de entorno
const API_KEY_MONGODB  = process.env.MONGODB_API_KEY;

const abortController = new AbortController();
const abortSignal = abortController.signal;
let thread: any;
let runId: any;
const headers = {
  Authorization: `Bearer ${OPENAI_API_KEY}`,
  'Content-Type': 'application/json',
  'OpenAI-Beta': 'assistants=v1',
};

export const createMessage = async (messages: any) => {
  let thread_pivote = await findThreads();
  let intervalHandle: any;
  thread = thread_pivote.document;

  const mensaje = JSON.stringify({ messages });

  // Convertir el string JSON en un objeto JavaScript
  const objeto = JSON.parse(mensaje);
    
  let mensaje_actual = await obtenerUltimoMensaje(objeto);

//   // Obtener el subconjunto deseado como un nuevo objeto
   const subconjunto = mensaje_actual;
//   // Convertir el subconjunto en un string JSON
    const mensaje_final = JSON.stringify(subconjunto, null, 4);
  
  await insertDocument(mensaje_actual,'mensajes');
  const url = `https://api.openai.com/v1/threads/${thread.id}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: mensaje_final,
    });

    // Verifica que la solicitud fue exitosa
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Error from OpenAI: ${errorData.error?.message || response.statusText}`,
      );
    }

    // Devuelve la respuesta en formato JSON
    //return await response.json();
    let resul = await response.json();
   await insertDocument(resul,'objetos_mensajes');
    await createRun();
    const stream = new ReadableStream({
      start(controller) {
        // Función de sondeo
        async function poll() {
          try {
            const runStatus = await getRunStatus();

            if (runStatus.status === 'completed') {
              clearInterval(intervalHandle);
              const messages = await listThreadMessages();

              for (const message of messages.data) {
                if (message.role === 'assistant') {
                  // Enviamos el mensaje a través del stream
                  //const messageString = JSON.stringify(message);
                  const encodedMessage = new TextEncoder().encode(
                    message.content[0].text.value,
                  );
                  controller.enqueue(encodedMessage);
                }
              }
              controller.close(); // Cerramos el stream una vez hemos enviado todos los mensajes
            }
          } catch (error) {
            clearInterval(intervalHandle);
            controller.error(error); // Enviar el error al stream y cerrarlo
          }
        }

        // Iniciar la ejecución del sondeo con un temporizador
        intervalHandle = setInterval(poll, 1000);

        // Si se recibe una señal de aborto, se debe limpiar y cerrar el controlador
        abortSignal.addEventListener('abort', () => {
          clearInterval(intervalHandle);
          controller.close();
        });
      },
    });
    return stream;
  } catch (error) {
    console.error('Failed to post message to thread:', error);
    throw error;
  }
};

async function createRun() {
  const assistant = await findAssistants();

  const url = `https://api.openai.com/v1/threads/${thread.id}/runs`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        assistant_id: assistant.document.id,
      }),
    });

    // Verifica que la respuesta de la solicitud sea exitosa
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Error from OpenAI: ${errorData.error?.message || response.statusText}`,
      );
    }
    let rep = await response.json();
    runId = rep.id;
    // Devuelve la representación JSON de la respuesta completa
    //return await response.json();
  } catch (error) {
    console.error('Failed to create run in thread:', error);
    throw error; // Vuelve a lanzar el error para manejarlo más arriba si es necesario
  }
}

// Función auxiliar para consultar el estado de la run
async function getRunStatus() {
  const runStatusResponse = await fetch(
    `https://api.openai.com/v1/threads/${thread.id}/runs/${runId}`,
    {
      headers: headers,
    },
  );
  return await runStatusResponse.json();
}

// Función auxiliar para listar los mensajes del hilo
async function listThreadMessages() {
  const messagesResponse = await fetch(
    `https://api.openai.com/v1/threads/${thread.id}/messages`,
    {
      headers: headers,
    },
  );
  return await messagesResponse.json();
}

// Creamos una función asíncrona para realizar la búsqueda de un documento.
async function findThreads() {
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  // Aquí se usa `Access-Control-Allow-Origin`, pero como cliente generalmente no es necesario
  // especificarlo a menos que crees un cliente que se ejecute fuera del navegador (como en Node.js).
  myHeaders.append(
    'api-key',`${API_KEY_MONGODB}`,
  );
  myHeaders.append('Accept', 'application/json');

  const raw = JSON.stringify({
    dataSource: 'Cluster0',
    database: 'GPT_Test',
    collection: 'threads',
    filter: {
      id: 'thread_BySrM3tvuyENlhiVvMzzVrAw',
    },
  });

  const requestOptions: any = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  };

  try {
    // La respuesta del endpoint es asumida como JSON según la cabecera "Accept" especificada.
    // Usamos `fetch` con `await` para esperar la respuesta.
    const response = await fetch(
      'https://us-east-1.aws.data.mongodb-api.com/app/data-irbhf/endpoint/data/v1/action/findOne',
      requestOptions,
    );
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
}
// Creamos una función asíncrona para realizar la búsqueda de un documento.
async function findAssistants() {
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  // Aquí se usa `Access-Control-Allow-Origin`, pero como cliente generalmente no es necesario
  // especificarlo a menos que crees un cliente que se ejecute fuera del navegador (como en Node.js).
  myHeaders.append(
    'api-key',`${API_KEY_MONGODB}`,
  );
  myHeaders.append('Accept', 'application/json');

  const raw = JSON.stringify({
    dataSource: 'Cluster0',
    database: 'GPT_Test',
    collection: 'assistants',
    filter: {
      id: 'asst_wX0xeMMORQuwvZkRhhM0JLiQ',
    },
  });

  const requestOptions: any = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  };

  try {
    // La respuesta del endpoint es asumida como JSON según la cabecera "Accept" especificada.
    // Usamos `fetch` con `await` para esperar la respuesta.
    const response = await fetch(
      'https://us-east-1.aws.data.mongodb-api.com/app/data-irbhf/endpoint/data/v1/action/findOne',
      requestOptions,
    );
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
}

async function insertDocument(data:any,collection:string) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    // Use CORS headers if required by target server, otherwise remove this line
    myHeaders.append("Access-Control-Allow-Origin", "*");
    myHeaders.append('api-key',`${API_KEY_MONGODB}`,);
  
    const raw = JSON.stringify({
      "dataSource": "Cluster0",
      "database": "GPT_Test",
      "collection": collection,
      "document": data,
    });
  
    const requestOptions : any = {
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

// Función que obtiene el último mensaje del arreglo 'messages' de un objeto dado
 async function  obtenerUltimoMensaje(objeto:any) {
    if (objeto && Array.isArray(objeto.messages) && objeto.messages.length > 0) {
      return objeto.messages[objeto.messages.length - 1];
    } else {
      return null; // o manejar como prefieras si no hay mensajes
    }
  }
