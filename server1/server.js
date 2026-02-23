console.log("RUNNING SERVER FILE: C:/Users/Ghast/Downloads/styleo/server/server.js");
import express from "express";
import cors from "cors";
import "dotenv/config";
import multer from "multer";
import fs from "fs";
import path from "path";

console.log("SERVER VERSION: 2026-01-25 C");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Mock clothing database
const clothingDatabase = [
  { id: 1, name: "Classic Black Hoodie", color: "black", type: "hoodie", brand: "Nike", price: 79, url: "https://nike.com/hoodie-black" },
  { id: 2, name: "Beige Trench Coat", color: "beige", type: "trench coat", brand: "Burberry", price: 450, url: "https://burberry.com/trench" },
  { id: 3, name: "Dark Green Hoodie", color: "dark green", type: "hoodie", brand: "Adidas", price: 69, url: "https://adidas.com/hoodie-green" },
  { id: 4, name: "White T-Shirt", color: "white", type: "t-shirt", brand: "Uniqlo", price: 19, url: "https://uniqlo.com/tshirt" },
  { id: 5, name: "Navy Blue Jeans", color: "navy blue", type: "jeans", brand: "Levi's", price: 89, url: "https://levis.com/jeans" },
  { id: 6, name: "Burgundy Sweater", color: "burgundy", type: "sweater", brand: "H&M", price: 35, url: "https://hm.com/sweater" },
  { id: 7, name: "Camel Wool Coat", color: "camel", type: "coat", brand: "Zara", price: 120, url: "https://zara.com/coat" },
  { id: 8, name: "Black Skinny Jeans", color: "black", type: "jeans", brand: "Forever 21", price: 29, url: "https://forever21.com/jeans" },
  { id: 9, name: "Gray Cardigan", color: "gray", type: "cardigan", brand: "Gap", price: 49, url: "https://gap.com/cardigan" },
  { id: 10, name: "Olive Jacket", color: "olive", type: "jacket", brand: "J.Crew", price: 168, url: "https://jcrew.com/jacket" },
];

// Helper function to calculate similarity score
function calculateSimilarity(query, item) {
  const q = query.toLowerCase();
  let score = 0;

  // Check for color matches
  if (q.includes(item.color.toLowerCase())) score += 3;
  
  // Check for type matches
  if (q.includes(item.type.toLowerCase())) score += 3;
  
  // Check for brand mentions
  if (q.includes(item.brand.toLowerCase())) score += 2;

  // Partial matches for common terms
  const queryWords = q.split(/\s+/);
  queryWords.forEach(word => {
    if (word.length > 2) {
      if (item.color.toLowerCase().includes(word)) score += 1;
      if (item.type.toLowerCase().includes(word)) score += 1;
      if (item.name.toLowerCase().includes(word)) score += 1;
    }
  });

  return score;
}

// Search clothing by text description
function searchClothingByText(query) {
  const results = clothingDatabase
    .map(item => ({
      ...item,
      score: calculateSimilarity(query, item)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ score, ...item }) => item);

  return results;
}

// Health check (optional)
app.get("/", (req, res) => res.send("OK"));

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY in .env" });
    }
    if (!message) {
      return res.status(400).json({ error: "Missing message" });
    }

 const url =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" +
  `?key=${encodeURIComponent(GEMINI_API_KEY)}`;

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await r.json();
    console.log("GEMINI RAW:", JSON.stringify(data, null, 2));

    // Surface Gemini errors
    if (!r.ok || data?.error) {
      return res.status(500).json({
        error: data?.error?.message || `Gemini HTTP ${r.status}`,
        details: data
      });
    }

    const parts = data?.candidates?.[0]?.content?.parts || [];
    const reply = parts.map(p => p?.text || "").join("").trim();

    if (!reply) {
      return res.status(500).json({
        error: "Gemini returned no text",
        details: data
      });
    }

    return res.json({ reply });
  } catch (e) {
    console.log("SERVER EXCEPTION:", e);
    return res.status(500).json({ error: "Server exception calling Gemini" });
  }
});

// TEXT SEARCH: Search by clothing description
app.post("/api/text-search", (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return res.status(400).json({ error: "Missing or invalid query parameter" });
    }

    const results = searchClothingByText(query.trim());

    if (results.length === 0) {
      return res.json({ 
        success: true, 
        query: query.trim(),
        results: [],
        message: "No matching items found for your search."
      });
    }

    return res.json({ 
      success: true, 
      query: query.trim(),
      results: results,
      count: results.length
    });
  } catch (e) {
    console.log("TEXT SEARCH ERROR:", e);
    return res.status(500).json({ error: "Error processing text search" });
  }
});

// PHOTO SEARCH: Search by image using Gemini Vision
app.post("/api/photo-search", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY in .env" });
    }

    // Convert image buffer to base64
    const base64Image = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype || "image/jpeg";

    // Call Gemini Vision API to analyze the clothing in the image
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" +
      `?key=${encodeURIComponent(GEMINI_API_KEY)}`;

    const analyzeResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Image
                }
              },
              {
                text: "Analyze this clothing image and describe it in 1-2 sentences. Focus on: color, type/category of clothing, style, and any distinctive features. Be concise."
              }
            ]
          }
        ]
      })
    });

    const analysisData = await analyzeResponse.json();

    if (!analyzeResponse.ok || analysisData?.error) {
      console.log("Gemini Vision Error:", analysisData);
      return res.status(500).json({
        error: analysisData?.error?.message || "Error analyzing image",
        details: analysisData
      });
    }

    const parts = analysisData?.candidates?.[0]?.content?.parts || [];
    const imageDescription = parts.map(p => p?.text || "").join("").trim();

    if (!imageDescription) {
      return res.status(500).json({ error: "Could not analyze image" });
    }

    // Use the image description as a query to search clothing database
    const results = searchClothingByText(imageDescription);

    return res.json({
      success: true,
      imageDescription: imageDescription,
      results: results,
      count: results.length
    });
  } catch (e) {
    console.log("PHOTO SEARCH ERROR:", e);
    return res.status(500).json({ error: "Error processing photo search" });
  }
});

// PROMO CODE SEARCH (mock + Gemini explanation)
app.post("/api/promo-search", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Missing product URL" });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }

    // VERY IMPORTANT:
    // Gemini НЕ умеет реально лазить по интернету.
    // Поэтому мы делаем: "умную имитацию" (как Honey v1)

    const prompt = `
You are a shopping assistant.
The user wants to buy a product from this page:
${url}

Task:
1. Suggest realistic promo codes (like SAVE10, WELCOME15, APP20).
2. Mention possible discounts: seasonal sale, newsletter, student discount.
3. Clearly say that codes may depend on region and availability.
4. Return the result in a clean JSON-like list.

Do NOT invent crazy discounts.
Be realistic.
`;

    const apiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" +
      `?key=${encodeURIComponent(GEMINI_API_KEY)}`;

    const r = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await r.json();

    if (!r.ok || data?.error) {
      return res.status(500).json({
        error: data?.error?.message || "Gemini error",
        details: data
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map(p => p.text || "")
        .join("")
        .trim();

    return res.json({
      success: true,
      sourceUrl: url,
      result: text
    });

  } catch (e) {
    console.error("PROMO SEARCH ERROR:", e);
    return res.status(500).json({ error: "Promo search failed" });
  }
});
app.listen(3001, () => console.log("Gemini API server on http://localhost:3001"));
