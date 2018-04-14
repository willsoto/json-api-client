import * as JSONAPI from "jsonapi-typescript";

import {
  Options,
  DenmoralizedResponse,
  DenmoralizedResponseObject
} from "./interfaces";

import { JSONApiModel } from "./model";

const subclasses = new Map<string, Function>();

export const registerSubclass = function(
  type: string,
  cb: (...args: any[]) => any
): void {
  subclasses.set(type, cb);
};

export const denormalize = function(
  response: JSONAPI.DocWithData
): DenmoralizedResponse {
  const { data, included } = response;

  if (Array.isArray(data)) {
    return (data as any).map((entity: any) => {
      return processEntity(entity, included);
    });
  } else {
    return processEntity(data, included);
  }
};

export const processEntity = function(
  entity: JSONAPI.SinglePrimaryData,
  included: JSONAPI.Included | undefined
): any {
  if (entity === null || !("type" in entity)) {
    return;
  }

  const { id, type } = entity;
  const model: any = marshal(entity);

  let relationships: JSONAPI.RelationshipsObject = {};

  if ("relationships" in entity && entity.relationships !== undefined) {
    relationships = entity.relationships;
  }

  if (included !== undefined) {
    processRelationships(model, relationships, included);
  }

  return model;
};

export const processRelationships = function(
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

        return marshal(entity);
      });
    } else if (data !== null) {
      const entity = included.find((inc) => {
        return data.id === inc.id && data.type === inc.type;
      });

      if (entity === undefined) {
        return {};
      }

      model[relationshipName] = marshal(entity);
    }
  }
};

export const marshal = function(
  entity: JSONAPI.ResourceObject | JSONAPI.ResourceIdentifierObject
): DenmoralizedResponseObject | typeof JSONApiModel {
  const { type } = entity;

  let attributes: JSONAPI.AttributesObject = {};

  if ("attributes" in entity && entity.attributes !== undefined) {
    attributes = entity.attributes;
  }

  const cb = subclasses.get(entity.type);

  if (cb) {
    return cb({
      type: type,
      data: {
        id: entity.id,
        ...attributes
      }
    });
  } else {
    return {
      id: entity.id,
      ...attributes
    };
  }
};
