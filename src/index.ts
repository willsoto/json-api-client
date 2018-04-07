import * as JSONAPI from "jsonapi-typescript";

import { Options, CallbackArgs, DenmoralizedResponse, ID } from "./interfaces";
import * as helpers from "./helpers";
import { JSONApiModel } from "./model";

export class JSONApiClient {
  private endpoint: string = "/";
  private fetchOptions: RequestInit;

  constructor(private options: Options) {
    this.fetchOptions = Object.assign(
      {},
      {
        headers: {
          "content-type": "application/vnd.api+json"
        }
      },
      this.options.fetchOptions
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

  get url(): string {
    const { baseURL = location.origin, basePath } = this.options;

    return baseURL + basePath + this.endpoint;
  }

  async all(fetchOptions?: RequestInit): Promise<DenmoralizedResponse> {
    const options = Object.assign({}, this.fetchOptions, fetchOptions);

    try {
      return helpers.makeRequest(this.url, options);
    } catch (e) {
      throw e;
    }
  }

  async get(id: ID, fetchOptions?: RequestInit): Promise<DenmoralizedResponse> {
    const options = Object.assign({}, this.fetchOptions, fetchOptions);

    try {
      const url = `${this.url}/${id}`;

      return helpers.makeRequest(url, options);
    } catch (e) {
      throw e;
    }
  }

  async create(
    payload: any,
    fetchOptions?: RequestInit
  ): Promise<DenmoralizedResponse> {
    const options = Object.assign(
      {
        method: "POST"
      },
      this.fetchOptions,
      fetchOptions
    );

    try {
      return helpers.makeRequest(this.url, options);
    } catch (e) {
      throw e;
    }
  }

  async update(
    id: ID,
    payload: any,
    fetchOptions?: RequestInit
  ): Promise<DenmoralizedResponse> {
    const options = Object.assign(
      {
        method: "PUT"
      },
      this.fetchOptions,
      fetchOptions
    );

    try {
      const url: string = `${this.url}/${id}`;

      return helpers.makeRequest(url, options);
    } catch (e) {
      throw e;
    }
  }

  delete(id: ID, fetchOptions?: RequestInit): Promise<Response> {
    const options = Object.assign(
      {
        method: "DELETE"
      },
      this.fetchOptions,
      fetchOptions
    );
    const url: string = `${this.url}/${id}`;

    return fetch(url, options);
  }
}
