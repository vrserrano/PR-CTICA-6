// Requerir el interfaz http
const http = require('http');
// Definir el puerto a utilizar
const port = 3000;
// Crear el servidor y definir la respuesta que se le da a las peticiones
const server = http.createServer((request, response) => {
    // Extrear el contenido de la petición
    const { headers, method, url } = request;
    console.log('headers: ', headers);
    console.log('method: ', method);
    console.log('url: ', url);
    // Código de estado HTTP que se devuelve
    response.statusCode = 200;
    // Encabezados de la respuesta, texto plano
    response.setHeader('Content-Type', 'text/plain');
    // Contenido de la respuesta
    response.end('Hola Mundo');
})
// Ejecutar el servicio para que permanezca a la espera de peticiones
server.listen(port, () => {
    console.log('Servidor ejecutándose...');
    console.log('Abrir en un navegador http://localhost:3000');
});
