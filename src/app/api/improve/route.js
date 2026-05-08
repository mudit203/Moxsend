import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * POST /api/improve
 *
 * Accepts: { originalEmail: string, originalSubject: string, originalPersonalizedLine: string, feedback: string }
 * Returns: { improved: { subject_line, personalized_line, body }, changesSummary: string }
 *
 * Takes an existing email + user feedback and returns an improved
 * version along with a summary of what was changed.
 */
export async function POST(request) {
  try {
    // --- 1. Parse & validate input ---
    const { originalEmail, originalSubjectLine, originalPersonalizedLine, feedback } = await request.json();

    if (!originalEmail || !originalEmail.trim()) {
      return Response.json(
        { error: "Original email is required." },
        { status: 400 }
      );
    }

    if (!feedback || !feedback.trim()) {
      return Response.json(
        { error: "Feedback is required to improve the email." },
        { status: 400 }
      );
    }

    // --- 2. Build the prompt ---
    const prompt = `You are an expert cold email copywriter. A user has written a cold email and wants to improve it based on their specific feedback.

Original Subject Line:
"${originalSubjectLine?.trim() || "(no subject)"}"

Original Personalized Opening Line:
"${originalPersonalizedLine?.trim() || "(none)"}"

Original Email Body:
"${originalEmail.trim()}"

User's Feedback / Requested Changes:
"${feedback.trim()}"

Improve the email according to the user's feedback. Return a JSON object with:
- subject_line: The improved subject line
- personalized_line: The improved personalized opening line (1-2 sentences max)
- body: The improved email body AFTER the personalized_line (do NOT repeat the personalized_line in the body)
- changes_summary: A brief 1-2 sentence summary of what you changed and why

IMPORTANT: Respond ONLY with a valid JSON object. No markdown, no code fences, no explanation. Just the raw JSON object.

Example format:
{
  "subject_line": "...",
  "personalized_line": "...",
  "body": "...",
  "changes_summary": "..."
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
      console.error("Failed to parse Gemini response:", rawText);
      return Response.json(
        { error: "AI returned an invalid response. Please try again." },
        { status: 502 }
      );
    }

    // Validate expected fields exist
    if (!result.subject_line || !result.personalized_line || !result.body) {
      return Response.json(
        { error: "AI returned an incomplete response. Please try again." },
        { status: 502 }
      );
    }

    return Response.json({
      improved: {
        subject_line: result.subject_line,
        personalized_line: result.personalized_line,
        body: result.body,
      },
      changesSummary: result.changes_summary || "Email improved based on your feedback.",
    });
  } catch (error) {
    console.error("Improve API error:", error);
    return Response.json(
      { error: "Failed to improve email. Please try again later." },
      { status: 500 }
    );
  }
}
