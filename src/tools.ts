import { tool } from '@langchain/core/tools';
import wiki from 'wikipedia';
import { z } from 'zod';
import log from '@apify/log';
import OpenAI from "openai";

/**
 * This step is a bit arbitray, but it helps some of the older models to get the correct format.
 * Otherwise, sometimes they will pass the entire user input to `fetchWikiSearchResultsTool` which would likely not return any search results.
 */
const extractTopicTool = tool(
  async(input) => {
    log.info('in extract_topic');
    log.info(JSON.stringify(input));
    return JSON.stringify({
      searchQuery: input.searchQuery
    });
  },
  {
    name: 'extract_topic',
    description: 'Convert the user\'s request into a search query.',
    schema: z.object({
      searchQuery: z.string().describe('1-2 word search query for wikipedia.')
    })
  }
);

const fetchWikiSearchResultsTool = tool(
  async(input) => {
    log.info('in fetch_wiki_search_results');
    log.info(JSON.stringify(input));
    console.log('Fetching wiki search results for: ' + input.searchQuery)
    try {
      const searchResults = await (wiki as any).search(input.searchQuery, {suggestion: true, limit: 10});
      return JSON.stringify(searchResults);
    } catch (err: any) {
      console.log(err);
      return JSON.stringify({ error: err.message});
    }
  },
  {
    name: 'fetch_wiki_search_results',
    description: 'Get search results for the quiz topic.',
    schema: z.object({
      searchQuery: z.string().describe('Search query for wikipedia.')
    })
  }
);

const fetchWikiDetailsTool = tool(
  async(input) => {
    log.info('in fetch_wiki_details');
    log.info(JSON.stringify(input));
    console.log('Fetching wiki details for: ' + input.pageid)
    try {
      const wikiPage = await (wiki as any).page(input.pageid, { preload: true });
      const summary = wikiPage.summary();
      return JSON.stringify(summary);
    } catch (err: any) {
      console.log(err);
      return JSON.stringify({ error: err.message});
    }
  },
  {
    name: 'fetch_wiki_details',
    description: 'Get details from the wikipedia article.',
    schema: z.object({
      pageid: z.number().describe('Page ID for the wikipedia article.'),
      title: z.string().describe('Title of the wikipedia article.')
    })
  }
);

/**
 * If there are no Wikipedia results, our agent will fallback to searching the web.
 */
const webSearchTool = tool(
  async (input) => {
    log.info('in search_query_tool');
    log.info(JSON.stringify(input));
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini-search-preview",
      messages: [{
          "role": "user",
          "content": input.topic,
      }],
    });
    return JSON.stringify(completion.choices[0].message.content);
  }, {
    name: 'search_query_tool',
    description: 'Search the web for news about a topic.',
    schema: z.object({
      topic: z.string().describe("The topic to search for news about")
    })
  }
);

export const agentTools = [
  extractTopicTool,
  fetchWikiSearchResultsTool,
  fetchWikiDetailsTool,
  webSearchTool
];