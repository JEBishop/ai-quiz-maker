import { Tool } from '@langchain/core/tools';
import wiki from 'wikipedia';

class FetchWikiSearchResultsTool extends Tool {
  name = 'fetch_wiki_search_results';
  description = 'Search wikipedia for a topic.'
  async _call(arg: string) {
    console.log('Fetching wiki search results for: ' + arg)
    try {
      const searchResults = await (wiki as any).search(arg, {suggestion: true, limit: 10});
      return JSON.stringify(searchResults);
    } catch (err: any) {
      console.log(err);
      return JSON.stringify({ error: err.message});
    }
  }
}

class FetchWikiDetailsTool extends Tool {
  name = 'fetch_wiki_details';
  description = 'Fetch info from Wikipedia for the topic.'
  async _call(arg: string) {
    console.log('Fetching wiki details for: ' + arg)
    try {
      const wikiPage = await (wiki as any).page(arg, { preload: true });
      const summary = wikiPage.summary();
      return JSON.stringify(summary);
    } catch (err: any) {
      console.log(err);
      return JSON.stringify({ error: err.message});
    }
  }
}

export const agentTools = [
  new FetchWikiSearchResultsTool(),
  new FetchWikiDetailsTool()
];

/**
 * let summary: wikiSummary; //sets the object as type wikiSummary
        summary = await wiki.summary(arg);
        console.log(summary);
 */