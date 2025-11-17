import { GoogleGenAI } from "@google/genai";

export default class ContentGenerator {
  private genAI: GoogleGenAI;

  constructor() {
    this.genAI = new GoogleGenAI({ apiKey: Deno.env.get("GOOGLE_API_KEY")! });
  }

  async generate(prompt: string): Promise<string | undefined> {
    const content = await this.genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return content?.text;
  }

  async generateJSON<T>(prompt: string, schema: Record<string, any>): Promise<T> {
    const content = await this.genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonText = content?.text || "{}";
    return JSON.parse(jsonText) as T;
  }
}
