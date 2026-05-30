const axios = require('axios');
const Product = require('../models/Product');

// Rule-based stock health check (no external AI needed)
const getStockHealth = (stock, minimumStock) => {
  if (stock === 0) return { status: 'Out Of Stock', color: 'red' };
  if (stock < minimumStock) return { status: 'Critical', color: 'orange' };
  if (stock < minimumStock + 20) return { status: 'Low', color: 'yellow' };
  return { status: 'Healthy', color: 'green' };
};

// Rule-based reorder recommendation
const getReorderRecommendation = (stock, minimumStock) => {
  if (stock < minimumStock) return 'Restock 100 Units';
  if (stock < minimumStock + 20) return 'Restock 50 Units';
  return 'No Action Required';
};

// GET /api/ai/recommendations
const getRecommendations = async (req, res) => {
  try {
    const products = await Product.find();

    const recommendations = products.map((product) => {
      const health = getStockHealth(product.stock, product.minimumStock);
      const reorder = getReorderRecommendation(product.stock, product.minimumStock);
      const isFastMoving = product.monthlySales > 100;

      return {
        _id: product._id,
        productName: product.productName,
        sku: product.sku,
        stock: product.stock,
        minimumStock: product.minimumStock,
        monthlySales: product.monthlySales,
        stockHealth: health,
        reorderRecommendation: reorder,
        isFastMoving,
      };
    });

    res.status(200).json(recommendations);
  } catch (error) {
    console.error('AI recommendations error:', error);
    res.status(500).json({ message: 'Error generating recommendations.' });
  }
};

// GET /api/ai/product-insight/:id
const getProductInsight = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ message: 'Gemini API key not configured.' });
    }

    // Build prompt for Gemini
    const prompt = `
You are an inventory management expert. Analyze the following product data and provide insights:

Product Name: ${product.productName}
Current Stock: ${product.stock} units
Monthly Sales: ${product.monthlySales} units
Minimum Stock Level: ${product.minimumStock} units
Category: ${product.category}
Price: $${product.price}

Please provide a structured JSON response with these exact fields:
{
  "inventoryHealth": "Brief assessment of current inventory health (1-2 sentences)",
  "riskLevel": "Low / Medium / High / Critical",
  "suggestedReorderQuantity": "Specific number or range with reasoning",
  "improvementSuggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}

Respond ONLY with the JSON object, no extra text.
    `.trim();

    // Call Gemini API
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      { timeout: 15000 }
    );

    // Extract text from Gemini response
    const rawText = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return res.status(500).json({ message: 'No response from Gemini API.' });
    }

    // Parse JSON from response
    let insight;
    try {
      // Strip any markdown code fences if present
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      insight = JSON.parse(cleaned);
    } catch (parseErr) {
      // If parsing fails, return raw text
      insight = { rawResponse: rawText };
    }

    res.status(200).json({
      product: {
        name: product.productName,
        stock: product.stock,
        monthlySales: product.monthlySales,
        minimumStock: product.minimumStock,
      },
      insight,
    });
  } catch (error) {
    console.error('AI insight error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Error generating AI insight. Check your Gemini API key.' });
  }
};

module.exports = { getRecommendations, getProductInsight };
