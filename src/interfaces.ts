import * as axiosTypes from 'axios';

export interface Options {
  axiosOptions?: axiosTypes.AxiosRequestConfig;
}

export interface DenmoralizedResponseObject {
  id?: string | number;
  [key: string]: any;
}

export type DenmoralizedResponse =
  | DenmoralizedResponseObject
  | DenmoralizedResponseObject[];

export interface CallbackArgs {
  type: string;
  data: DenmoralizedResponse;
}

export type ID = string | number;
