import MarketProxyWs from '../../base/MarketProxyWs';
import { EntitiesAndRulesResponseRaw } from '../../types';

export const exchangeInfoRest = async (ws: MarketProxyWs): Promise<EntitiesAndRulesResponseRaw> => {
  const response = (await ws.restCall({
    url: `${ws.httpUrl}/v1/api/exchangeInfo`,
    method: 'GET',
  })) as { entities_and_rules_response: EntitiesAndRulesResponseRaw };

  return response.entities_and_rules_response;
};
