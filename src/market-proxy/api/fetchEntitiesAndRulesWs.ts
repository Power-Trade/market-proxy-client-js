import MarketProxyWs from '../base/MarketProxyWs';
import { EntitiesAndRulesResponseRaw } from '../types';

export const fetchEntitiesAndRulesWs = async (ws: MarketProxyWs) => {
  const [, response] = await ws.sendTaggedRequest('entities_and_rules_request');

  return response as EntitiesAndRulesResponseRaw;
};
