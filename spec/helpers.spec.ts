import { describe } from 'mocha';
import { expect } from 'chai';
import * as glob from 'glob';

import * as helpers from '../src/helpers';

describe('helpers', function() {
  describe('.denormalize', function() {
    const payloads = glob.sync('./payloads/*.json', {
      cwd: __dirname
    });
    const results = glob.sync('./results/*.json', {
      cwd: __dirname
    });

    payloads.forEach(function(payload, index) {
      it(`works with ${payload}`, function() {
        const data = require(payload);
        const result = require(results[index]);

        expect(helpers.denormalize(data)).to.eql(result);
      });
    });
  });

  describe('.processEntity', function() {
    it('converts a single JSON API item', function() {
      const payload = require('./payloads/authors-1.json');
      const result = helpers.processEntity(payload.data, []);

      const expected = {
        id: '1',
        books: [{}],
        date_of_birth: '1977-08-21',
        date_of_death: '2009-09-14',
        name: 'Madge Mohr DVM 2',
        photos: []
      };

      expect(result).to.eql(expected);
    });

    it('converts a single JSON API item with relationships', function() {
      const entity = {
        id: '1',
        type: 'authors',
        attributes: {},
        relationships: {
          articles: {
            data: [
              {
                type: 'articles',
                id: '2'
              }
            ]
          }
        }
      };
      const included = [
        {
          type: 'articles',
          id: '2',
          attributes: {
            title: 'Check this out'
          }
        }
      ];
      const result = helpers.processEntity(entity, included);

      const expected = {
        id: '1',
        articles: [
          {
            id: '2',
            title: 'Check this out'
          }
        ]
      };

      expect(result).to.eql(expected);
    });

    it('recurses through relationships if they are present', function() {
      const entity = {
        id: '1',
        type: 'authors',
        attributes: {
          name: 'James Joyce'
        },
        relationships: {
          articles: {
            data: [
              {
                type: 'articles',
                id: '2'
              }
            ]
          }
        }
      };
      const included = [
        {
          type: 'articles',
          id: '2',
          attributes: {
            title: 'Check this out'
          },
          relationships: {
            comments: {
              data: [
                {
                  type: 'comments',
                  id: '3'
                }
              ]
            }
          }
        },
        {
          type: 'comments',
          id: '3',
          attributes: {
            text: 'best article ever'
          }
        }
      ];
      const result = helpers.processEntity(entity, included);

      const expected = {
        id: '1',
        name: 'James Joyce',
        articles: [
          {
            id: '2',
            title: 'Check this out',
            comments: [
              {
                id: '3',
                text: 'best article ever'
              }
            ]
          }
        ]
      };

      expect(result).to.eql(expected);
    });
  });

  describe('.processRelationships', function() {
    it('correctly adds relationships to the entity', function() {
      const obj = {
        id: '1',
        title: 'JSON API paints my bikeshed!'
      };
      const relationships = {
        author: {
          links: {
            self: 'http://example.com/articles/1/relationships/author',
            related: 'http://example.com/articles/1/author'
          },
          data: {
            type: 'people',
            id: '9'
          }
        },
        comments: {
          links: {
            self: 'http://example.com/articles/1/relationships/comments',
            related: 'http://example.com/articles/1/comments'
          },
          data: [
            {
              type: 'comments',
              id: '5'
            },
            {
              type: 'comments',
              id: '12'
            }
          ]
        }
      };
      const included = [
        {
          type: 'people',
          id: '9',
          attributes: {
            'first-name': 'Dan',
            'last-name': 'Gebhardt',
            twitter: 'dgeb'
          },
          links: {
            self: 'http://example.com/people/9'
          }
        },
        {
          type: 'comments',
          id: '5',
          attributes: {
            body: 'First!'
          },
          relationships: {
            author: {
              data: {
                type: 'people',
                id: '2'
              }
            }
          },
          links: {
            self: 'http://example.com/comments/5'
          }
        },
        {
          type: 'comments',
          id: '12',
          attributes: {
            body: 'I like XML better'
          },
          relationships: {
            author: {
              data: {
                type: 'people',
                id: '9'
              }
            }
          },
          links: {
            self: 'http://example.com/comments/12'
          }
        }
      ];

      const result = helpers.processRelationships(obj, relationships, included);
      const expected = {
        id: '1',
        title: 'JSON API paints my bikeshed!',
        author: {
          id: '9',
          'first-name': 'Dan',
          'last-name': 'Gebhardt',
          twitter: 'dgeb'
        },
        comments: [
          {
            id: '5',
            body: 'First!',
            author: {}
          },
          {
            id: '12',
            body: 'I like XML better',
            author: {
              id: '9',
              'first-name': 'Dan',
              'last-name': 'Gebhardt',
              twitter: 'dgeb'
            }
          }
        ]
      };

      expect(result).to.eql(expected);
    });
  });

  describe('.marshal', function() {
    it('correctly denormalizes responses with attributes', function() {
      const entity = {
        id: '1',
        type: 'books',
        attributes: {
          title: 'Ulysses'
        }
      };
      const expected = {
        id: '1',
        title: 'Ulysses'
      };

      expect(helpers.marshal(entity)).to.eql(expected);
    });

    it('correctly denormalizes responses with empty attributes', function() {
      const result = helpers.marshal({
        id: '1',
        type: 'books',
        attributes: {}
      });
      const expected = {
        id: '1'
      };

      expect(result).to.eql(expected);
    });

    it('correctly denormalizes responses without attributes', function() {
      const result = helpers.marshal({
        id: '1',
        type: 'books'
      });
      const expected = {
        id: '1'
      };

      expect(result).to.eql(expected);
    });
  });
});
