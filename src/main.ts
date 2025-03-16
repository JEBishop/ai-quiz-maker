import { Actor } from 'apify';
import log from '@apify/log';
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import type { Input, Quiz, Output } from './types.js'
import { responseSchema } from './types.js'
import { agentTools } from './tools.js'
import { setContextVariable } from "@langchain/core/context";
import { RunnableLambda } from "@langchain/core/runnables";
import { formatMarkdown, formatHtml } from './utils.js';

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
  tools: agentTools,
  responseFormat: responseSchema
});

try {
  const handleRunTimeRequestRunnable = RunnableLambda.from(
    async ({ topic: topic }) => {
      setContextVariable("topic", topic);
      const modelResponse = await agent.invoke({
        messages: [new HumanMessage(`
          You are an expert study buddy. You are tasked with creating a study quiz from a wikipedia page.

          STEP 1: Determine the search prompt from the user's request: "${topic}".
          - The user may provide 1 or more words
          - Store this as 'searchQuery' for the next step.
          - Use the extract_topic tool to create a 1-2 word search query.

          STEP 2: Fetch Wikipedia search results:
          - Use the fetch_wiki_search_results to get a list of Wikipedia articles relevant to the search query from STEP 1.
          - Analyze the tool results and determine which result best fits the user's request of "${topic}".

          STEP 3: Fetch wikipedia info
          - For each relevant article, use the fetch_wiki_details tool to get the article summary text.
          - Using the output from 'fetch_wiki_details', generate a multiple-choice quiz object with 5 easy, 5 medium, and 5 hard questions.
          - Immediately output JSON object and stop any further processing.
      `)]
      }, {
        recursionLimit: 20
      });
      return modelResponse.structuredResponse as Quiz;
    }
  );

  const output: Quiz = await handleRunTimeRequestRunnable.invoke({ topic: topic });

  await Actor.setValue('quiz.html', formatHtml(output), { contentType: 'text/html' });
  await Actor.setValue('quiz.md', formatMarkdown(output), { contentType: 'text/markdown' });

  log.info(JSON.stringify(output));

  await Actor.pushData(output);
} catch (err: any) {
  log.error(err.message);
  await Actor.pushData({ error: err.message });
}
await Actor.exit();