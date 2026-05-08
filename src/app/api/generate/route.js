import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * POST /api/generate
 *
 * Accepts: { productDescription: string, tone: string }
 * Returns: { variations: [ { subject_line, personalized_line, body, tone } x3 ] }
 *
 * Generates 3 cold email variations using Gemini based on the
 * product description and selected tone.
 */
export async function POST(request) {
  try {
    // --- 1. Parse & validate input ---
    const { productDescription, tone, audience } = await request.json();

    if (!productDescription || !productDescription.trim()) {
      return Response.json(
        { error: "Product description is required." },
        { status: 400 }
      );
    }

    const selectedTone = tone || "Professional";
    const targetAudience = audience?.trim() || "";

    // --- 2. Build the prompt ---
    const prompt = `You are an expert cold email copywriter. Generate exactly 3 different cold email variations based on the following product description, target audience, and tone.

Product/Service Description:
"${productDescription.trim()}"

${targetAudience ? `Target Audience:\n"${targetAudience}"\n` : ""}Tone: ${selectedTone}

For each variation, provide:
- subject_line: A compelling email subject line (max 60 characters)
- personalized_line: A custom opening sentence (1-2 sentences max) that hooks the reader and speaks directly to the target audience's pain points
- body: The rest of the email body AFTER the personalized_line (3-5 paragraphs, concise and actionable, tailored to resonate with the specified audience, ending with a clear CTA. Do NOT repeat the personalized_line in the body)
- tone: "${selectedTone}"

IMPORTANT: Respond ONLY with a valid JSON array of exactly 3 objects. No markdown, no code fences, no explanation. Just the raw JSON array.

Example format:
[
  {
    "subject_line": "...",
    "personalized_line": "...",
    "body": "...",
    "tone": "${selectedTone}"
  }
]`;

    // --- 3. Call Gemini API ---
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const rawText = response.text.trim();

    // --- 4. Parse AI response ---
    
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let variations;
    try {
      variations = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse Gemini response:", rawText);
      return Response.json(
        { error: "AI returned an invalid response. Please try again." },
        { status: 502 }
      );
    }

    // Validate it's an array of 3
    if (!Array.isArray(variations) || variations.length === 0) {
      return Response.json(
        { error: "AI returned an unexpected format. Please try again." },
        { status: 502 }
      );
    }

    return Response.json({ variations });
  } catch (error) {
    console.error("Generate API error:", error);
    return Response.json(
      { error: "Failed to generate emails. Please try again later." },
      { status: 500 }
    );
  }
}
