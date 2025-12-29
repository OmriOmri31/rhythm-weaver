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

חובה להחזיר JSON תקין בפורמט הבא:
{
  "events": [
    {
      "id": "unique-id",
      "type": "song" | "fade-in" | "fade-out" | "effect",
      "songName": "שם השיר להצגה",
      "songQuery": "שאילתת חיפוש ליוטיוב (שם השיר + אמן)",
      "spotifyUrl": "קישור ספוטיפיי אם סופק",
      "startTime": מספר_שניות_מתחילת_המיקס,
      "duration": משך_בשניות,
      "songStartOffset": נקודת_התחלה_בשיר_המקורי_בשניות,
      "color": "צבע HSL לתצוגה"
    }
  ],
  "steps": [
    {
      "id": "step-id",
      "icon": "music" | "volume" | "effect" | "time",
      "description": "תיאור מה קורה בעברית",
      "timeRange": "0:00 - 0:30"
    }
  ],
  "totalDuration": סה"כ_אורך_המיקס_בשניות,
  "summary": "סיכום קצר של מה שהמיקס עושה בעברית"
}

חוקים:
1. קרא בעיון את הפרומפט וזהה את כל השירים, הזמנים, ואפקטים
2. אם יש קישור Spotify - שמור אותו ב-spotifyUrl וחלץ את שם השיר והאמן ל-songQuery
3. Fade out = השיר יורד בהדרגה, Fade in = השיר עולה בהדרגה
4. אם המשתמש אומר "תתחיל מ-00:47" - זה songStartOffset של 47 שניות
5. בחר צבעים שונים לכל אירוע (hsla format)
6. אם יש אפקט כמו "בום" - סוג האירוע הוא "effect"
7. חשב את totalDuration לפי סוף האירוע האחרון
8. בשלבים (steps) תאר בעברית מה קורה בכל שלב

דוגמה:
אם המשתמש כותב "תנגן את השיר X למשך 25 שניות ואז תתחיל פייד אאוט של 10 שניות"
זה אומר: שיר X מנוגן מ-0 עד 25, וה-fade out מתחיל ב-25 ונמשך 10 שניות (עד 35).`;

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
    
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Extract JSON from the response (it might be wrapped in markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const parsedMix: ParsedMix = JSON.parse(jsonStr.trim());
    console.log("Parsed mix:", JSON.stringify(parsedMix));

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
