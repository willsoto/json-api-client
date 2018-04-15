import axios from 'axios';
import * as axiosTypes from 'axios';
import * as JSONAPI from 'jsonapi-typescript';

import * as helpers from './helpers';
import { ICallbackArgs, ID, IOptions } from './interfaces';
import { JSONApiModel } from './model';

export class JSONApiClient {
  public axios: axiosTypes.AxiosInstance;

  private endpoint: string = '/';

  constructor(private options: IOptions) {
    const axiosOptions = Object.assign(
      {},
      {
        headers: {
          'content-type': 'application/vnd.api+json'
        }
      },
      this.options.axiosOptions
    );

    this.axios = axios.create(axiosOptions);

    this.axios.interceptors.response.use(
      function(response) {
        response.data = helpers.denormalize(response.data);

        return response;
      },
      function(error) {
        return Promise.reject(error);
      }
    );
  }

  public register(
    type: string,
    cb: (arg: ICallbackArgs) => any
  ): JSONApiClient {
    helpers.registerSubclass(type, cb);
    return this;
  }

  public query(model: typeof JSONApiModel): JSONApiClient {
    this.endpoint = model.__endpoint;
    return this;
  }

  public all(
    axiosOptions?: axiosTypes.AxiosRequestConfig
  ): Promise<axiosTypes.AxiosResponse> {
    return this.axios.get(this.endpoint, axiosOptions);
  }

  public get(
    id: ID,
    axiosOptions?: axiosTypes.AxiosRequestConfig
  ): Promise<axiosTypes.AxiosResponse> {
    const url = `${this.endpoint}/${id}`;

    return this.axios.get(url, axiosOptions);
  }

  public create(
    payload: any,
    axiosOptions?: axiosTypes.AxiosRequestConfig
  ): Promise<axiosTypes.AxiosResponse> {
    return axios.post(this.endpoint, payload, axiosOptions);
  }

  public update(
    id: ID,
    payload: any,
    axiosOptions?: axiosTypes.AxiosRequestConfig
  ): Promise<axiosTypes.AxiosResponse> {
    const url: string = `${this.endpoint}/${id}`;

    return this.axios.patch(url, payload, axiosOptions);
  }

  public delete(
    id: ID,
    axiosOptions?: axiosTypes.AxiosRequestConfig
  ): Promise<axiosTypes.AxiosResponse> {
    const url: string = `${this.endpoint}/${id}`;

    return axios.delete(url, axiosOptions);
  }
}

export * from './model';
