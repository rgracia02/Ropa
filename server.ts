import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Resilient model cascade: if primary model has a high-demand spike (503/429), try fallbacks
const CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite",
];

async function generateContentWithFallback(
  ai: GoogleGenAI,
  params: { contents: string; config?: any }
): Promise<{ text: string; modelUsed: string } | null> {
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });

      if (response && response.text) {
        return { text: response.text, modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      console.warn(`Gemini model ${model} temporarily unavailable: ${errMsg.slice(0, 120)}. Trying fallback candidate...`);
      // Short pause before testing next model
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  console.warn("All candidate Gemini models temporarily unavailable, switching to local styling engine.");
  return null;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Stylist outfit recommendation endpoint
app.post("/api/stylist/recommend", async (req, res) => {
  try {
    const { availableGarments, occasion, weather, temp, style, userNote } = req.body;

    if (!availableGarments || !Array.isArray(availableGarments) || availableGarments.length === 0) {
      return res.status(400).json({ error: "No hay prendas disponibles para combinar" });
    }

    const ai = getGeminiClient();

    // If Gemini key is available, run Gemini 3.8-flash personal stylist
    if (ai) {
      try {
        const prompt = `Eres un asesor de imagen y estilista de moda profesional de alto nivel.
Analiza el siguiente armario con prendas limpias disponibles del usuario y crea la combinación perfecta de atuendo (outfit) para:
- Ocasión: ${occasion} (ej: salir de fiesta/cena, ir al trabajo, evento especial/gala, casual, deporte)
- Clima: ${weather}, temperatura aproximada: ${temp}°C
- Preferencia de estilo: ${style}
${userNote ? `- Nota adicional del usuario: "${userNote}"` : ""}

Prendas disponibles para elegir (usa SOLO los IDs de esta lista):
${JSON.stringify(
  availableGarments.map((g: any) => ({
    id: g.id,
    name: g.name,
    category: g.category,
    color: g.color,
    styles: g.styles,
    suitableWeather: g.suitableWeather,
    timesWornThisWeek: g.timesWornThisWeek,
  })),
  null,
  2
)}

Elige:
1. Una prenda superior (topId: polera, camiseta o camisa)
2. Una prenda inferior (bottomId: pantalón, jeans, short o falda)
3. Opcional o recomendada si hace frío/lluvia: una chaqueta o abrigo (outerwearId)
4. Calzado (shoesId) si hay disponible
5. Accesorio opcional (accessoryId) si hay disponible

Reglas de moda:
- Favorece armonía de colores y contrastes elegantes.
- Respeta estrictamente el clima (si hace frío o lluvia, incluye abrigo; si hace calor, prendas frescas).
- Intenta no repetir prendas con alto desgaste si hay opciones limpias alternativas.
- Da un título atractivo al outfit y un consejo de estilo experto explicando por qué combinan bien las prendas y cómo llevarlas.`;

        const result = await generateContentWithFallback(ai, {
          contents: prompt,
          config: {
            systemInstruction:
              "Eres un estilista personal moderno, empático y experto en combinar ropa para el día a día, trabajo y ocasiones especiales según el clima y la psicología del color. Devuelve siempre un JSON válido y estricto.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Título chic del outfit, ej: Smart Casual Marino & Lino" },
                topId: { type: Type.STRING, description: "ID de la prenda superior seleccionada" },
                bottomId: { type: Type.STRING, description: "ID de la prenda inferior seleccionada" },
                outerwearId: { type: Type.STRING, description: "ID de la chaqueta/abrigo, o vacío si no se necesita" },
                shoesId: { type: Type.STRING, description: "ID del calzado seleccionado o vacío" },
                accessoryId: { type: Type.STRING, description: "ID del accesorio seleccionado o vacío" },
                stylistTip: { type: Type.STRING, description: "Explicación de moda de por qué combinan estas prendas y consejos prácticos para la ocasión y el clima" },
                colorHarmony: { type: Type.STRING, description: "Explicación breve de la paleta de colores empleada" },
                weatherAdvice: { type: Type.STRING, description: "Consejo específico para el clima y temperatura" }
              },
              required: ["title", "topId", "bottomId", "stylistTip"]
            }
          }
        });

        if (result && result.text) {
          const parsed = JSON.parse(result.text);
          return res.json({ outfit: parsed, source: "gemini", modelUsed: result.modelUsed });
        }
      } catch (geminiError) {
        console.warn("Gemini generation encountered issue, using rule-based styling engine:", geminiError);
      }
    }

    // High quality rule-based fallback styling engine
    const tops = availableGarments.filter((g: any) => ["polera", "camisa"].includes(g.category));
    const bottoms = availableGarments.filter((g: any) => ["pantalon", "jeans", "short_falda"].includes(g.category));
    const outers = availableGarments.filter((g: any) => g.category === "abrigo_chaqueta");
    const shoes = availableGarments.filter((g: any) => g.category === "calzado");
    const accessories = availableGarments.filter((g: any) => g.category === "accesorio");

    // Prioritize least worn this week
    const sortedTops = [...tops].sort((a: any, b: any) => a.timesWornThisWeek - b.timesWornThisWeek);
    const sortedBottoms = [...bottoms].sort((a: any, b: any) => a.timesWornThisWeek - b.timesWornThisWeek);

    const selectedTop = sortedTops[0] || availableGarments[0];
    const selectedBottom = sortedBottoms[0] || availableGarments.find((g: any) => g.id !== selectedTop?.id);
    const needsOuter = ["frio_invierno", "fresco_viento", "lluvioso"].includes(weather) || temp < 18;
    const selectedOuter = needsOuter && outers.length > 0 ? outers[0] : undefined;
    const selectedShoe = shoes.length > 0 ? shoes[0] : undefined;
    const selectedAcc = accessories.length > 0 ? accessories[0] : undefined;

    return res.json({
      outfit: {
        title: `Look ${occasion === "trabajo" ? "Ejecutivo Cómodo" : occasion === "salir" ? "Urbano Noche" : occasion === "especial" ? "Elegante & Sofisticado" : "Casual Diario"}`,
        topId: selectedTop?.id || "",
        bottomId: selectedBottom?.id || "",
        outerwearId: selectedOuter?.id || "",
        shoesId: selectedShoe?.id || "",
        accessoryId: selectedAcc?.id || "",
        stylistTip: `Excelente balance entre confort y estilo para ${occasion}. El tono ${selectedTop?.color || "de la parte superior"} armoniza fluidamente con ${selectedBottom?.color || "el pantalón"}, adaptándose a la temperatura de ${temp}°C.`,
        colorHarmony: `Contraste limpio y versátil entre ${selectedTop?.color || "tono neutro"} y ${selectedBottom?.color || "base principal"}.`,
        weatherAdvice: needsOuter ? "Se aconseja una capa exterior por temperatura fresca." : "Prendas ligeras y transpirables para el clima templado."
      },
      source: "local-rules"
    });
  } catch (err: any) {
    console.error("Error in /api/stylist/recommend:", err);
    res.status(500).json({ error: err.message || "Error al generar recomendación" });
  }
});

