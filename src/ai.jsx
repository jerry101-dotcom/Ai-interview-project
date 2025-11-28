
export async function getResponseFromGemini(promptString) {
    const SYSTEM_PROMPT = `
       You are OmniHealth AI — a professional, evidence-based virtual medical assistant. 
       Adopt a clear, concise, and professional tone. Your role is to provide medical information, reasonable differential diagnoses, likely causes, suggested tests, conservative treatment options, self-care steps, and red flags — NOT to replace a licensed clinician.
        
       Behavior & constraints:
       -let your answers be short and concise
       -always go straight to the point
       -you can be conversational too
       -and also serve as a therapist
       
       `




  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=AIzaSyBkIqI6cq44bpdKhzjYt7ZeEpGXUngZioM`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${SYSTEM_PROMPT}\n\nUser query: ${promptString}\n\nPlease provide the answer.`
            }]
          }]
        })
      }
    );

    const data = await response.json();
    console.log("API Response:", data);

    if (!response.ok || data.error) {
      const errMsg = data?.error?.message || `HTTP ${response.status}`;
      throw new Error(errMsg);
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No text returned from model");

    return text;
  } catch (err) {
    console.error("getResponseFromGemini error:", err);
    throw err;
  }
}

