import { GoogleGenAI } from "@google/genai";
import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from "dotenv";
import fs from "fs/promises";
import PdfParse from "pdf-parse";
import { text } from "stream/consumers";

dotenv.config();

const pc = new Pinecone({
  apiKey: process.env.PINECODE_API_KEY,
});

const index = pc.index(process.env.PINECONE_INDEX);

const ai = new GoogleGenAI({
    
    apiKey: process.env.GEMINI_API_KEY

});


async function extractPDFText(PDFPath){

    let dataBuffer = await fs.readFile(PDFPath);
    const data = await PdfParse(dataBuffer);

    return data.text;

}

async function splitText(content){
const arr = [];

let endIndex;
let firstchunkSize;
console.log(content.length)

let chunkSize = 875

for (let beginIndex = 0; beginIndex < content.length; beginIndex+=chunkSize) {

    if (beginIndex+chunkSize >= content.length) { endIndex = content.length} else { endIndex = beginIndex+(chunkSize-1)}
    firstchunkSize = content.slice(beginIndex, endIndex + 1)
    arr.push(firstchunkSize)
}    

return arr;

}

async function processVectors(array){

    let currentChunk;
    let currentEmbeddings;
    let pineconeObject;
    const pineconeArray = []

    for (let i = 0; i < array.length; i+=1) {

        currentChunk = array[i]

        const response = await ai.models.embedContent({

            model: "gemini-embedding-exp-03-07",
            contents: currentChunk,

        });

        currentEmbeddings = response.embeddings[0].values

        pineconeObject = {
    id: "chunk-" + i.toString(),
    values: currentEmbeddings,
    metadata: {
        text: currentChunk,
        chunk_index: i,
        document_id: "samplePDF"
            }
        }

    pineconeArray.push(pineconeObject)


    }

    return pineconeArray;


}

async function main() {

    
let PDFText = await extractPDFText("./samplePDF.pdf");

let textArray = await splitText(PDFText);

let pineconeArray = await processVectors(textArray)

await index.upsert(pineconeArray);

let userQuestion = "Where do I place the accompanying files?"

const response = await ai.models.embedContent({

            model: "gemini-embedding-exp-03-07",
            contents: userQuestion,

        });

let questionEmbeddings = response.embeddings[0].values

const pinecodeResponse = await index.query({
  topK: 4,
  vector: questionEmbeddings,
  includeMetadata: true,
});

const geminiPrompt = `
Use the following contexts to answer the user's question:

Context 1:
${pinecodeResponse.matches[0].metadata.text}

Context 2:
${pinecodeResponse.matches[1].metadata.text}

Context 3:
${pinecodeResponse.matches[2].metadata.text}

Context 4:
${pinecodeResponse.matches[3].metadata.text}

User's Question: ${userQuestion}
`

const geminiResponse = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: geminiPrompt,
  });
  
  console.log(geminiResponse.text);

}

main();