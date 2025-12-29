import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MixEvent {
  id: string;
  type: "song" | "fade-in" | "fade-out" | "effect";
  songName: string;
  songQuery?: string;
  spotifyUrl?: string;
  startTime: number;
  duration: number;
  songStartOffset?: number;
  color: string;
}

interface MixStep {
  id: string;
  icon: "music" | "volume" | "effect" | "time";
  description: string;
  timeRange?: string;
}

interface ParsedMix {
  events: MixEvent[];
  steps: MixStep[];
  totalDuration: number;
  summary: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    
    if (!prompt) {
      throw new Error('No prompt provided');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log("Parsing mix prompt:", prompt);

    const systemPrompt = `אתה מנתח מיקסים מוזיקליים לכוריאוגרפים. תפקידך לקרוא בקשות בעברית (או אנגלית) ולחלץ מהן מבנה מדויק של מיקס.

חוקים:
1. קרא בעיון את הפרומפט וזהה את כל השירים, הזמנים, ואפקטים
2. אם יש קישור Spotify - שמור אותו ב-spotifyUrl וחלץ את שם השיר והאמן ל-songQuery
3. Fade out = השיר יורד בהדרגה, Fade in = השיר עולה בהדרגה
4. אם המשתמש אומר "תתחיל מ-00:47" - זה songStartOffset של 47 שניות
5. בחר צבעים שונים לכל אירוע (hsl format)
6. אם יש אפקט כמו "בום" - סוג האירוע הוא "effect"
7. חשב את totalDuration לפי סוף האירוע האחרון
8. בשלבים (steps) תאר בעברית מה קורה בכל שלב
9. אם הבקשה לא מכילה הוראות מיקס ברורות - החזר is_valid_mix_request: false

דוגמה:
אם המשתמש כותב "תנגן את השיר X למשך 25 שניות ואז תתחיל פייד אאוט של 10 שניות"
זה אומר: שיר X מנוגן מ-0 עד 25, וה-fade out מתחיל ב-25 ונמשך 10 שניות (עד 35).`;

    // Use tool calling to force structured output
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_mix",
              description: "Create a music mix from the user's instructions",
              parameters: {
                type: "object",
                properties: {
                  is_valid_mix_request: {
                    type: "boolean",
                    description: "Whether the user's message contains valid mix instructions"
                  },
                  error_message: {
                    type: "string",
                    description: "If is_valid_mix_request is false, explain in Hebrew what information is needed to create a mix"
                  },
                  events: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        type: { type: "string", enum: ["song", "fade-in", "fade-out", "effect"] },
                        songName: { type: "string" },
                        songQuery: { type: "string", description: "YouTube search query for the song" },
                        spotifyUrl: { type: "string", description: "Spotify URL if provided" },
                        startTime: { type: "number", description: "Start time in seconds from mix start" },
                        duration: { type: "number", description: "Duration in seconds" },
                        songStartOffset: { type: "number", description: "Offset in the original song in seconds" },
                        color: { type: "string", description: "HSL color for display" }
                      },
                      required: ["id", "type", "songName", "startTime", "duration", "color"]
                    }
                  },
                  steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        icon: { type: "string", enum: ["music", "volume", "effect", "time"] },
                        description: { type: "string" },
                        timeRange: { type: "string" }
                      },
                      required: ["id", "icon", "description"]
                    }
                  },
                  totalDuration: { type: "number", description: "Total mix duration in seconds" },
                  summary: { type: "string", description: "Summary of the mix in Hebrew" }
                },
                required: ["is_valid_mix_request"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_mix" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data));
    
    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "create_mix") {
      throw new Error("No valid tool call in AI response");
    }

    const mixData = JSON.parse(toolCall.function.arguments);
    console.log("Parsed mix data:", JSON.stringify(mixData));

    // Check if it's a valid mix request
    if (!mixData.is_valid_mix_request) {
      const errorMessage = mixData.error_message || "אנא תאר מיקס עם שירים, זמנים, ומעברים. לדוגמה: 'תנגן את השיר X למשך 30 שניות ואז עבור לשיר Y עם פייד אאוט'";
      return new Response(JSON.stringify({ 
        success: false, 
        mix: null,
        message: errorMessage
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsedMix: ParsedMix = {
      events: mixData.events || [],
      steps: mixData.steps || [],
      totalDuration: mixData.totalDuration || 0,
      summary: mixData.summary || ""
    };

    console.log("Final parsed mix:", JSON.stringify(parsedMix));

    return new Response(JSON.stringify({ 
      success: true, 
      mix: parsedMix,
      message: parsedMix.summary 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in parse-mix function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
