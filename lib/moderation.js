/**
 * Content Moderation Utility for Happiness Jar (กระปุกพลังบวก)
 * Supports:
 * 1. OpenAI Moderation API (Primary)
 * 2. Google Gemini API (Fallback using existing GEMINI_API_KEY)
 * 3. Local keyword filter (Backup/offline)
 */

// Local regex list for basic profanity and self-harm keywords (Thai and English)
const LOCAL_BLOCKED_KEYWORDS = [
  // Thai profanities & toxic words
  /ค[ววูู]*ย/i, /เ[หห]*ยี้/i, /ส[ถถ]*ถุ/i, /ช[าา]*ติ[หห]*ม[าา]/i, /แ[มม]*่[งง]/i, /กู/i, /มึง/i, /เย็ด/i, /หี/i, /แตด/i,
  // Self-harm & suicide triggers (Thai)
  /อยากตาย/i, /ฆ่าตัวตาย/i, /กรีดแขน/i, /ไม่อยากอยู่แล้ว/i, /จบชีวิต/i, /ทำร้ายตัวเอง/i,
  // English self-harm & severe toxicity
  /suicide/i, /kill myself/i, /cut myself/i, /die now/i, /fuc?k/i, /sh[i1]t/i, /b[i1]tch/i
];

export async function moderateContent(text) {
  if (!text || typeof text !== 'string') {
    return { flagged: false, reason: null };
  }

  const trimmedText = text.trim();

  // 1. Run local keyword check (Fast & acts as baseline)
  for (const regex of LOCAL_BLOCKED_KEYWORDS) {
    if (regex.test(trimmedText)) {
      return { 
        flagged: true, 
        reason: 'พบคำหยาบคาย ข้อความที่ไม่เหมาะสม หรือเนื้อหาที่เกี่ยวข้องกับการทำร้ายตนเอง' 
      };
    }
  }

  // 2. OpenAI Moderation Check (If API Key is available)
  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/moderations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAiKey}`
        },
        body: JSON.stringify({
          input: trimmedText,
          model: 'omni-moderation-latest'
        })
      });

      if (response.ok) {
        const data = await response.json();
        const result = data.results?.[0];
        if (result && result.flagged) {
          // Identify flagged categories
          const categories = Object.keys(result.categories).filter(c => result.categories[c]);
          return {
            flagged: true,
            reason: `ข้อความขัดต่อมาตรฐานความปลอดภัย (${categories.join(', ')})`
          };
        }
        return { flagged: false, reason: null };
      } else {
        console.error('OpenAI Moderation API returned error:', await response.text());
      }
    } catch (error) {
      console.error('Error calling OpenAI Moderation API:', error);
    }
  }

  // 3. Gemini API Check (Fallback if GEMINI_API_KEY is available)
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are a safety filter for a positive-sharing wall app. Determine if this post contains hate speech, bullying, harassment, self-harm/suicide mentions, sexual content, or severe profanity. Respond ONLY with a JSON object: {"flagged": boolean, "reason": "explanation in Thai if flagged, else empty"}. Text to analyze: "${trimmedText}"`
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json'
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText) {
          const parsed = JSON.parse(responseText.trim());
          if (parsed && parsed.flagged) {
            return {
              flagged: true,
              reason: parsed.reason || 'ข้อความไม่เหมาะสมสำหรับการโพสต์เชิงสร้างสรรค์'
            };
          }
        }
        return { flagged: false, reason: null };
      } else {
        console.error('Gemini API returned error:', await response.text());
      }
    } catch (error) {
      console.error('Error calling Gemini API for moderation:', error);
    }
  }

  // If no API keys or all failed, trust the local filter result (which passed)
  return { flagged: false, reason: null };
}
