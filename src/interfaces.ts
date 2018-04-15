import * as axiosTypes from 'axios';

export interface IOptions {
  axiosOptions?: axiosTypes.AxiosRequestConfig;
}

export interface IDenmoralizedResponseObject {
  id?: string | number;
  [key: string]: any;
}

export type IDenmoralizedResponse =
  | IDenmoralizedResponseObject
  | IDenmoralizedResponseObject[];

export interface ICallbackArgs {
  type: string;
  data: IDenmoralizedResponse;
}

export type ID = string;
