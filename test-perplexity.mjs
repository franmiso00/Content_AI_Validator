
const apiKey = process.env.PERPLEXITY_API_KEY;
const model = "sonar";

async function test() {
    console.log("Testing Perplexity API...");
    console.log("Model:", model);
    console.log("Key prefix:", apiKey?.substring(0, 10));

    if (!apiKey) {
        console.error("No API key found in process.env");
        return;
    }

    try {
        const response = await fetch("https://api.perplexity.ai/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "system", content: "You are a test assistant." },
                    { role: "user", content: "Say hello." }
                ],
                max_tokens: 10
            })
        });

        if (!response.ok) {
            const text = await response.text();
            console.error("Error:", response.status, text);
        } else {
            const data = await response.json();
            console.log("Success:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Exception:", e);
    }
}

test();
