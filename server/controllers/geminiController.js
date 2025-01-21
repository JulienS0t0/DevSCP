// Usage example:
const GeminiService = require('../service/geminiService');
const express = require('express');
require('dotenv').config()

const app = express();
const port = 6969;
const apiKey = process.env.GEMINI_API_KEY;

app.use(express.json());

const service = new GeminiService(apiKey);

app.post('/generate', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).send({ error: 'Prompt is required' });
        }

        // Add more context to the prompt
        const contextualPrompt = `Improve the following text for conciseness and grammatical accuracy. It must be a summarization. Provide only the refined text. You must not add any commentary or explanation. Your text must be shorter than the initial text. This is the text: ${prompt}`;

        // Call the GeminiService to get the response
        const response = await service.generateResponse(contextualPrompt);

        res.send({ response });
    } catch (error) {
        res.status(500).send({ error: 'Something went wrong' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});



