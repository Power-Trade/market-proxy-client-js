import getMarketProxyApi, { MarketProxyApi } from '../../market-proxy/api';
import { getConfig } from '../../market-proxy/base/config';
import { EntitySymbolRaw, OrderRequest } from '../../market-proxy/types';
import { getUserTag } from '../../market-proxy/utils/userTag';
import { sleep } from '../../market-proxy/utils/time';

const getOrderBase = (): OrderRequest => ({
  activeCycles: 1,
  clientOrderId: getUserTag(),
  marketType: 'firm',
  orderType: 'Limit',
  price: 10000,
  quantity: 1,
  side: 'buy',
  state: 'new',
  timeInForce: 'GTC',
  symbol: 'BTC-USD',
});

describe('[WS] Single Leg Placement', () => {
  let api: MarketProxyApi;
  let symbols: EntitySymbolRaw[];

  beforeAll(async () => {
    api = await getMarketProxyApi(getConfig());

    await api.authenticate();

    const entities = await api.fetchEntitiesAndRulesWs();
    symbols = entities.symbols;
  }, 10000);

  afterAll(async () => {
    await api.cancelAllOpenOrders();
    await api.close();
  });

  test('Bulk of Single Leg Spot orders', async () => {
    await api.cancelAllOpenOrders();
    let orders = await api.fetchOpenOrders();

    expect(orders.length).toEqual(0);

    await api.placeBulkOrderWs([
      getOrderBase(),
      { ...getOrderBase(), symbol: 'ETH-USD', quantity: 2, price: 1000 },
      { ...getOrderBase(), symbol: 'PTF-USD', quantity: 1000, price: 0.2 },
    ]);

    while (orders.length < 3) {
      orders = await api.fetchOpenOrders();
      await sleep(200);
    }

    expect(orders).toContainEqual({
      cancelState: 'none',
      clientOrderId: expect.any(String),
      executions: [],
      orderId: expect.any(String),
      orderState: 'accepted',
      price: 0.2,
      quantity: 1000,
      side: 'buy',
      symbol: 'PTF-USD',
      tradeableEntityId: symbols.find((s) => s.symbol === 'PTF-USD')?.tradeable_entity_id,
      marketType: 'firm',
      isMultiLeg: false,
      isMarketProxyOrder: true,
    });

    expect(orders).toContainEqual({
      cancelState: 'none',
      clientOrderId: expect.any(String),
      executions: [],
      orderId: expect.any(String),
      orderState: 'accepted',
      price: 1000,
      quantity: 2,
      side: 'buy',
      symbol: 'ETH-USD',
      tradeableEntityId: symbols.find((s) => s.symbol === 'ETH-USD')?.tradeable_entity_id,
      marketType: 'firm',
      isMultiLeg: false,
      isMarketProxyOrder: true,
    });

    expect(orders).toContainEqual({
      cancelState: 'none',
      clientOrderId: expect.any(String),
      executions: [],
      orderId: expect.any(String),
      orderState: 'accepted',
      price: 10000,
      quantity: 1,
      side: 'buy',
      symbol: 'BTC-USD',
      tradeableEntityId: symbols.find((s) => s.symbol === 'BTC-USD')?.tradeable_entity_id,
      marketType: 'firm',
      isMultiLeg: false,
      isMarketProxyOrder: true,
    });
  }, 10000);

  test('Bulk of Single Leg orders and RFQs', async () => {
    await api.cancelAllOpenOrders();
    let orders = await api.fetchOpenOrders();

    expect(orders.length).toEqual(0);

    await api.placeBulkOrderWs([
      {
        ...getOrderBase(),
        symbol: symbols.find((s) => s.tags.indexOf('future') > -1)?.symbol,
      },
      {
        ...getOrderBase(),
        symbol: symbols.find((s) => s.tags.indexOf('option') > -1)?.symbol,
      },
      {
        ...getOrderBase(),
        symbol: 'BTC-USD-PERPETUAL',
      },
      {
        ...getOrderBase(),
        symbol: symbols.find((s) => s.tags.indexOf('future') > -1)?.symbol,
        marketType: 'rfq',
        price: 0,
      },
      {
        ...getOrderBase(),
        symbol: symbols.find((s) => s.tags.indexOf('option') > -1)?.symbol,
        marketType: 'rfq',
        price: 0,
      },
      {
        ...getOrderBase(),
        symbol: 'BTC-USD-PERPETUAL',
        marketType: 'rfq',
        price: 0,
      },
    ]);

    while (orders.length < 6) {
      orders = await api.fetchOpenOrders();
      await sleep(200);
    }

    expect(orders).toContainEqual({
      cancelState: 'none',
      clientOrderId: expect.any(String),
      executions: [],
      isMarketProxyOrder: true,
      isMultiLeg: false,
      legs: undefined,
      marketType: 'rfq',
      orderId: expect.any(String),
      orderState: 'accepted',
      price: NaN,
      quantity: 1,
      side: 'buy',
      symbol: 'BTC-20221028-21500P',
      tradeableEntityId: '3786',
    });

    expect(orders).toContainEqual({
      cancelState: 'none',
      clientOrderId: expect.any(String),
      executions: [],
      isMarketProxyOrder: true,
      isMultiLeg: false,
      legs: undefined,
      marketType: 'rfq',
      orderId: expect.any(String),
      orderState: 'accepted',
      price: NaN,
      quantity: 1,
      side: 'buy',
      symbol: 'ETH-20221021',
      tradeableEntityId: '3776',
    });

    expect(orders).toContainEqual({
      cancelState: 'none',
      clientOrderId: expect.any(String),
      executions: [],
      isMarketProxyOrder: true,
      isMultiLeg: false,
      legs: undefined,
      marketType: 'firm',
      orderId: expect.any(String),
      orderState: 'accepted',
      price: 10000,
      quantity: 1,
      side: 'buy',
      symbol: 'BTC-USD-PERPETUAL',
      tradeableEntityId: '13',
    });

    expect(orders).toContainEqual({
      cancelState: 'none',
      clientOrderId: expect.any(String),
      executions: [],
      isMarketProxyOrder: true,
      isMultiLeg: false,
      legs: undefined,
      marketType: 'rfq',
      orderId: expect.any(String),
      orderState: 'accepted',
      price: NaN,
      quantity: 1,
      side: 'buy',
      symbol: 'BTC-USD-PERPETUAL',
      tradeableEntityId: '13',
    });

    expect(orders).toContainEqual({
      cancelState: 'none',
      clientOrderId: expect.any(String),
      executions: [],
      isMarketProxyOrder: true,
      isMultiLeg: false,
      legs: undefined,
      marketType: 'firm',
      orderId: expect.any(String),
      orderState: 'accepted',
      price: 10000,
      quantity: 1,
      side: 'buy',
      symbol: 'BTC-20221028-21500P',
      tradeableEntityId: '3786',
    });

    expect(orders).toContainEqual({
      cancelState: 'none',
      clientOrderId: expect.any(String),
      executions: [],
      isMarketProxyOrder: true,
      isMultiLeg: false,
      legs: undefined,
      marketType: 'firm',
      orderId: expect.any(String),
      orderState: 'accepted',
      price: 10000,
      quantity: 1,
      side: 'buy',
      symbol: 'ETH-20221021',
      tradeableEntityId: '3776',
    });
  }, 10000);
});