// Full visual week auto-generation endpoint
app.post("/api/stylist/generate-week", async (req, res) => {
  try {
    const { availableGarments, daysPlan } = req.body;
    if (!availableGarments || !Array.isArray(availableGarments) || availableGarments.length === 0) {
      return res.status(400).json({ error: "No hay prendas para planificar la semana" });
    }

    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `Planifica el vestuario semanal para los siguientes 7 días, asegurándote de no sobrecargar de usos la misma ropa y adaptando cada día a su clima y ocasión:
Días y requerimientos:
${JSON.stringify(daysPlan, null, 2)}

Prendas disponibles en armario:
${JSON.stringify(
  availableGarments.map((g: any) => ({
    id: g.id,
    name: g.name,
    category: g.category,
    color: g.color,
    timesWornThisWeek: g.timesWornThisWeek,
    maxWearsBeforeWash: g.maxWearsBeforeWash,
  })),
  null,
  2
)}

Devuelve una asignación para cada uno de los días especificados asegurándote de que no se repitan poleras en días seguidos si hay opciones alternativas limpias.`;

        const result = await generateContentWithFallback(ai, {
          contents: prompt,
          config: {
            systemInstruction: "Eres un asesor de moda semanal. Genera sugerencias equilibradas para cada día.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayId: { type: Type.STRING },
                  title: { type: Type.STRING },
                  topId: { type: Type.STRING },
                  bottomId: { type: Type.STRING },
                  outerwearId: { type: Type.STRING },
                  shoesId: { type: Type.STRING },
                  stylistTip: { type: Type.STRING }
                },
                required: ["dayId", "title", "topId", "bottomId", "stylistTip"]
              }
            }
          }
        });

        if (result && result.text) {
          const parsed = JSON.parse(result.text);
          return res.json({ weekSuggestions: parsed, source: "gemini", modelUsed: result.modelUsed });
        }
      } catch (err) {
        console.warn("Gemini week generation encountered issue, using fallback rotation:", err);
      }
    }

    // Fallback rotation generator
    const tops = availableGarments.filter((g: any) => ["polera", "camisa"].includes(g.category));
    const bottoms = availableGarments.filter((g: any) => ["pantalon", "jeans", "short_falda"].includes(g.category));
    const outers = availableGarments.filter((g: any) => g.category === "abrigo_chaqueta");
    const shoes = availableGarments.filter((g: any) => g.category === "calzado");

    const weekSuggestions = (daysPlan || []).map((day: any, idx: number) => {
      const top = tops[idx % tops.length] || availableGarments[0];
      const bottom = bottoms[idx % bottoms.length] || availableGarments[1 % availableGarments.length];
      const needsOuter = ["frio_invierno", "fresco_viento", "lluvioso"].includes(day.weather) || (day.temp && day.temp < 18);
      const outer = needsOuter && outers.length > 0 ? outers[idx % outers.length] : undefined;
      const shoe = shoes.length > 0 ? shoes[idx % shoes.length] : undefined;

      return {
        dayId: day.dayId,
        title: `Estilo ${day.occasion === "trabajo" ? "Profesional" : day.occasion === "salir" ? "Nocturno" : "Casual"} (${day.dayName})`,
        topId: top?.id || "",
        bottomId: bottom?.id || "",
        outerwearId: outer?.id || "",
        shoesId: shoe?.id || "",
        stylistTip: `Combinación fresca y funcional para el ${day.dayName}, perfecta para la jornada.`
      };
    });

    return res.json({ weekSuggestions, source: "local-rules" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Error al generar la semana" });
  }
});

// Vite middleware & Production static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
