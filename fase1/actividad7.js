import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';

const inputDirectory = process.argv[2];
const outputDirectory = process.argv[3];
const dictionaryFile = path.join(outputDirectory, 'dictionary.txt');
const postingFile = path.join(outputDirectory, 'posting.txt');
const logFile = path.join(outputDirectory, 'a7_2972921.txt');

if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
}

const startTotalTime = performance.now();
let wordDictionary = {};
let postingContent = {};

const files = fs.readdirSync(inputDirectory);

files.forEach((file, index) => {
    const fileStartTime = performance.now(); // Tiempo de inicio para el archivo actual
    const filePath = path.join(inputDirectory, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const words = content.match(/\b[\w']+\b/g) || [];

    let wordCountInFile = {};
    words.forEach(word => {
        const lowercaseWord = word.toLowerCase();
        if (!wordDictionary[lowercaseWord]) {
            wordDictionary[lowercaseWord] = { count: 0, files: new Set() };
        }
        if (!wordCountInFile[lowercaseWord]) {
            wordCountInFile[lowercaseWord] = 0;
        }
        wordCountInFile[lowercaseWord]++;
        if (wordDictionary[lowercaseWord].files) {
            wordDictionary[lowercaseWord].files.add(file);
        } else {
            wordDictionary[lowercaseWord].files = new Set([file]);
        }
    });

    for (const [word, count] of Object.entries(wordCountInFile)) {
        if (!Array.isArray(postingContent[word])) {
            postingContent[word] = [];
        }
        postingContent[word].push({ file, count });
    }

    const fileEndTime = performance.now(); // Tiempo de finalización para el archivo actual
    const fileProcessingTime = ((fileEndTime - fileStartTime) / 1000).toFixed(2); // Tiempo total de procesamiento del archivo
    console.log(`Archivo "${file}" procesado en ${fileProcessingTime}s`);
});

let dictionaryContent = "Token;Número de documentos;Posición del primer registro\n";
let currentPostingPosition = 0;

for (const [word, data] of Object.entries(wordDictionary)) {
    dictionaryContent += `${word};${data.files.size};${currentPostingPosition}\n`;
    currentPostingPosition += `${word}\t${data.files.size}\n`.length; // Actualizar la posición para el siguiente token
}

fs.writeFileSync(dictionaryFile, dictionaryContent);

// Ordenar el postingContent alfabéticamente por las palabras
const sortedPostingContent = Object.keys(postingContent).sort().reduce((obj, key) => {
    obj[key] = postingContent[key];
    return obj;
}, {});

// Escribir el contenido ordenado en el archivo de posting
let postingContentText = "";
for (const [word, entries] of Object.entries(sortedPostingContent)) {
    for (const entry of entries) {
        postingContentText += `${entry.file}\t${entry.count}\n`;
    }
}
fs.writeFileSync(postingFile, postingContentText);

const endTotalTime = performance.now();
const totalTime = ((endTotalTime - startTotalTime) / 1000).toFixed(2);
let logContent = `Tiempo total de procesamiento: ${totalTime}s\n`;
fs.writeFileSync(logFile, logContent);

console.log(`Procesamiento completo. Tiempo total: ${totalTime}s`);
