import * as axiosTypes from 'axios';

import { JSONApiModel } from './model';

export interface IOptions {
  axiosConfig?: axiosTypes.AxiosRequestConfig;
}

export interface IJSONApiModel {
  __type: string;
  __endpoint: string;
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

export type Model = typeof JSONApiModel | IJSONApiModel;
