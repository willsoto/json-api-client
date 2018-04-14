import * as JSONAPI from 'jsonapi-typescript';

import {
  Options,
  DenmoralizedResponse,
  DenmoralizedResponseObject
} from './interfaces';

import { JSONApiModel } from './model';

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
  if (entity === null || !('type' in entity)) {
    return;
  }

  const { id, type } = entity;

  let obj = marshal(entity);

  if (
    'relationships' in entity &&
    entity.relationships !== undefined &&
    included !== undefined
  ) {
    obj = processRelationships(obj, entity.relationships, included);
  }

  return obj;
};

export const processRelationships = function(
  obj: any,
  relationships: JSONAPI.RelationshipsObject,
  included: JSONAPI.Included
): DenmoralizedResponse {
  for (let relationshipName in relationships) {
    const relationship = relationships[relationshipName];

    if (!('data' in relationship) || !relationship.data) {
      continue;
    }

    const { data } = relationship;

    if (Array.isArray(data)) {
      obj[relationshipName] = (data as JSONAPI.ResourceIdentifierObject[]).map(
        (relation) => {
          return createRelationship(relation, included);
        }
      );
    } else {
      obj[relationshipName] = createRelationship(data, included);
    }
  }

  return obj;
};

const createRelationship = function(
  data: JSONAPI.ResourceIdentifierObject,
  included: JSONAPI.Included
) {
  const includedEntity = included.find((inc: JSONAPI.ResourceObject) => {
    return data.id === inc.id && data.type === inc.type;
  });

  if (includedEntity === undefined) {
    return {};
  }

  let entity = marshal(includedEntity);

  if (includedEntity.relationships) {
    entity = processRelationships(
      entity,
      includedEntity.relationships,
      included
    );
  }

  return entity;
};

export const marshal = function(
  entity: JSONAPI.ResourceObject | JSONAPI.ResourceIdentifierObject
): DenmoralizedResponseObject | typeof JSONApiModel {
  const { type } = entity;

  let attributes: JSONAPI.AttributesObject = {};

  if ('attributes' in entity && entity.attributes !== undefined) {
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
