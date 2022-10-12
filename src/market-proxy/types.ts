export type Environment = 'dev' | 'prod' | 'staging' | 'test';

export type Config = {
  apiKey: string;
  privateKey: string;
  wsUrl: string;
  httpUrl: string;
};

export type Side = 'buy' | 'sell';

export type RfqTimeInForce = 'GTC' | 'IOC' | 'DAY';

export type MarketType = 'firm' | 'rfq';

export type RequestName =
  | 'authenticate'
  | 'new_order'
  | 'order_accepted'
  | 'new_bulk_order'
  | 'cancel_all_orders'
  | 'entities_and_rules_request'
  | 'cancel_order';

interface OrderLeg {
  symbol?: string;
  tradeableEntityId?: string;
  ratio: number;
}

export type OrderState = 'new' | 'accepted' | 'rejected';

export type Order = {
  symbol?: string;
  tradeableEntityId?: string;
  marketType: MarketType;
  orderType: 'Limit' | 'Market';
  side: Side;
  timeInForce: RfqTimeInForce;
  quantity: number;
  price: number;
  activeCycles: number;
  state: OrderState;
  legs?: OrderLeg[];
  minimumQuantity?: number;
  clientOrderId: string;
};

export type OrderRequest = Order;

export type OrderResponse = Order & {
  timestamp: number;
};

export type OpenOrderExecutionRaw = {
  utc_timestamp: string;
  executed_price: string;
  executed_quantity: string;
  trade_id: string;
  liquidity_flag: string;
};

export type MarketProxyOpenOrderRaw = {
  tradeable_entity_id: string;
  symbol: string;
  order_id: string;
  client_order_id: string;
  quantity: string;
  price: string;
  side: Side;
  order_state: OrderState;
  cancel_state: string;
  market_id: string;
  legs?: {
    tradeable_entity_id: string;
    symbol: string;
    ratio: string;
  }[];
  executions: OpenOrderExecutionRaw[];
};

export type OpenOrderExecution = {
  utcTimestamp: number;
  executedPrice: number;
  executedQuantity: number;
  tradeId: string;
  liquidityFlag: string;
};

export type OpenOrder = {
  tradeableEntityId: string;
  symbol: string;
  orderId: string;
  clientOrderId: string;
  quantity: number;
  price: number;
  side: Side;
  orderState: OrderState;
  cancelState: string;
  marketType: MarketType;
  legs?: {
    tradeableEntityId: string;
    symbol: string;
    ratio: number;
  }[];
  executions: OpenOrderExecution[];
  isMultiLeg: boolean;
  isMarketProxyOrder: boolean;
};

export type OpenOrderResponseRaw = {
  query_open_orders_response: {
    utc_timestamp: string;
    open_orders: MarketProxyOpenOrderRaw[];
  };
};

export type EntitySymbolRaw = {
  symbol: string;
  tradeable_entity_id: string;
  status: string;
  base_asset: string;
  quote_asset: string;
  minimum_quantity: string;
  maximum_quantity: string;
  minimum_value: string;
  maximum_value: string;
  quantity_step: string;
  price_step: string;
  tags: string[];
};

export type EntitiesAndRulesResponseRaw = {
  server_utc_timestamp: string;
  user_tag: string;
  symbols: EntitySymbolRaw[];
};

export type CancelOrderResponseRaw = {
  server_utc_timestamp: string;
  utc_timestamp: string;
  tradeable_entity_id: string;
  symbol: string;
  order_id: string;
  client_order_id: string;
  reason: string;
};
