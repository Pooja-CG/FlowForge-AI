import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
  dangerouslyAllowBrowser: true,
});

export async function generateWorkflow(projectIdea: string) {

  try {

    const completion =
      await client.chat.completions.create({

       model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `
You are an Autonomous Project Execution AI.

Analyze the project idea.

Break it into:
- modules
- tasks
- priorities
- estimated timelines

Return ONLY valid JSON.

Format:
{
  "projectName": "",
  "modules": [
    {
      "module": "",
      "tasks": [
        {
          "title": "",
          "priority": "",
          "estimatedDays": ""
        }
      ]
    }
  ]
}
            `,
          },

          {
            role: "user",
            content: projectIdea,
          },
        ],

        temperature: 0.7,
      });

    const response =
      completion.choices[0].message.content || "";

    const cleaned = response
      .replace(/```json/g, "")
      .replace(/```/g, "");

    return JSON.parse(cleaned);

  } catch (error) {

    console.error(error);

    return null;
  }
}