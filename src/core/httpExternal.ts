import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

function createExternalClient(timeoutMs = 5000): AxiosInstance {
  const instance = axios.create({ timeout: timeoutMs });

  // Simple retry on network errors/timeouts (max 1 retry)
  instance.interceptors.response.use(
    (res) => res,
    async (error) => {
      const cfg = error.config as AxiosRequestConfig & { __retry?: boolean };
      if (!cfg || cfg.__retry) throw error;
      cfg.__retry = true;
      return instance.request(cfg);
    }
  );
  return instance;
}

export const externalHttp = createExternalClient();

