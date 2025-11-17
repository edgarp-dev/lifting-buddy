import { GoogleGenAI } from "@google/genai";

export default class Embedding {
    private genAI: GoogleGenAI;

    constructor() {
        this.genAI = new GoogleGenAI({ apiKey: Deno.env.get("GOOGLE_API_KEY")!});
    }

    async create(text: string): Promise<number[] | undefined> {

        const response = await this.genAI.models.embedContent({
            model: "gemini-embedding-001",
            contents: [text],
            config: {
                outputDimensionality: 1536,
            }
        });

        return response.embeddings?.[0]?.values;
    }
}