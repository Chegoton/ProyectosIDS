import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';

const inputDirectory = process.argv[2];
const outputDirectory = process.argv[3];
const dictionaryFile = path.join(outputDirectory, 'hashtable.txt');
const postingFile = path.join(outputDirectory, 'posting.txt');
const logFile = path.join(outputDirectory, 'log.txt');

if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
}

const startTotalTime = performance.now();
let hashTable = new Array(2003).fill(null); // Inicializar la tabla hash con valores nulos
let collisions = 0;

// Función de hash simple
function simpleHash(word, tableSize) {
    let hash = 7; // Inicializar hash con un número primo
    for (let i = 0; i < word.length; i++) {
        hash = (hash * 31 + word.charCodeAt(i)) % tableSize;
    }
    return hash;
}

// Procesar archivos
const files = fs.readdirSync(inputDirectory);
files.forEach(file => {
    const fileStartTime = performance.now();
    const filePath = path.join(inputDirectory, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const words = content.match(/\b[\w']+\b/g) || [];
    words.forEach(word => {
        const lowercaseWord = word.toLowerCase();
        const index = simpleHash(lowercaseWord, hashTable.length);
        // Si el índice está vacío o el término ya existe en el índice
        if (!hashTable[index] || hashTable[index].term === lowercaseWord) {
            if (!hashTable[index]) {
                // Si el índice está vacío, inicializarlo
                hashTable[index] = { term: lowercaseWord, count: 0 };
            }
            hashTable[index].count++;
        } else {
            // Si el índice no está vacío y el término es diferente, hay una colisión
            collisions++;
            // Aquí debes manejar la colisión, este código no lo hace
        }
    });

    const fileEndTime = performance.now(); // Tomar el tiempo final para este archivo
    const fileProcessingTime = (fileEndTime - fileStartTime).toFixed(2); // Calcular el tiempo de procesamiento

    console.log(`Archivo "${file}" procesado en ${fileProcessingTime}ms`); // Mostrar el tiempo de procesamiento en consola

});

// Escribir la tabla hash al archivo
let dictionaryContent = "";
hashTable.forEach((entry, index) => {
    if (entry) {
        // Término y conteo existentes
        dictionaryContent += `${index} || ${entry.term} || ${entry.count}\n`;
    } else {
        // Término inexistente
        dictionaryContent += `${index} || empty || -1\n`;
    }
});

fs.writeFileSync(dictionaryFile, dictionaryContent.trim());

const endTotalTime = performance.now();
const totalTime = ((endTotalTime - startTotalTime) / 1000).toFixed(2);
let logContent = `Tiempo total de procesamiento: ${totalTime}s\nNúmero de colisiones: ${collisions}\n`;
fs.writeFileSync(logFile, logContent);

console.log(`Procesamiento completo. Tiempo total: ${totalTime}s`);