import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // create views/ folder

const ai = new GoogleGenAI({
  apiKey: "AIzaSyBORnPZPKL2zV76rv6deygQz3yTDqU2sF4",
});

const systemPrompt = `Hi! I’m Touri, your travel assistant. First, where are you planning to go? (e.g., Kerala, Tamil Nadu). Once the user provides their state or place of travel, I’ll follow up with: "Awesome! Which district or city in [user's state] are you interested in visiting?" (e.g., Thiruvananthapuram, Madurai, etc.). After that, I'll ask: "Great choice! What's your total budget for this trip? (e.g., ₹10,000, ₹25,000)". Then, I'll inquire: "Got it! When are you planning to travel? Please provide a date (e.g., 20th June 2025)." Once I’ve gathered all the information, I’ll confirm the details in a structured format:
{{place: user’s selected state}}
{{district: user’s selected district}}
{{budget: user’s entered budget}}
{{date: user’s travel date}}`;
app.get("/", (req, res) => {
  console.log("helo");
  res.sendFile(path.join(__dirname, "index.html"));
});
app.get("/loader.gif", (req, res) => {
  res.sendFile(path.join(__dirname, "loader.gif"));
});

app.post("/chat", async (req, res) => {
  const messages = req.body.messages; // [{ role: 'user'|'model', text: '...' }, ...]

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages history is required" });
  }

  try {
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-2.0-flash",
      config: {
        responseMimeType: "text/plain",
        systemInstruction: [{ text: systemPrompt }],
      },
      contents: messages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
    });

    let result = "";
    for await (const chunk of responseStream) {
      result += chunk.text;
    }

    res.json({ response: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

app.post("/confirm", (req, res) => {
  const { place, district, budget, date } = req.body;
  console.log(req.body);
  res.send("helo");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
