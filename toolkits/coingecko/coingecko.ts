import { CoingeckoAPI } from './api';

const api = new CoingeckoAPI();

export const tokenAddressMap = {
  "sol": {
    "solana": {
      "chain": "solana",
      "contract_address": "So11111111111111111111111111111111111111112",
      "decimal_place": 9,
    },
  },
  "eth": {
    "ethereum": {
      "chain": "ethereum",
      "tokenAddress": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      "decimal_place": 18,
    },
    "base": {
      "chain": "base",
      "tokenAddress": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      "decimal_place": 18,
    },
  },
  "bnb": {
    "bsc": {
      "chain": "bsc",
      "tokenAddress": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      "decimal_place": 18,
    },
  },
  "pol": {
    "polygon": {
      "chain": "polygon",
      "tokenAddress": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      "decimal_place": 18,
    },
  },
}

export const chainAliasMap = {
  "sol": "solana",
  "eth": "ethereum",
  "bnb": "bsc",
}

export async function getTokenBySymbol(symbol: string, chain?: string) {
  symbol = symbol.toLowerCase();
  chain = chain?.toLowerCase();
  if (chain && chainAliasMap[chain]) {
    chain = chainAliasMap[chain];
  }

  if (tokenAddressMap[symbol]) {
    if (chain) {
      if (tokenAddressMap[symbol][chain]) {
        return {
          [chain]: tokenAddressMap[symbol][chain],
        };
      }
    } else {
      return tokenAddressMap[symbol];
    }
  }
  const result = await api.searchToken(symbol);
  if (result.coins && result.coins.length > 0) {
    const token = result.coins.find(c => c.symbol.toLowerCase() === symbol.toLowerCase());
    if (token) {
      const tokenInfo = await api.getTokenInfo(token.id);
      const platforms = tokenInfo.detail_platforms || tokenInfo.platforms;
      if (platforms) {
        if (chain) {
          if (platforms[chain]) {
            return {
              [chain]: platforms[chain],
            };
          }
        } else {
          return platforms;
        }
      }
    }
  }
  return { error: 'Token not found' };
}

export async function getTokenAddressBySymbol(token: string, chain?: string) {
  chain = chain?.toLowerCase();
  if (chain && chainAliasMap[chain]) {
    chain = chainAliasMap[chain];
  }

  const result = await getTokenBySymbol(token, chain);
  if (Object.keys(result).length === 0) {
    return null;
  }
  if (chain) {
    return result?.[chain]?.contract_address || null;
  } else {
    return result?.[Object.keys(result)[0]]?.contract_address || null;
  }
}
