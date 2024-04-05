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
let postingContent = '';

const files = fs.readdirSync(inputDirectory);
let postingStartPosition = 0;

files.forEach((file, index) => {
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
        postingContent += `${file}\t${count}\n`;
    }

    if (index === files.length - 1) {
        postingStartPosition = postingContent.length;
    }
});

let dictionaryContent = "Token;Número de documentos;Posición del primer registro\n";
let postingStartPositionString = postingStartPosition.toString();
for (const [word, data] of Object.entries(wordDictionary)) {
    dictionaryContent += `${word};${data.files.size};${postingStartPositionString}\n`;
    postingStartPositionString = (parseInt(postingStartPositionString) + data.files.size).toString();
}

fs.writeFileSync(dictionaryFile, dictionaryContent);
fs.writeFileSync(postingFile, postingContent);

const endTotalTime = performance.now();
const totalTime = ((endTotalTime - startTotalTime) / 1000).toFixed(2);
let logContent = `Tiempo total de procesamiento: ${totalTime}s\n`;
fs.writeFileSync(logFile, logContent);

console.log(`Procesamiento completo. Tiempo total: ${totalTime}s`);
