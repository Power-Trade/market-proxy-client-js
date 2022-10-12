import MarketProxyWs from '../base/MarketProxyWs';
import { Config, OrderRequest } from '../types';
import { generateAccessToken } from '../utils/cryptography';
import { authenticate } from './authenticate';
import { cancelAllOpenOrdersRest } from './cancelAllOpenOrdersRest';
import { cancelAllOpenOrdersWs, CancelAllOpenOrdersWsArgs } from './cancelAllOpenOrdersWs';
import { cancelOpenOrderWs, CancelOpenOrderWsArgs } from './cancelOpenOrderWs';
import { fetchEntitiesAndRulesWs } from './fetchEntitiesAndRulesWs';
import { fetchOpenOrdersRest } from './fetchOpenOrdersRest';
import { placeBulkOrderWs } from './placeBulkOrderWs';
import { placeOrderWs } from './placeOrderWs';

export class MarketProxyApi {
  public ws: MarketProxyWs;

  constructor(config: Config, onOpen: (api: MarketProxyApi) => void) {
    const accessToken = generateAccessToken(config.apiKey, config.privateKey);

    this.ws = new MarketProxyWs({
      wsUrl: config.wsUrl,
      httpUrl: config.httpUrl,
      accessToken,
      onOpen: () => onOpen(this),
    });
  }

  public close = async () => await this.ws.close();

  public authenticate = async () => await authenticate(this.ws);

  public fetchEntitiesAndRulesWs = async () => await fetchEntitiesAndRulesWs(this.ws);

  public placeOrderWs = async (order: OrderRequest) => await placeOrderWs(this.ws, order);

  public placeBulkOrderWs = (orders: OrderRequest[]) => placeBulkOrderWs(this.ws, orders);

  public cancelOpenOrderWs = (args: CancelOpenOrderWsArgs) => cancelOpenOrderWs(this.ws, args);

  public cancelAllOpenOrdersWs = (args?: CancelAllOpenOrdersWsArgs) =>
    cancelAllOpenOrdersWs(this.ws, args);

  public fetchOpenOrdersRest = async () => await fetchOpenOrdersRest(this.ws);

  public cancelAllOpenOrdersRest = async () => await cancelAllOpenOrdersRest(this.ws);
}

const getMarketProxyApi = (config: Config) => {
  return new Promise<MarketProxyApi>((resolve) => new MarketProxyApi(config, resolve));
};

export default getMarketProxyApi;
