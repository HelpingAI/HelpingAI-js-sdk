import { HAI } from 'helpingai';

// Initialize client
const hai = new HAI({ apiKey: 'hl-7d62542a-a836-4e2d-930b-32a0a72232e4' });

// Create a chat completion
const response = await hai.chat.completions.create({
  model: "Dhanishtha-2.0-preview",
  messages: [
    { role: "system", content: "You are an expert in emotional intelligence." },
    { role: "user", content: "What makes a good leader?" }
  ],
   hideThink: true 
});

console.log(response.choices[0].message.content);