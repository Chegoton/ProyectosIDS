const fs = require('fs');

// Función para calcular tf.idf Weight
function calcularTFIDF(frecuenciaToken, numDocumentos, numDocumentosConToken) {
    const tf = frecuenciaToken;
    const idf = numDocumentos / numDocumentosConToken;
    return tf * idf;
}

// Función para procesar el Posting File y calcular tf.idf Weight para cada token
function procesarPostingFile(postingFile, diccionario, numDocumentos) {
    const data = fs.readFileSync(postingFile, 'utf8').split('\n');
    for (let line of data) {
        const [token, frecuenciaToken, documentosConToken] = line.trim().split(',');
        const pesoToken = calcularTFIDF(parseInt(frecuenciaToken), numDocumentos, parseInt(documentosConToken));
        diccionario[token] = pesoToken;
    }
}

// Función para definir tamaños óptimos para las columnas del posting y del diccionario
function definirTamanosOptimos(diccionario) {
    const tamañoOptimo = 80; // Divisible entre 80 bytes
    const tamañoTotal = Object.values(diccionario).reduce((acc, val) => acc + val, 0);
    const numeroColumnas = Math.floor(tamañoTotal / tamañoOptimo);
    const tamañoColumna = Math.floor(tamañoTotal / numeroColumnas);
    return tamañoColumna;
}

// Función para crear el archivo de log de salida y registrar los tiempos de procesamiento
function crearLog(tiempoTotal, tiempoPorArchivo) {
    let log = `Tiempo total de procesamiento: ${tiempoTotal} segundos\n`;
    log += 'Tiempo de procesamiento por archivo:\n';
    for (let [archivo, tiempo] of Object.entries(tiempoPorArchivo)) {
        log += `${archivo}: ${tiempo} segundos\n`;
    }
    fs.writeFileSync('a10_matricula.txt', log);
}

// Función principal
function main() {
    // Parámetros de entrada
    const postingFile = 'posting.txt';
    const numDocumentos = 1000; // Ejemplo: número total de documentos en el corpus
    const archivosAProcesar = ['documento1.txt', 'documento2.txt', 'documento3.txt'];

    // Procesamiento del Posting File
    const diccionario = {};
    const startPosting = Date.now();
    procesarPostingFile(postingFile, diccionario, numDocumentos);
    const tiempoProcesamientoPosting = (Date.now() - startPosting) / 1000; // Convertir a segundos

    // Definición de tamaños óptimos para las columnas
    const tamañoOptimo = definirTamanosOptimos(diccionario);

    // Procesamiento de los archivos individuales
    const tiempoPorArchivo = {};
    for (let archivo of archivosAProcesar) {
        const startArchivo = Date.now();
        // Procesar archivo y calcular tf.idf Weight para cada token
        // (Aquí se podría incluir el código para procesar cada archivo)
        const tiempoProcesamientoArchivo = (Date.now() - startArchivo) / 1000; // Convertir a segundos
        tiempoPorArchivo[archivo] = tiempoProcesamientoArchivo;
    }

    // Registro de tiempos de procesamiento en el archivo de log
    const tiempoTotal = tiempoProcesamientoPosting + Object.values(tiempoPorArchivo).reduce((acc, val) => acc + val, 0);
    crearLog(tiempoTotal, tiempoPorArchivo);
}

// Llamada a la función principal
main();