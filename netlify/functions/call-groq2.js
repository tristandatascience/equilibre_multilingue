// Fichier : netlify/functions/call-groq.js

exports.handler = async function(event, context) {
    // Cette ligne est utile mais ne prolonge pas le délai de 10 secondes de Netlify.
    context.callbackWaitsForEmptyEventLoop = false;
    
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "La clé d'API Groq (GROQ_API_KEY) n'est pas configurée sur le serveur Netlify." })
        };
    }

    // Vérifier que le corps de la requête existe et est valide
    if (!event.body) {
        return {
            statusCode: 400, // Bad Request
            body: JSON.stringify({ error: "Le corps de la requête est manquant." })
        };
    }

    let prompt, isJsonMode;
    try {
        ({ prompt, isJsonMode } = JSON.parse(event.body));
    } catch (e) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Le corps de la requête n'est pas un JSON valide." })
        };
    }

    const payload = {
        messages: [{ role: "user", content: prompt }],
        model: "meta-llama/llama-4-maverick-17b-128e-instruct"
        // model: "llama-3.1-8b-instant"
        // La propriété 'timeout' a été supprimée car elle n'est pas supportée par l'API.
    };

    if (isJsonMode) {
        payload.response_format = { "type": "json_object" };
    }

    const apiUrl = `https://api.groq.com/openai/v1/chat/completions`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groqApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Erreur de l'API Groq: ${response.status}`, errorBody);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `Erreur de l'API Groq: ${response.statusText}. Détails: ${errorBody}` })
            };
        }

        const result = await response.json();
        
        const content = result?.choices?.[0]?.message?.content;

        if (!content) {
            console.error("Réponse de Groq invalide ou vide :", JSON.stringify(result));
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "La réponse de l'IA est vide ou mal formée." })
            };
        }
        
        return {
            statusCode: 200,
            body: content 
        };

    } catch (error) {
        console.error("Erreur interne de la fonction:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Erreur interne de la fonction: ${error.message}` })
        };
    }
};
