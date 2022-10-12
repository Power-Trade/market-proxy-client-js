import MarketProxyWs from '../base/MarketProxyWs';
import { log } from '../utils/log';

export const cancelOpenOrderRest = async (ws: MarketProxyWs, orderId: string) => {
  const r = await ws.restCall({
    url: `${ws.httpUrl}/v1/api/order?order_id=${orderId}`,
    method: 'DELETE',
  });

  log(r);
};
