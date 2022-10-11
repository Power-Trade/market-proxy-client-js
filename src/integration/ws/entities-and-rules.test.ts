import axios from 'axios';
import getMarketProxyApi from '../../market-proxy/api';
import { getConfig, getEnvironment } from '../../market-proxy/base/config';

test('[WS] fetch entities and rules works as expected', async () => {
  const api = await getMarketProxyApi(getConfig());

  const entities = await api.fetchEntitiesAndRulesWs();

  expect(entities.symbols.length).toBeTruthy();

  const env = getEnvironment();

  // Check that the number of entities is the same as pts
  const { data: marketData } = await axios.get(
    `https://api.rest.${env.toLowerCase()}.power.trade/v1/market_data/tradeable_entity/all/summary`
  );

  expect(marketData.length).toBeTruthy();

  expect(marketData.length).toEqual(entities.symbols.length);
}, 10000);