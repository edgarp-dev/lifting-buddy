import { is } from "@zod/zod/v4/locales";
import ContentGenerator from "../content/ContentGenerator.ts";

interface DateRange {
  start_date: string;
  end_date: string;
}

interface DateRangeResponse {
  is_date_query: boolean;
  start_date?: string;
  end_date?: string;
}

export default class QueryAnalyzer {
  private contentGenerator: ContentGenerator;

  constructor() {
    this.contentGenerator = new ContentGenerator();
  }

  async extractDateRange(query: string): Promise<DateRange | null> {
    const today = new Date();
    const currentDate = today.toISOString().split("T")[0];

    const prompt = `
        Analyze the user query and determine if it's asking about a specific time period.

        Current date: ${currentDate}

        User query: "${query}"

        Instructions:
        - If the query asks about a specific time period (like "this week", "last month", "yesterday", "in November"), set is_date_query to true and provide start_date and end_date.
        - If the query is NOT about a time period (like "heaviest weight", "best exercise", "total volume"), set is_date_query to false.

        Examples:
        - "what are my workouts this week?" → is_date_query: true, start_date: "2025-11-03", end_date: "2025-11-08"
        - "what did I do yesterday?" → is_date_query: true, start_date: "2025-11-07", end_date: "2025-11-07"
        - "heaviest bicep curl" → is_date_query: false
    `.trim();

    try {
      const responseSchema = {
        type: "object",
        properties: {
          is_date_query: {
            type: "boolean",
            description:
              "Whether the query is asking about a specific time period",
          },
          start_date: {
            type: "string",
            description:
              "Start date in YYYY-MM-DD format (only if is_date_query is true)",
          },
          end_date: {
            type: "string",
            description:
              "End date in YYYY-MM-DD format (only if is_date_query is true)",
          },
        },
        required: ["is_date_query"],
      };
      const response = await this.contentGenerator.generateJSON<
        DateRangeResponse
      >(prompt, responseSchema);

      const { is_date_query } = response;

      if (is_date_query) {
        const { start_date, end_date } = response;
        return {
          start_date: start_date!,
          end_date: end_date!,
        };
      }

      return null;
    } catch (error) {
      console.error("Error extracting date range:", error);
      return null;
    }
  }
}
