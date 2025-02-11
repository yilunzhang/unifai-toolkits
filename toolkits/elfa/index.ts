import * as dotenv from 'dotenv';
dotenv.config();

import { Toolkit, ActionContext } from 'unifai-sdk';
import { ElfaAPI } from './api';

async function main() {
  const toolkit = new Toolkit({ apiKey: process.env.TOOLKIT_API_KEY });
  const api = new ElfaAPI(process.env.ELFA_API_KEY);

  await toolkit.updateToolkit({
    name: 'Elfa',
    description: "Elfa provides X/Twitter data for web3/blockchain",
  });

  toolkit.event('ready', () => {
    console.log('Toolkit is ready to use');
  });

  toolkit.action({
    action: 'getTrendingTokens',
    actionDescription: 'Get tokens mostly discussed on X/Twitter recently',
    payloadDescription: {
      timeWindow: {
        type: 'string',
        description: 'Time window for trending analysis',
        default: '24h',
        required: false
      },
      limit: {
        type: 'number',
        description: 'Number of results to return, max is 100',
        default: 50,
        required: false
      },
      minMentions: {
        type: 'number', 
        description: 'Minimum number of mentions required',
        default: 10,
        required: false
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      const result = await api.trendingTokens(payload.timeWindow, payload.limit, payload.minMentions);
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to get trending tokens: ${error}` });
    }
  });

  toolkit.action({
    action: 'searchMentions',
    actionDescription: 'Search for mentions of specific keywords on X/Twitter recently',
    payloadDescription: {
      keywords: {
        type: 'string',
        description: 'Up to 5 keywords to search for, separated by commas. Phrases accepted',
        required: true
      },
      lastDays: {
        type: 'number',
        description: 'Number of days to search for, min is 1, max is 30',
        default: 7,
        required: false
      },
      limit: {
        type: 'number',
        description: 'Number of results to return, max is 30',
        default: 30,
        required: false
      }
    }
  }, async (ctx: ActionContext, payload: any = {}) => {
    try {
      const to = Math.floor(Date.now() / 1000);
      const from = to - (payload.lastDays * 24 * 60 * 60);
      const result = await api.mentionsSearch(
        payload.keywords,
        from,
        to,
        payload.limit
      );
      return ctx.result(result);
    } catch (error) {
      return ctx.result({ error: `Failed to search mentions: ${error}` });
    }
  });

  await toolkit.run();
}

main().catch(console.error);
