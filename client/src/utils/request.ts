import Taro from '@tarojs/taro';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: Record<string, string>;
}

const BASE_URL = (typeof process !== 'undefined' && process.env?.TARO_APP_API_BASE_URL) || 'http://localhost:3002/api';

export const request = async <T = any>(options: RequestOptions): Promise<T> => {
  const { url, method = 'GET', data, header = {} } = options;

  try {
    const token = Taro.getStorageSync('token');
    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }

    const response = await Taro.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header
      }
    });

    console.log('[Request]', method, url, data, response.statusCode);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response.data as T;
    }

    if (response.statusCode === 401) {
      Taro.removeStorageSync('token');
      Taro.showToast({ title: '请先登录', icon: 'none' });
    }

    throw new Error(`Request failed with status ${response.statusCode}`);
  } catch (error) {
    console.error('[Request Error]', method, url, error);
    throw error;
  }
};

export const get = <T = any>(url: string, data?: any) =>
  request<T>({ url, method: 'GET', data });

export const post = <T = any>(url: string, data?: any) =>
  request<T>({ url, method: 'POST', data });

export const put = <T = any>(url: string, data?: any) =>
  request<T>({ url, method: 'PUT', data });

export const del = <T = any>(url: string, data?: any) =>
  request<T>({ url, method: 'DELETE', data });
