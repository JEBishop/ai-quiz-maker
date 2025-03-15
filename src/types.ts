export interface Input {
  topic: string;
  OPENAI_API_KEY: string;
}

export interface Quiz {
  easy: Question[];
  medium: Question[];
  hard: Question[];
}

export interface Output {
  markdown: string;
  html: string;
  json: Quiz;
}

interface Question {
  question: string;
  answers: string[];
}

export const responseSchema = {
  type: "object",
  properties: {
    easy: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          answers: { 
            type: "array", 
            items: { type: "string" },
            minItems: 4,
            maxItems: 4
          }
        },
        required: ["question", "answers"]
      }
    },
    medium: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          answers: { 
            type: "array", 
            items: { type: "string" },
            minItems: 4,
            maxItems: 4
          }
        },
        required: ["question", "answers"]
      }
    },
    hard: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          answers: { 
            type: "array", 
            items: { type: "string" },
            minItems: 4,
            maxItems: 4
          }
        },
        required: ["question", "answers"]
      }
    }
  },
  required: ["easy", "medium", "hard"]
};