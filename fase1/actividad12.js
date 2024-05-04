import { log } from 'console';
import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import readline from 'readline';


const outputDirectory = process.argv[2];
const wordToFind = process.argv[3].toLowerCase(); 

const dictionaryFile = path.join(outputDirectory, 'dictionary.txt');
const postingFile = path.join(outputDirectory, 'posting.txt');
const documentFile = path.join(outputDirectory, 'document.txt'); 
const logFile = path.join(outputDirectory, 'a12_2911575.txt');

const startTotalTime = performance.now();

async function findWordInDictionary(file, word) {
    const fileStream = fs.createReadStream(file);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    console.log(`Iniciando la búsqueda de la palabra '${word}' en el archivo: ${file}`);


    for await (const line of rl) {

        console.log(`Leyendo línea: ${line}`); // Log de cada línea leída

        if (line.includes(word)) {
            console.log(`Palabra '${word}' encontrada en línea: ${line}`); // Log cuando se encuentra la palabra
            const parts = line.split(';'); // Dividimos la línea en partes usando ';' como delimitador
            if (parts[0] === word) { // Verificamos que la primera parte es la palabra que buscamos
                console.log(`ID de la palabra encontrada: ${parts[1]}`); // Registramos el ID encontrado
                return parts[1]; // Devolvemos el ID de la palabra
            }
        }
    }


    console.log(`Palabra '${word}' no encontrada en el archivo.`); // Log si la palabra no se encuentra en el archivo
    
    return null;
}

async function findDocumentsByWordId(postingFile, wordId) {
    const fileStream = fs.createReadStream(postingFile);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    const documentIds = [];

    for await (const line of rl) {
        
        const parts = line.split('\t');
        if (parts[0] === wordId) {
            documentIds.push(parts[1]);
        }
    }

    return documentIds;
}

async function main() {
    const wordId = await findWordInDictionary(dictionaryFile, wordToFind);
    if (!wordId) {
        console.log('Palabra no encontrada en el diccionario.');
        return;
    }

    console.log("wordID" + wordId);

    const documentIds = await findDocumentsByWordId(postingFile, wordId);
    if (documentIds.length === 0) {
        console.log('No se encontraron documentos con la palabra especificada.');
        return;
    }

    console.log('Documentos que contienen la palabra:', documentIds.join(', '));
}

main();