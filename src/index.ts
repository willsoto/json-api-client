import * as JSONAPI from "jsonapi-typescript";

import { JSONApiModel } from "./model";

export interface Options {
  baseURL?: string;
  basePath: string;
}

export interface DenmoralizedResponseObject {
  id: string | number;
  [key: string]: any;
}

export type DenmoralizedResponse =
  | DenmoralizedResponseObject
  | DenmoralizedResponseObject[];

export class JSONApiClient {
  private endpoint: string = "/";
  private __subclasses__: {
    [name: string]: typeof JSONApiModel;
  } = {};

  constructor(private options: Options) {}

  register<T extends JSONApiModel>(model: typeof JSONApiModel): JSONApiClient {
    this.__subclasses__[model.__type] = model;
    return this;
  }

  query<T extends JSONApiModel>(model: typeof JSONApiModel): JSONApiClient {
    this.endpoint = model.__endpoint;
    return this;
  }

  get url(): string {
    const { baseURL = location.origin, basePath } = this.options;

    return baseURL + basePath + this.endpoint;
  }

  async get(id: string | number): Promise<DenmoralizedResponse> {
    try {
      const response = await fetch(`${this.url}/${id}`);
      const json: JSONAPI.DocWithData = await response.json();

      return this.denormalize(json);
    } catch (e) {
      throw e;
    }
  }

  denormalize(response: JSONAPI.DocWithData): DenmoralizedResponse {
    const { data, included } = response;

    if (Array.isArray(data)) {
      return (data as any).map((entity: any) => {
        return this.processEntity(entity, included);
      });
    } else {
      return this.processEntity(data, included);
    }
  }

  processEntity(
    entity: JSONAPI.SinglePrimaryData,
    included: JSONAPI.Included | undefined
  ): any {
    if (entity === null || !("type" in entity)) {
      return;
    }

    const { id, type } = entity;
    const model: any = this.marshal(entity);

    let relationships: JSONAPI.RelationshipsObject = {};

    if ("relationships" in entity && entity.relationships !== undefined) {
      relationships = entity.relationships;
    }

    if (included !== undefined) {
      this.processRelationships(model, relationships, included);
    }

    return model;
  }

  processRelationships(
    model: any,
    relationships: JSONAPI.RelationshipsObject,
    included: JSONAPI.Included
  ) {
    for (let relationshipName in relationships) {
      const relationship = relationships[relationshipName];

      if (!("data" in relationship)) {
        continue;
      }

      const { data } = relationship;

      if (Array.isArray(data)) {
        model[relationshipName] = (data as any).map((relation: any) => {
          const entity = included.find((inc) => {
            return relation.id === inc.id && relation.type === inc.type;
          });

          if (entity === undefined) {
            return {};
          }

          return this.marshal(entity);
        });
      } else if (data !== null) {
        const entity = included.find((inc) => {
          return data.id === inc.id && data.type === inc.type;
        });

        if (entity === undefined) {
          return {};
        }

        model[relationshipName] = this.marshal(entity);
      }
    }
  }

  marshal(
    entity: JSONAPI.ResourceObject | JSONAPI.ResourceIdentifierObject
  ): any {
    const { type } = entity;

    let attributes: JSONAPI.AttributesObject = {};

    if ("attributes" in entity && entity.attributes !== undefined) {
      attributes = entity.attributes;
    }

    if (type in this.__subclasses__) {
      const Model: any = this.__subclasses__[entity.type];

      return new Model({
        id: entity.id,
        ...attributes
      });
    } else {
      return {
        id: entity.id,
        ...attributes
      };
    }
  }
}
