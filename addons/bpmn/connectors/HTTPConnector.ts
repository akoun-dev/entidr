import axios from 'axios';
import { Connector } from './Connector';

/**
 * Connecteur HTTP basique utilisant axios
 */
export class HTTPConnector implements Connector {
  name = 'http';

  async execute(params: {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: unknown;
    headers?: Record<string, string>;
  }): Promise<unknown> {
    const { url, method = 'GET', data, headers } = params;
    const response = await axios({ url, method, data, headers });
    return response.data;
  }
}
