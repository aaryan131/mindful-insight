import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StressQuestion {
  question: string;
  answer: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { responses } = await req.json() as { responses: StressQuestion[] };
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const formattedResponses = responses
      .map((r, i) => `Q${i + 1}: "${r.question}" - Score: ${r.answer}/5`)
      .join("\n");

    const totalScore = responses.reduce((sum, r) => sum + r.answer, 0);
    const maxScore = responses.length * 5;
    const percentageScore = (totalScore / maxScore) * 100;

    const systemPrompt = `You are a compassionate mental wellness AI assistant specialized in stress assessment. Based on the user's questionnaire responses, provide:

1. A stress level classification (Low, Moderate, High, or Severe)
2. A brief, empathetic summary of their stress state (2-3 sentences)
3. Three personalized, actionable recommendations
4. One positive affirmation

Be warm, supportive, and non-judgmental. Focus on practical advice.

IMPORTANT: Respond in valid JSON format with this exact structure:
{
  "level": "Low" | "Moderate" | "High" | "Severe",
  "summary": "string",
  "recommendations": ["string", "string", "string"],
  "affirmation": "string"
}`;

    const userPrompt = `Here are the stress assessment questionnaire responses:

${formattedResponses}

Total Score: ${totalScore}/${maxScore} (${percentageScore.toFixed(1)}%)

Please analyze these responses and provide a comprehensive stress assessment.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to analyze stress levels");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response from the AI
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format");
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({
        ...analysis,
        score: percentageScore,
        totalScore,
        maxScore,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing stress:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
