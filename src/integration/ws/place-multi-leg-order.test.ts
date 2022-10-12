import getMarketProxyApi, { MarketProxyApi } from '../../market-proxy/api';
import { getConfig } from '../../market-proxy/base/config';
import { EntitySymbolRaw, OrderRequest } from '../../market-proxy/types';
import { toNumber } from '../../market-proxy/utils/number';
import { getUserTag } from '../../market-proxy/utils/userTag';

describe('[WS] Multi Leg Placement', () => {
  let api: MarketProxyApi;
  let symbols: EntitySymbolRaw[];

  beforeAll(async () => {
    api = await getMarketProxyApi(getConfig());

    await api.authenticate();

    const entities = await api.fetchEntitiesAndRulesWs();
    symbols = entities.symbols;
  }, 10000);

  afterAll(async () => {
    await api.cancelAllOpenOrdersRest();
    await api.close();
  });

  test('Multi Leg Option order by symbols', async () => {
    const syms = symbols.filter((s) => s.tags.indexOf('option') > -1).slice(0, 10);
    syms.sort((a, b) => toNumber(a.tradeable_entity_id) - toNumber(b.tradeable_entity_id));

    const order: OrderRequest = {
      activeCycles: 1,
      clientOrderId: getUserTag(),
      marketType: 'firm',
      orderType: 'Limit',
      price: 10000,
      quantity: 1,
      side: 'buy',
      state: 'new',
      timeInForce: 'GTC',
      minimumQuantity: 0.1,
      legs: [
        {
          ratio: 1,
          symbol: syms[0].symbol,
        },
        {
          ratio: -1,
          symbol: syms[1].symbol,
        },
        {
          ratio: -1,
          symbol: syms[2].symbol,
        },
      ],
    };

    const orderResponse = await api.placeOrderWs(order);

    expect(orderResponse).toEqual({
      ...order,
      state: 'accepted',
      timestamp: expect.any(Number),
    });
  });

  test('Multi Leg Option order by te ids', async () => {
    const syms = symbols.filter((s) => s.tags.indexOf('option') > -1).slice(0, 10);
    syms.sort((a, b) => toNumber(a.tradeable_entity_id) - toNumber(b.tradeable_entity_id));

    const order: OrderRequest = {
      activeCycles: 1,
      clientOrderId: getUserTag(),
      marketType: 'firm',
      orderType: 'Limit',
      price: 10000,
      quantity: 1,
      side: 'buy',
      state: 'new',
      timeInForce: 'GTC',
      minimumQuantity: 0.1,
      legs: [
        {
          ratio: 1,
          symbol: syms[3].symbol,
        },
        {
          ratio: -1,
          symbol: syms[4].symbol,
        },
        {
          ratio: -1,
          symbol: syms[5].symbol,
        },
      ],
    };

    const orderResponse = await api.placeOrderWs(order);

    expect(orderResponse).toEqual({
      ...order,
      state: 'accepted',
      timestamp: expect.any(Number),
    });
  });

  test('Multi Leg RFQ order by symbols', async () => {
    const syms = symbols.filter((s) => s.tags.indexOf('option') > -1).slice(0, 10);
    syms.sort((a, b) => toNumber(a.tradeable_entity_id) - toNumber(b.tradeable_entity_id));

    const order: OrderRequest = {
      activeCycles: 1,
      clientOrderId: getUserTag(),
      marketType: 'rfq',
      orderType: 'Limit',
      price: 0,
      quantity: 1,
      side: 'buy',
      state: 'new',
      timeInForce: 'GTC',
      minimumQuantity: 0,
      legs: [
        {
          ratio: 1,
          symbol: syms[0].symbol,
        },
        {
          ratio: -5,
          symbol: syms[3].symbol,
        },
        {
          ratio: 2,
          symbol: syms[6].symbol,
        },
      ],
    };

    const orderResponse = await api.placeOrderWs(order);

    expect(orderResponse).toEqual({
      ...order,
      state: 'accepted',
      timestamp: expect.any(Number),
    });
  });

  test('Multi Leg RFQ order by te ids', async () => {
    const syms = symbols.filter((s) => s.tags.indexOf('option') > -1).slice(0, 10);
    syms.sort((a, b) => toNumber(a.tradeable_entity_id) - toNumber(b.tradeable_entity_id));

    const order: OrderRequest = {
      activeCycles: 1,
      clientOrderId: getUserTag(),
      marketType: 'rfq',
      orderType: 'Limit',
      price: 0,
      quantity: 10,
      side: 'buy',
      state: 'new',
      timeInForce: 'GTC',
      minimumQuantity: 0.1,
      legs: [
        {
          ratio: 1,
          symbol: syms[3].symbol,
        },
        {
          ratio: -10,
          symbol: syms[5].symbol,
        },
        {
          ratio: 4,
          symbol: syms[7].symbol,
        },
      ],
    };

    const orderResponse = await api.placeOrderWs(order);

    expect(orderResponse).toEqual({
      ...order,
      state: 'accepted',
      timestamp: expect.any(Number),
    });
  });

  test('Multi Leg Option order fails if te ids are not ordered', async () => {
    const syms = symbols.filter((s) => s.tags.indexOf('option') > -1).slice(0, 10);
    syms.sort((a, b) => toNumber(a.tradeable_entity_id) - toNumber(b.tradeable_entity_id));

    const order: OrderRequest = {
      activeCycles: 1,
      clientOrderId: getUserTag(),
      marketType: 'firm',
      orderType: 'Limit',
      price: 10000,
      quantity: 1,
      side: 'buy',
      state: 'new',
      timeInForce: 'GTC',
      minimumQuantity: 0.1,
      legs: [
        {
          ratio: 1,
          symbol: syms[1].symbol,
        },
        {
          ratio: -1,
          symbol: syms[0].symbol,
        },
      ],
    };

    const orderResponse = await api.placeOrderWs(order);

    expect(orderResponse).toEqual({
      ...order,
      state: 'rejected',
      timestamp: expect.any(Number),
    });
  });

  test('Multi Leg Option order fails if more than 10 legs', async () => {
    const syms = symbols.filter((s) => s.tags.indexOf('option') > -1).slice(0, 15);
    syms.sort((a, b) => toNumber(a.tradeable_entity_id) - toNumber(b.tradeable_entity_id));

    const order: OrderRequest = {
      activeCycles: 1,
      clientOrderId: getUserTag(),
      marketType: 'firm',
      orderType: 'Limit',
      price: 10000,
      quantity: 1,
      side: 'buy',
      state: 'new',
      timeInForce: 'GTC',
      minimumQuantity: 0.1,
      legs: syms.map((s) => ({ ratio: 1, symbol: s.symbol })),
    };

    const orderResponse = await api.placeOrderWs(order);

    expect(orderResponse).toEqual({
      ...order,
      state: 'rejected',
      timestamp: expect.any(Number),
    });
  });
});
