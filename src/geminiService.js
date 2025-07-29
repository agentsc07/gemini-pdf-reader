/**
 * Calls the Gemini API to analyze the document text in a single, comprehensive pass.
 * @param {string} text The full text of the PDF.
 * @returns {Promise<Object>} An object containing the full analysis.
 */
export async function analyzeDocumentWithGemini(text) {
    const apiKey = "<enter_your_api_key_here>";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const prompt = `
        Analyze the following research paper text and provide a detailed analysis.

        Perform these tasks:
        1.  **Overall Summary:** Write a high-level summary of the paper's core contribution, its methodology, and its main findings. Make it easy to understand for a non-expert, using an analogy if it helps clarify a complex topic.
        2.  **Section Analysis:** Identify the main sections of the paper (e.g., Introduction, Method, Results, Conclusion). For each section, provide its exact title and a concise summary of its content. Please include summary of abstract if present.
        3.  **Entity Extraction:** Extract the following from the document:
            * **Key Concepts & Phrases:** A list of important technical terms, acronyms, and phrases. For each, provide a simple, one-sentence definition or explanation suitable for a non-expert.
            * **People:** A list of the paper's authors and any other individuals mentioned in the  text. For each person, provide their name and a brief, one-sentence description of their role or field of study. Please include any notable contributions or affiliations.
            * **Emails:** A list of any email addresses found.

        Return your entire response as a single, valid JSON object. Do NOT include any other text, explanations, or markdown formatting like \`\`\`json outside of the JSON object itself.

        Use this exact JSON structure:
        {
          "paper_summary": "...",
          "section_analysis": [
            {
              "section_title": "1. Introduction",
              "section_summary": "..."
            }
          ],
          "keywords": [
            {
              "term": "Convolutional Neural Network (CNN)",
              "definition": "A type of deep learning model particularly suited for analyzing visual imagery."
            }
          ],
          "people": [
            {
              "name": "Geoffrey Hinton",
              "description": "A prominent figure in the field of deep learning, often referred to as one of the 'Godfathers of AI'."
            }
          ],
          "emails": ["..."]
        }

        Here is the document text:
        ---
        ${text.substring(0, 950000)}
    `;

    const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        
        if (!result.candidates || !result.candidates[0].content.parts[0].text) {
            throw new Error("Invalid API response structure.");
        }
        
        const rawText = result.candidates[0].content.parts[0].text;
        
        // **FIX:** Robustly find and extract the JSON object from the raw text.
        // This handles cases where the API adds extra text before or after the JSON.
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            throw new Error("No valid JSON object found in the API response.");
        }

        const jsonObj = JSON.parse(jsonMatch[0]);
        
        return {
            paper_summary: jsonObj.paper_summary || "No summary available.",
            section_analysis: jsonObj.section_analysis || [],
            keywords: jsonObj.keywords || [],
            people: jsonObj.people || [],
            emails: jsonObj.emails || []
        };
    } catch (error) {
        console.error('Error calling or parsing Gemini API response:', error);
        return {
            paper_summary: "Could not analyze the document due to an API error.",
            section_analysis: [],
            keywords: [],
            people: [],
            emails: []
        };
    }
}