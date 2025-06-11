interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

class GeminiAPI {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  async generateContent(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('Gemini API Error:', error);
      return 'Sorry, I am currently unavailable. Please try again later.';
    }
  }

  async generateQuiz(topic: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<any> {
    const prompt = `Generate a ${difficulty} level quiz about ${topic} in finance/investing. 
    Return exactly 5 multiple choice questions in this JSON format:
    {
      "questions": [
        {
          "question": "Question text here",
          "options": ["A", "B", "C", "D"],
          "correct": 0,
          "explanation": "Why this answer is correct"
        }
      ]
    }`;

    try {
      const response = await this.generateContent(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Quiz generation error:', error);
      return {
        questions: [
          {
            question: "What does P/E ratio stand for?",
            options: ["Price to Earnings", "Profit to Equity", "Price to Equity", "Profit to Earnings"],
            correct: 0,
            explanation: "P/E ratio stands for Price-to-Earnings ratio, which compares a company's stock price to its earnings per share."
          }
        ]
      };
    }
  }

  async explainConcept(concept: string, level: 'beginner' | 'intermediate' | 'advanced' = 'beginner'): Promise<string> {
    const prompt = `Explain the financial concept "${concept}" at a ${level} level. 
    Make it clear, concise, and include a practical example. 
    Keep the explanation under 200 words.`;

    return await this.generateContent(prompt);
  }

  async analyzeMarketNews(headline: string): Promise<string> {
    const prompt = `Analyze this financial news headline and predict its potential market impact: "${headline}"
    Provide a brief analysis including:
    1. Likely market reaction (positive/negative/neutral)
    2. Which sectors might be affected
    3. Short-term vs long-term implications
    Keep it under 150 words.`;

    return await this.generateContent(prompt);
  }
}

export const geminiAPI = new GeminiAPI();