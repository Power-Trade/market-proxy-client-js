import MarketProxyWs from '../base/MarketProxyWs';
import { Config, OpenOrder, Order, OrderRequest } from '../types';
import { generateAccessToken } from '../utils/cryptography';
import { authenticate } from './authenticate';
import { cancelAllOpenOrders } from './cancelAllOpenOrders';
import { fetchOpenOrders } from './fetchOpenOrders';
import { placeBulkOrderWs } from './placeBulkOrderWs';
import { placeOrderWs } from './placeOrderWs';

class MarketProxyApi {
  private ws: MarketProxyWs;

  constructor(config: Config) {
    const accessToken = generateAccessToken(config.apiKey, config.privateKey);

    this.ws = new MarketProxyWs({
      wsUrl: config.wsUrl,
      httpUrl: config.httpUrl,
      accessToken,
    });
  }

  public authenticate = async () => await authenticate(this.ws);

  public placeOrderWs = async (order: OrderRequest) => await placeOrderWs(this.ws, order);

  public placeBulkOrderWs = (orders: OrderRequest[]) => placeBulkOrderWs(this.ws, orders);

  public fetchOpenOrders = async () => await fetchOpenOrders(this.ws);

  public cancelAllOpenOrders = async () => await cancelAllOpenOrders(this.ws);
}
