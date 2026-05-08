import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * POST /api/generate-single
 *
 * Accepts: { productDescription: string, lead: { name, company, role } }
 * Returns: { email: { subject_line, body } }
 *
 * Generates one personalized cold email for a single CSV lead row.
 * Called sequentially for each lead during bulk CSV processing.
 */
export async function POST(request) {
  try {
    // --- 1. Parse & validate input ---
    const { productDescription, lead } = await request.json();

    if (!productDescription || !productDescription.trim()) {
      return Response.json(
        { error: "Product description is required." },
        { status: 400 }
      );
    }

    if (!lead || !lead.name) {
      return Response.json(
        { error: "Lead must include at least a name." },
        { status: 400 }
      );
    }

    // --- 2. Build the prompt ---
    const prompt = `You are an expert cold email copywriter. Write a single personalized cold email for the following lead based on the product description.

Product/Service Description:
"${productDescription.trim()}"

Lead Details:
- Name: ${lead.name.trim()}
- Company: ${lead.company.trim()}
- Role: ${lead.role.trim()}

Write a professional, personalized cold email that:
1. Addresses the lead by name
2. References their company and role naturally
3. Connects the product's value to their specific role/responsibilities
4. Ends with a clear, low-friction CTA (e.g., "Would a 15-min call this week make sense?")

Return a JSON object with:
- subject_line: A personalized subject line (max 60 characters, include their name or company)
- personalized_line: A custom opening line that directly references the lead's name, company, or role as a hook (1-2 sentences max)
- body: The rest of the email body AFTER the opening line (do NOT repeat the personalized_line in the body)

IMPORTANT: Respond ONLY with a valid JSON object. No markdown, no code fences, no explanation. Just the raw JSON object.

Example format:
{
  "subject_line": "...",
  "personalized_line": "...",
  "body": "..."
}`;

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

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse Gemini response for lead:", lead.name, rawText);
      return Response.json(
        { error: `AI returned an invalid response for ${lead.name}. Please try again.` },
        { status: 502 }
      );
    }

    if (!result.subject_line || !result.personalized_line || !result.body) {
      return Response.json(
        { error: `AI returned an incomplete response for ${lead.name}.` },
        { status: 502 }
      );
    }

    return Response.json({
      email: {
        subject_line: result.subject_line,
        personalized_line: result.personalized_line,
        body: result.body,
      },
    });
  } catch (error) {
    console.error("Generate-single API error:", error);
    return Response.json(
      { error: "Failed to generate email. Please try again later." },
      { status: 500 }
    );
  }
}
