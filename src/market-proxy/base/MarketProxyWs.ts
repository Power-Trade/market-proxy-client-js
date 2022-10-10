import axios, { AxiosRequestConfig } from 'axios';
import { RequestName } from '../types';
import { getUserTag } from '../utils/userTag';
import BaseWs from './BaseWs';

type OnMessageFn = (event: string, payload: any) => void;

class MarketProxyWs {
  protected ws: BaseWs;
  public wsUrl: string;
  public httpUrl: string;
  public authenticated: boolean = false;
  public accessToken?: string;

  private onMessageListeners: OnMessageFn[] = [];
  private taggedHandlers: Record<
    string,
    {
      resolve: (args: [RequestName, any]) => void;
      reject: (args: [RequestName, any]) => void;
    }
  > = {};
  private clientOrderIdHandlers: Record<
    string,
    {
      resolve: (args: [RequestName, any]) => void;
      reject: (args: [RequestName, any]) => void;
    }
  > = {};

  constructor({
    wsUrl,
    httpUrl,
    accessToken,
    onOpen,
  }: {
    wsUrl: string;
    httpUrl: string;
    accessToken?: string;
    onOpen: () => void;
  }) {
    this.wsUrl = wsUrl;
    this.httpUrl = httpUrl;
    this.accessToken = accessToken;

    this.ws = new BaseWs({
      url: this.wsUrl,
      onOpen,
      onClose: () => {},
      onMessage: this.onMessage,
    });
  }

  private onMessage = (payload: any) => {
    const event = Object.keys(payload)[0];

    if (event && payload[event].user_tag && this.taggedHandlers[payload[event].user_tag]) {
      const tag = payload[event].user_tag;

      this.taggedHandlers[tag].resolve([event as RequestName, payload[event]]);
      delete this.taggedHandlers[tag];
    }

    if (
      event &&
      payload[event].client_order_id &&
      this.clientOrderIdHandlers[payload[event].client_order_id]
    ) {
      const tag = payload[event].client_order_id;

      this.clientOrderIdHandlers[tag].resolve([event as RequestName, payload[event]]);
      delete this.clientOrderIdHandlers[tag];
    }

    this.onMessageListeners.forEach((callback) => callback(event, payload[event]));
  };

  public addOnMessageListener = (callback: OnMessageFn) => {
    if (!this.onMessageListeners.find((cb) => cb === callback)) {
      this.onMessageListeners.push(callback);
    }
  };

  public removeOnMessageListener = (callback: OnMessageFn) => {
    const index = this.onMessageListeners.findIndex((cb) => cb === callback);

    if (index > -1) {
      this.onMessageListeners.splice(index, 1);
    }
  };

  public restCall = async <T>(args: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await axios({
        ...args,
        headers: this.accessToken
          ? {
              credentials_secret: this.accessToken,
            }
          : args.headers,
      });

      return response.data as T;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          `Request to ${args.url} failed with ${error.response.status}: ${JSON.stringify(
            error.response.data
          )}`
        );
      } else {
        throw new Error(`Request to ${args.url} failed: ${error.message}`);
      }
    }
  };

  public sendTaggedRequest = (requestName: RequestName, payload: any) => {
    return new Promise<[RequestName, any]>((resolve, reject) => {
      const user_tag = getUserTag();

      this.taggedHandlers[user_tag] = { resolve, reject };

      this.ws.send({ [requestName]: { ...payload, user_tag } });
    });
  };

  public sendClientOrderIdRequest = (requestName: RequestName, payload: any) => {
    return new Promise<[RequestName, any]>((resolve, reject) => {
      const clientOrderId = payload.client_order_id;

      this.clientOrderIdHandlers[clientOrderId] = { resolve, reject };

      this.ws.send({ [requestName]: payload });
    });
  };

  public authenticate = async () => {
    const [, payload] = await this.sendTaggedRequest('authenticate', {
      credentials_secret: this.accessToken,
    });

    if (payload.error_code && payload.error_code !== '0') {
      throw new Error(payload.error_text);
    }

    this.authenticated = true;

    return;
  };

  public send = (payload: any) => {
    this.ws.send(payload);
  };
}

export default MarketProxyWs;
