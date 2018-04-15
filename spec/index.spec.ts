import { expect } from 'chai';
import { describe } from 'mocha';
import * as glob from 'glob';
import * as moxios from 'moxios';

import { JSONApiClient } from '../src';
import { IDenmoralizedResponseObject } from '../src/interfaces';

import { Article, Author, Comment } from './models';

function respondWith(response) {
  return new Promise((resolve, reject) => {
    moxios.wait(() => {
      moxios.requests
        .mostRecent()
        .respondWith({
          response,
          status: 200
        })
        .then(resolve, reject);
    });
  });
}

describe('JSONApiClient', function() {
  beforeEach(function() {
    this.client = new JSONApiClient({
      axiosConfig: {
        baseURL: '/api'
      }
    });

    moxios.install(this.client.axios);

    moxios.stubRequest('/api/articles', {
      response: require('./payloads/articles.json'),
      status: 200
    });
  });

  afterEach(function() {
    moxios.uninstall(this.client.axios);
  });

  describe('end-to-end', function() {
    beforeEach(function() {
      this.client
        .register(Author.__type, function(...args: any[]) {
          return new Author(...args);
        })
        .register(Article.__type, function(...args: any[]) {
          return new Article(...args);
        })
        .register(Comment.__type, function(...args: any[]) {
          return new Comment(...args);
        });
    });

    it('works', async function() {
      const response = await this.client.query(Article).all();
      const cloned = JSON.parse(JSON.stringify(response.data));

      await respondWith(require('./payloads/articles.json'));

      expect(cloned).to.eql([
        {
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
        }
      ]);
    });

    it('correctly assigns classes if they are present', async function() {
      const response = await this.client.query(Article).all();

      await respondWith(require('./payloads/articles.json'));

      (response.data as IDenmoralizedResponseObject[]).forEach((article) => {
        expect(article).to.be.instanceof(Article);

        article.comments.forEach((comment) => {
          expect(comment).to.be.instanceof(Comment);
        });
      });
    });
  });

  describe('#query', function() {
    it('correctly sets the endpoint', function() {
      const query = this.client.query({
        __endpoint: '/authors'
      });

      expect(query.endpoint).to.eql('/authors');
    });
  });

  describe('#include', function() {
    it('correctly sets the related resources (as string)', function() {
      const query = this.client
        .query({
          __endpoint: '/authors'
        })
        .include('books');

      expect(query.__include).to.eql(['books']);
    });

    it('correctly sets the related resources (as array)', function() {
      const query = this.client
        .query({
          __endpoint: '/authors'
        })
        .include(['books', 'posts.comments']);

      expect(query.__include).to.eql(['books', 'posts.comments']);
    });
  });

  describe('.params', function() {
    it('returns an empty object if there are no params', function() {
      expect(this.client.params).to.eql({});
    });

    it('returns related resources if they are included', function() {
      const query = this.client
        .query({
          __endpoint: '/authors'
        })
        .include(['books', 'posts.comments']);

      expect(query.params).to.eql({
        include: 'books,posts.comments'
      });
    });
  });

  describe('.requestConfig', function() {
    it('returns an empty object if there are no params', function() {
      expect(this.client.requestConfig).to.eql({
        params: {}
      });
    });

    it('returns related resources if they are included', function() {
      const query = this.client
        .query({
          __endpoint: '/authors'
        })
        .include(['books', 'posts.comments']);

      expect(query.requestConfig).to.eql({
        params: {
          include: 'books,posts.comments'
        }
      });
    });
  });

  describe('#denormalize', function() {
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

        expect(this.client.denormalize(data)).to.eql(result);
      });
    });
  });

  describe('#processEntity', function() {
    it('converts a single JSON API item', function() {
      const payload = require('./payloads/authors-1.json');
      const result = this.client.processEntity(payload.data, []);

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
      const result = this.client.processEntity(entity, included);

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
      const result = this.client.processEntity(entity, included);

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

  describe('#processRelationships', function() {
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

      const result = this.client.processRelationships(
        obj,
        relationships,
        included
      );
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

  describe('#marshal', function() {
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

      expect(this.client.marshal(entity)).to.eql(expected);
    });

    it('correctly denormalizes responses with empty attributes', function() {
      const result = this.client.marshal({
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
      const result = this.client.marshal({
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
