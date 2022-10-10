import { OrderRequest } from '../types';
import { log } from '../utils/log';

export const getOrderRequest = ({
  orderType,
  side,
  marketType,
  timeInForce,
  quantity,
  activeCycles,
  minimumQuantity,
  price,
  clientOrderId,
  legs,
  symbol,
  tradeableEntityId,
}: OrderRequest) => {
  const payload: any = {
    market_id: marketType === 'firm' ? '0' : 'none',
    side,
    quantity: quantity.toString(),
    type: orderType.toUpperCase(),
    time_in_force: timeInForce,
    client_order_id: clientOrderId,
    recv_window: activeCycles.toString(),
  };

  if (marketType !== 'rfq') {
    payload.price = price.toString();
  }

  if (legs && minimumQuantity !== undefined) {
    payload.legs = legs.map((l) => ({
      ratio: l.ratio.toString(),
      sym: l.symbol,
      tid: l.tradeableEntityId,
    }));
  } else if (symbol) {
    payload.symbol = symbol;
  } else if (tradeableEntityId) {
    payload.tradeableEntityId = tradeableEntityId;
  } else {
    log('order is missing symbol or tid or legs');
  }

  return payload;
};
