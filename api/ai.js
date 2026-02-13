export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GROQ_API_KEY not configured" });
  }

  try {
    const { messages, context } = req.body;

    const systemPrompt = `Eres un consejero financiero personal inteligente llamado "Fin3 AI". Tu trabajo es analizar las finanzas del usuario y dar consejos accionables, claros y motivadores.

REGLAS:
- Responde SIEMPRE en espanol.
- Se conciso pero util. Maximo 3-4 parrafos.
- Usa numeros y porcentajes concretos del contexto del usuario cuando sea posible.
- Da recomendaciones accionables, no genericas.
- Si el usuario no tiene datos suficientes, motivalo a registrar sus gastos.
- Usa un tono amigable y profesional.
- Cuando hables de montos, usa el formato $X,XXX.XX
- Puedes usar emojis con moderacion para hacer el texto mas visual.
- Cuando el usuario pregunte "como voy", analiza su situacion actual vs su meta.
- Si detectas patrones negativos, alertalos con tacto pero firmeza.
- Si el usuario esta bien encaminado, celebralo.

CONTEXTO FINANCIERO DEL USUARIO:
${context || "Sin datos disponibles aun. El usuario acaba de empezar."}`;

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 800,
        top_p: 0.9
      })
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.text();
      console.error("Groq API error:", errorData);
      return res.status(groqResponse.status).json({ error: "Error from AI service" });
    }

    const data = await groqResponse.json();
    const reply = data.choices?.[0]?.message?.content || "No pude generar una respuesta. Intenta de nuevo.";

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("AI proxy error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
