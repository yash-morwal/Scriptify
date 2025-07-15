import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

export async function getResponseai (prompt) {
const response = await groq.chat.completions.create({
    model: "llama3-70b-8192",
    messages:  prompt,
    temperature: 1
})
const answer = response.choices[0].message.content
return answer
}