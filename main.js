// Requerir el interfaz http
const http = require('http');
const querystring = require('querystring');
var MongoClient = require('mongodb').MongoClient;
var urlMongo = "mongodb://localhost:27017/";
const port = 3000;

// funcion prototipo para comprobar si un string contiene solo numeros, devuelve true/false
String.prototype.isNumber = function () { return /^\d+$/.test(this); }

// Crear el servidor y definir la respuesta que se le da a las peticiones
const server = http.createServer((request, response) => {
    let body = [];
    request.on('error', (err) => {
        console.error(err);
    }).on('data', (chunk) => {
        // El cuerpo de la petición puede venir en partes, aquí se concatenan
        body.push(chunk);
    }).on('end', () => {
        // El cuerpo de la petición está completo
        body = Buffer.concat(body).toString();
        // se parsea el cuerpo de la petición
        var parsed = querystring.parse(body);
        // se chequeasi el numero de telefono contiene unicamente números, y si su longitud es de 9 cifras
        if (parsed.phone != undefined && parsed.name != undefined) {
            if (!parsed.phone.isNumber() || parsed.phone.length != 9) {
                response.end(JSON.stringify("El número de teléfono no es válido (solo se permiten 9 cifras)"));
                return;
            } 
        } else {
            response.end("No se han especificado los valores necesarios en la llamada POST (name/phone)");
        }

        // se crea un documento usando los datos que nos interesan del cuerpo de la petición
        const documento = {
            "name": parsed.name,
            "phone": parsed.phone
        };

        // se conecta a la base de datos de mongo
        MongoClient.connect(urlMongo, { useUnifiedTopology: true }, function (err, client) {
            // se selecciona la base de datos practica6
            const db = client.db('practica6');

            var promesaMongo = () => {
                return new Promise((resolve, reject) => {
                    // se inserta el documento en la base de datos
                    db.collection('usuarios').insertOne(documento)
                    // se hace una búsqueda de todos los registros de la base de datos
                    db.collection('usuarios').find({}).toArray(function (error, datos) {
                        var arrayRespuesta = []
                        // se elimina de la búsqueda de la base de datos, todos los _id
                        for (index = 0; index < datos.length; index++) {
                            // se genera un objeto nuevo usando los datos del objeto de la
                            // base de datos pero solo usando los valores que nos interesan
                            let documentoRespuesta = {
                                "name": datos[index].name,
                                "phone": datos[index].phone
                            };
                            arrayRespuesta.push(documentoRespuesta)
                        }
                        error ? reject(error) : resolve(arrayRespuesta);
                    });
                });
            };

            // se llama a promesaMongo y se espera hasta que termine
            // una vez termina, se ejecutará el siguiente bloque de código
            var llamarPromesaMongo = async () => {
                var result = await (promesaMongo());
                return result;
            };

            // una vez recibido el resultado de la funcion asincrona anterior,
            // se cierra el cliente de mongo y se devuelve la respuesta a la petición
            llamarPromesaMongo().then(function (result) {
                client.close();
                response.end(JSON.stringify(result));
            });
        });
    });
})

// Ejecutar el servicio para que permanezca a la espera de peticiones
server.listen(port, () => {
    console.log('Servidor ejecutándose  en puerto ' + port);
    console.log('Abrir en un navegador http://localhost:3000');
});
