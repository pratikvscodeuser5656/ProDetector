// 1. Push the size limit to Vercel's absolute maximum
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4.5mb', 
        },
    },
};

// 2. Override the 10-second timeout! 
// Vercel now allows Hobby users to request up to 60 seconds.
export const maxDuration = 60; 

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Only POST requests allowed' });
    }

    const API_KEY = process.env.GEMINI_API_KEY; 
    
    // Safety check just in case the Vercel Environment Variable is missing
    if (!API_KEY) {
        return res.status(500).json({ error: 'API key is missing in Vercel settings.' });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        
        // If Gemini rejects it (e.g., due to safety filters), pass that specific error to the frontend
        if (!response.ok) {
            return res.status(response.status).json({ error: data.error?.message || "Gemini API rejected the request." });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to connect to Gemini API.' });
    }
}
