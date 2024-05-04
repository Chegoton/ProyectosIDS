import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import readline from 'readline';

const outputDirectory = process.argv[2];
const wordToFind = process.argv[3].toLowerCase(); 

const dictionaryFile = path.join(outputDirectory, 'dictionary.txt');
const postingFile = path.join(outputDirectory, 'posting.txt');
const documentFile = path.join(outputDirectory, 'document.txt'); 
const logFile = path.join(outputDirectory, 'a12_matricula.txt'); 

const startTotalTime = performance.now();

async function logToFile(message) {
    fs.appendFileSync(logFile, `${message}\n`);
}

async function findWordInDictionary(file, word) {
    const fileStream = fs.createReadStream(file);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    await logToFile(`Iniciando la búsqueda de la palabra '${word}' en el archivo: ${file}`);

    for await (const line of rl) {
        await logToFile(`Leyendo línea: ${line}`);

        if (line.includes(word)) {
            await logToFile(`Palabra '${word}' encontrada en línea: ${line}`);
            const parts = line.split(';');
            if (parts[0] === word) {
                await logToFile(`ID de la palabra encontrada: ${parts[1]}`);
                return parts[1];
            }
        }
    }

    await logToFile(`Palabra '${word}' no encontrada en el archivo.`);
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
        await logToFile('Palabra no encontrada en el diccionario.');
        return;
    }

    const documentIds = await findDocumentsByWordId(postingFile, wordId);
    if (documentIds.length === 0) {
        await logToFile('No se encontraron documentos con la palabra especificada.');
        return;
    }

    await logToFile(`Documentos que contienen la palabra: ${documentIds.join(', ')}`);
}

main().then(() => {
    const endTotalTime = performance.now();
    const totalTime = (endTotalTime - startTotalTime).toFixed(2);
    logToFile(`Tiempo total de ejecución: ${totalTime} milisegundos`).then(() => {
        console.log(`Ejecución completada en ${totalTime} milisegundos`);
    });
});