import axios from 'axios';
import * as axiosTypes from 'axios';
import * as JSONAPI from 'jsonapi-typescript';

import {
  ICallbackArgs,
  ID,
  IDenmoralizedResponse,
  IDenmoralizedResponseObject,
  IOptions,
  Model
} from './interfaces';
import { JSONApiModel } from './model';

export class JSONApiClient {
  public axios: axiosTypes.AxiosInstance;

  private endpoint: string = '/';
  private __include: string[] = [];
  private models = new Map<string, (args: ICallbackArgs) => any>();

  constructor(private options: IOptions) {
    const config = Object.assign(
      {},
      {
        headers: {
          'content-type': 'application/vnd.api+json'
        }
      },
      this.options.axiosConfig
    );

    this.axios = axios.create(config);

    this.axios.interceptors.response.use(
      (response) => {
        response.data = this.denormalize(response.data);

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
    this.models.set(type, cb);
    return this;
  }

  public query(model: Model): JSONApiClient {
    this.endpoint = model.__endpoint;
    return this;
  }

  public include(includes: string | string[]): JSONApiClient {
    if (Array.isArray(includes)) {
      this.__include = includes;
    } else {
      this.__include = [includes];
    }

    return this;
  }

  public all(
    config?: axiosTypes.AxiosRequestConfig
  ): Promise<axiosTypes.AxiosResponse> {
    const options = {
      ...this.requestConfig,
      ...config
    };

    return this.axios.get(this.endpoint, options);
  }

  public get(
    id: ID,
    config?: axiosTypes.AxiosRequestConfig
  ): Promise<axiosTypes.AxiosResponse> {
    const url = `${this.endpoint}/${id}`;
    const options = {
      ...this.requestConfig,
      ...config
    };

    return this.axios.get(url, options);
  }

  public create(
    payload: any,
    config?: axiosTypes.AxiosRequestConfig
  ): Promise<axiosTypes.AxiosResponse> {
    const options = {
      ...this.requestConfig,
      ...config
    };

    return this.axios.post(this.endpoint, payload, options);
  }

  public update(
    id: ID,
    data: any,
    config?: axiosTypes.AxiosRequestConfig
  ): Promise<axiosTypes.AxiosResponse> {
    const url: string = `${this.endpoint}/${id}`;
    const options = {
      ...this.requestConfig,
      ...config
    };

    return this.axios.patch(url, data, options);
  }

  public delete(
    id: ID,
    config?: axiosTypes.AxiosRequestConfig
  ): Promise<axiosTypes.AxiosResponse> {
    const url: string = `${this.endpoint}/${id}`;
    const options = {
      ...this.requestConfig,
      ...config
    };

    return this.axios.delete(url, options);
  }

  get params(): any {
    const params: any = {};

    if (this.__include.length > 0) {
      params.include = this.__include.join(',');
    }

    return params;
  }

  get requestConfig(): axiosTypes.AxiosRequestConfig {
    return {
      params: this.params
    };
  }

  protected denormalize(response: JSONAPI.DocWithData): IDenmoralizedResponse {
    const { data, included } = response;

    if (Array.isArray(data)) {
      return (data as any).map((entity: any) => {
        return this.processEntity(entity, included);
      });
    } else {
      return this.processEntity(data, included);
    }
  }

  protected processEntity(
    entity: JSONAPI.SinglePrimaryData,
    included: JSONAPI.Included | undefined
  ): any {
    if (entity === null || !('type' in entity)) {
      return;
    }

    const { id, type } = entity;

    let obj = this.marshal(entity);

    if (
      'relationships' in entity &&
      entity.relationships !== undefined &&
      included !== undefined
    ) {
      obj = this.processRelationships(obj, entity.relationships, included);
    }

    return obj;
  }

  protected createRelationship(
    data: JSONAPI.ResourceIdentifierObject,
    included: JSONAPI.Included
  ) {
    const includedEntity = included.find((inc: JSONAPI.ResourceObject) => {
      return data.id === inc.id && data.type === inc.type;
    });

    if (includedEntity === undefined) {
      return {};
    }

    let entity = this.marshal(includedEntity);

    if (includedEntity.relationships) {
      entity = this.processRelationships(
        entity,
        includedEntity.relationships,
        included
      );
    }

    return entity;
  }

  protected marshal(
    entity: JSONAPI.ResourceObject | JSONAPI.ResourceIdentifierObject
  ): IDenmoralizedResponseObject | typeof JSONApiModel {
    const { type } = entity;

    let attributes: JSONAPI.AttributesObject = {};

    if ('attributes' in entity && entity.attributes !== undefined) {
      attributes = entity.attributes;
    }

    const cb = this.models.get(entity.type);

    if (cb) {
      return cb({
        data: {
          id: entity.id,
          ...attributes
        },
        type
      });
    } else {
      return {
        id: entity.id,
        ...attributes
      };
    }
  }

  protected processRelationships(
    obj: any,
    relationships: JSONAPI.RelationshipsObject,
    included: JSONAPI.Included
  ): IDenmoralizedResponse {
    for (const relationshipName in relationships) {
      if (!relationships.hasOwnProperty(relationshipName)) {
        continue;
      }

      const relationship = relationships[relationshipName];

      if (!('data' in relationship) || !relationship.data) {
        continue;
      }

      const { data } = relationship;

      if (Array.isArray(data)) {
        obj[
          relationshipName
        ] = (data as JSONAPI.ResourceIdentifierObject[]).map((relation) => {
          return this.createRelationship(relation, included);
        });
      } else {
        obj[relationshipName] = this.createRelationship(data, included);
      }
    }

    return obj;
  }
}
