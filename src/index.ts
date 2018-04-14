import * as JSONAPI from 'jsonapi-typescript';

import { Options, CallbackArgs, ID } from './interfaces';
import * as helpers from './helpers';
import { JSONApiModel } from './model';
import axios from 'axios';
import * as axiosTypes from 'axios';

export class JSONApiClient {
  private endpoint: string = '/';
  public axios: axiosTypes.AxiosInstance;

  constructor(private options: Options) {
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

  register(type: string, cb: (arg: CallbackArgs) => any): JSONApiClient {
    helpers.registerSubclass(type, cb);
    return this;
  }

  query(model: typeof JSONApiModel): JSONApiClient {
    this.endpoint = model.__endpoint;
    return this;
  }

  all(
    axiosOptions?: axiosTypes.AxiosRequestConfig
  ): Promise<axiosTypes.AxiosResponse> {
    return this.axios.get(this.endpoint, axiosOptions);
  }

  get(
    id: ID,
    axiosOptions?: axiosTypes.AxiosRequestConfig
  ): Promise<axiosTypes.AxiosResponse> {
    const url = `${this.endpoint}/${id}`;

    return this.axios.get(url, axiosOptions);
  }

  create(
    payload: any,
    axiosOptions?: axiosTypes.AxiosRequestConfig
  ): Promise<axiosTypes.AxiosResponse> {
    return axios.post(this.endpoint, payload, axiosOptions);
  }

  update(
    id: ID,
    payload: any,
    axiosOptions?: axiosTypes.AxiosRequestConfig
  ): Promise<axiosTypes.AxiosResponse> {
    const url: string = `${this.endpoint}/${id}`;

    return this.axios.put(url, payload, axiosOptions);
  }

  delete(
    id: ID,
    axiosOptions?: axiosTypes.AxiosRequestConfig
  ): Promise<axiosTypes.AxiosResponse> {
    const url: string = `${this.endpoint}/${id}`;

    return axios.delete(url, axiosOptions);
  }
}
