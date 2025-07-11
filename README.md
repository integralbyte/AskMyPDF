# AskMyPDF

AskMyPDF is an intelligent PDF question-answering system that uses Gemini embeddings, Pinecone vector database, and Google's Gemini 2.5 Pro LLM to provide accurate answers from PDF documents.

---

## Features

* Parses and processes PDF documents
* Generates semantic embeddings using Gemini
* Stores and searches embeddings via Pinecone
* Responds to natural language questions using retrieved context

---

## Tech Stack

* Node.js
* pdf-parse
* @google/generative-ai (Gemini)
* @pinecone-database/pinecone
* dotenv

---

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/integralbyte/AskMyPDF.git
cd AskMyPDF
```

2. Install dependencies:

```bash
npm install
```

3. Create a .env file in the root directory with the following variables:

```env
GEMINI_API_KEY=
PINECODE_API_KEY=
PINECONE_INDEX=
```

4. Modify the user question in `app.js`.
   
5. Run the app:

```bash
node app.js
```

Once running, it will process the embedded PDF and print the answer to the terminal.

---

## Notes

* Pinecone index is updated each time the script runs. If you're working with different documents, you may want to clear the index manually or create separate indexes.
