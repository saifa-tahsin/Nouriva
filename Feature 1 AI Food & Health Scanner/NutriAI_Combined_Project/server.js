require("dotenv").config();

const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.GEMINI_API_KEY) {
  console.error("ERROR: GEMINI_API_KEY is missing from your .env file.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use(express.json({ limit: "10mb" }));
app.use(express.static(__dirname));

app.get("/api/test", (req, res) => {
  res.json({ message: "NutriAI backend is working." });
});

app.post("/api/analyze-meal", async (req, res) => {
  try {
    const { foods, imageBase64, mimeType } = req.body || {};

    if (!Array.isArray(foods) || foods.length === 0) {
      return res.status(400).json({ error: "Add at least one food before analyzing." });
    }
    if (foods.length > 12) {
      return res.status(400).json({ error: "Please analyze no more than 12 foods at once." });
    }

    const cleanedFoods = [];
    for (const food of foods) {
      const foodName = typeof food.foodName === "string" ? food.foodName.trim() : "";
      const quantity = Number(food.quantity);
      const unit = typeof food.unit === "string" ? food.unit : "serving";
      if (!foodName || !Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({ error: "Every food needs a name and a quantity greater than zero." });
      }
      cleanedFoods.push({ foodName, quantity, unit });
    }

    if (imageBase64 && !/^image\/(jpeg|png|webp)$/.test(mimeType || "")) {
      return res.status(400).json({ error: "Please upload a supported JPG, PNG, or WEBP image." });
    }

    const prompt = `
You are estimating nutrition for a meal. Understand Bangla, Banglish and English food names.
Estimate nutrition for EACH listed food at its exact stated quantity and unit. If a photo is provided, use it as additional context, but do not invent certainty from an unclear image.
Foods (JSON):
${JSON.stringify(cleanedFoods)}

Return valid JSON only with this exact structure:
{
  "items": [
    {
      "foodName": "Recognized food name",
      "quantity": 1,
      "unit": "serving",
      "calories": 250,
      "protein": 12,
      "carbs": 30,
      "fat": 8,
      "ingredients": ["ingredient 1"]
    }
  ],
  "ingredients": ["Overall ingredient or food detail"],
  "info": "Brief explanation that values are estimates."
}
Return exactly one item for each input food, in the same order. Use numbers, not strings, for quantity, calories, protein, carbs and fat. Use non-negative estimates. If a food is uncertain, provide a reasonable estimate and mention uncertainty in info. Do not calculate combined totals; the server will calculate totals from item values. This is general information, not medical advice.
`;

    const parts = [{ text: prompt }];
    if (imageBase64) {
      parts.push({ inlineData: { data: imageBase64, mimeType } });
    }

    const startTime = Date.now();
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [{ role: "user", parts }],
      config: { responseMimeType: "application/json" }
    });
    console.log("Gemini response time:", Date.now() - startTime, "ms");

    const rawText = response && response.text;
    if (!rawText) {
      console.error("Gemini returned no text:", response);
      return res.status(502).json({ error: "Gemini returned an empty response. Please try again." });
    }

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (error) {
      console.error("Invalid Gemini JSON:", rawText.slice(0, 1000));
      return res.status(502).json({ error: "Gemini returned invalid data. Please try again." });
    }

    if (!parsed || !Array.isArray(parsed.items) || parsed.items.length !== cleanedFoods.length) {
      console.error("Unexpected Gemini response structure:", parsed);
      return res.status(502).json({ error: "Nutrition results were incomplete. Please try again." });
    }

    const numericFields = ["calories", "protein", "carbs", "fat"];
    const items = parsed.items.map((item, index) => {
      const safeItem = {
        foodName: typeof item.foodName === "string" && item.foodName.trim()
          ? item.foodName.trim() : cleanedFoods[index].foodName,
        quantity: cleanedFoods[index].quantity,
        unit: cleanedFoods[index].unit,
        ingredients: Array.isArray(item.ingredients) ? item.ingredients.filter(x => typeof x === "string").slice(0, 20) : []
      };
      for (const field of numericFields) {
        const value = Number(item[field]);
        if (!Number.isFinite(value) || value < 0) {
          throw new Error(`Gemini returned an invalid ${field} value.`);
        }
        safeItem[field] = Math.round(value * 10) / 10;
      }
      return safeItem;
    });

    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    for (const item of items) {
      for (const field of numericFields) totals[field] += item[field];
    }
    for (const field of numericFields) totals[field] = Math.round(totals[field] * 10) / 10;

    const allIngredients = Array.isArray(parsed.ingredients)
      ? parsed.ingredients.filter(x => typeof x === "string").slice(0, 30)
      : [...new Set(items.flatMap(item => item.ingredients))];

    return res.json({
      items,
      totals,
      ingredients: allIngredients,
      info: typeof parsed.info === "string" ? parsed.info : "Nutrition values are estimates and may vary by recipe and portion size."
    });
  } catch (error) {
    console.error("Meal analysis error:", error.message || error);
    return res.status(500).json({
      error: "Food analysis failed. Check the terminal for details, then try again."
    });
  }
});

// Backward-compatible single-food endpoint for any existing test or older frontend.
app.post("/api/analyze-food", async (req, res) => {
  const { foodName, quantity, unit, imageBase64, mimeType } = req.body || {};
  try {
    const result = await fetch(`http://127.0.0.1:${PORT}/api/analyze-meal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        foods: [{ foodName, quantity: quantity || 1, unit: unit || "serving" }],
        imageBase64,
        mimeType
      })
    });
    const data = await result.json();
    if (!result.ok) return res.status(result.status).json(data);
    const item = data.items[0];
    return res.json({
      foodName: item.foodName,
      quantity: item.quantity,
      unit: item.unit,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      ingredients: data.ingredients,
      info: data.info
    });
  } catch (error) {
    console.error("Single-food compatibility route error:", error.message || error);
    return res.status(500).json({ error: "Food analysis failed. Check the terminal for details." });
  }
});

app.listen(PORT, () => {
  console.log(`NutriAI server running at http://localhost:${PORT}`);
});
