import { Actor } from 'apify';
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, MessageContentComplex } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import type { Input } from './types.js'
import { agentTools } from './tools.js'

await Actor.init();

const input = await Actor.getInput<Input>();
if (!input) throw new Error('No input provided.');

await Actor.charge({ eventName: 'init' });

const { OPENAI_API_KEY, topic } = input;

let llmAPIKey;
if(!OPENAI_API_KEY || OPENAI_API_KEY.length == 0) {
  llmAPIKey = process.env.OPENAI_API_KEY;
  await Actor.charge({ eventName: 'llm-input', count: topic.length });
} else {
  llmAPIKey = OPENAI_API_KEY;
}

const agentModel = new ChatOpenAI({ 
  apiKey: llmAPIKey,
  modelName: "gpt-4o-mini",  
}).bind({
  response_format: { type: "json_object" },
  tools: agentTools
});

const agent = createReactAgent({
  llm: agentModel,
  tools: agentTools
});

try {
  const finalState = await agent.invoke(
    {
      messages: [
        new HumanMessage(`
          You are an expert study buddy. You are tasked with creating a study quiz from a wikipedia page.

          STEP 1: Determine the search prompt from the user's request: ${topic}.
          - The user may provide 1 or more words
          - Store this as 'searchQuery' for the next step.

          STEP 2: Fetch Listings
          - Use the extracted 'searchQuery' from Step 1 to get wikipedia results using 'fetch_wiki_info'
          - Analyze the tool results and determine which result best fits the user's request of ${topic}.
          - Store the pageid of the best result as 'pageid'

          STEP 3: Fetch wikipedia info
          - Use the 'pageid' from STEP 2 to get the wikipedia details using 'fetch_wiki_details'
          - Using the output from 'fetch_wiki_details', generate a multiple-choice quiz object with 5 easy, 5 medium, and 5 hard questions in this structure:
          \`\`\`json
          {
            easy: [
              { question: "sample easy question 1", answers: [ "sample answer 1", "sample answer 2", "sample answer 3", "sample answer 4" ]}
               ...
            ]
            medium: [
              { question: "sample medium question 1", answers: [ "sample answer 1", "sample answer 2", "sample answer 3", "sample answer 4" ]}
               ...
            ]
            herd: [
              { question: "sample hard question 1", answers: [ "sample answer 1", "sample answer 2", "sample answer 3", "sample answer 4" ]}
               ...
            ]
          }
          \`\`\`

          STEP 4: Return quiz as JSON
          - Return the quiz JSON without additional commentary.
        `)
      ]
    }, {
      recursionLimit: 25
    }
  );

  var content = finalState.messages[finalState.messages.length - 1].content;
  /**
   * Some GPT models will wrap the output array in an object, despite response formatting and strict prompting.
   * Ex: { "results": [<< our data array >>] }
   * Need to handle these edge cases gracefully in order to guarantee consistent output for users.
   */
  if (typeof content === 'string') {
    try {
      const parsedContent = JSON.parse(content) as MessageContentComplex[];
      if (typeof parsedContent === 'object' && parsedContent !== null && !Array.isArray(parsedContent)) {
        const possibleKeys = ['input', 'output', 'result', 'results', 'response', 'quiz', 'questions', 'quizzes', 'trivia'];
        
        const matchingKey = possibleKeys.find(key => key in parsedContent as any);
        
        if (matchingKey) {
          content = (parsedContent as any)[matchingKey];
        } else {
          content = parsedContent;
        }
      } else {
        content = parsedContent; 
      }
    } catch (error) {
      console.error("Failed to parse JSON:", error);
    }
  }
  const output = Array.isArray(content) ? content: [content];

  console.log(output)

  await Actor.charge({ eventName: 'listings-output', count: output.length });

  await Actor.pushData(output);
} catch (e: any) {
  console.log(e);
  await Actor.pushData({ error: e.message });
}
await Actor.exit();