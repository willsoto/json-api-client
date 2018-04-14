import { expect } from 'chai';

import * as helpers from '../src/helpers';
import { describe } from 'mocha';

describe('helpers', function() {
  describe('.denormalize', function() {
    it('correctly converts a JSON API response into a usable format', function() {
      expect(
        helpers.denormalize({
          data: {
            id: '1',
            type: 'authors',
            attributes: {}
          },
          included: []
        })
      ).to.eql({
        id: '1'
      });
    });
  });

  describe('.processEntity', function() {
    it('converts a single JSON API item', function() {
      expect(
        helpers.processEntity(
          {
            id: '1',
            type: 'authors',
            attributes: {}
          },
          []
        )
      ).to.eql({
        id: '1'
      });
    });
  });

  describe('.processRelationships', function() {});

  describe('.marshal', function() {
    it('correctly denormalizes responses with attributes', function() {
      expect(
        helpers.marshal({
          id: '1',
          type: 'books',
          attributes: {
            title: 'Ulysses'
          }
        })
      ).to.eql({
        id: '1',
        title: 'Ulysses'
      });
    });

    it('correctly denormalizes responses with empty attributes', function() {
      expect(
        helpers.marshal({
          id: '1',
          type: 'books',
          attributes: {}
        })
      ).to.eql({
        id: '1'
      });
    });

    it('correctly denormalizes responses without attributes', function() {
      expect(
        helpers.marshal({
          id: '1',
          type: 'books'
        })
      ).to.eql({
        id: '1'
      });
    });
  });
});
