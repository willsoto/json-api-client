import { expect } from "chai";
import "isomorphic-fetch";
import * as fetchMock from "fetch-mock";

import { JSONApiClient, DenmoralizedResponseObject } from "../src";

import { Article, Author, Comment } from "./fixtures";

fetchMock.get("http://example.com/api/articles/1", {
  links: {
    self: "http://example.com/articles",
    next: "http://example.com/articles?page[offset]=2",
    last: "http://example.com/articles?page[offset]=10"
  },
  data: [
    {
      type: "articles",
      id: "1",
      attributes: {
        title: "JSON API paints my bikeshed!"
      },
      relationships: {
        author: {
          links: {
            self: "http://example.com/articles/1/relationships/author",
            related: "http://example.com/articles/1/author"
          },
          data: { type: "people", id: "9" }
        },
        comments: {
          links: {
            self: "http://example.com/articles/1/relationships/comments",
            related: "http://example.com/articles/1/comments"
          },
          data: [{ type: "comments", id: "5" }, { type: "comments", id: "12" }]
        }
      },
      links: {
        self: "http://example.com/articles/1"
      }
    }
  ],
  included: [
    {
      type: "people",
      id: "9",
      attributes: {
        "first-name": "Dan",
        "last-name": "Gebhardt",
        twitter: "dgeb"
      },
      links: {
        self: "http://example.com/people/9"
      }
    },
    {
      type: "comments",
      id: "5",
      attributes: {
        body: "First!"
      },
      relationships: {
        author: {
          data: { type: "people", id: "2" }
        }
      },
      links: {
        self: "http://example.com/comments/5"
      }
    },
    {
      type: "comments",
      id: "12",
      attributes: {
        body: "I like XML better"
      },
      relationships: {
        author: {
          data: { type: "people", id: "9" }
        }
      },
      links: {
        self: "http://example.com/comments/12"
      }
    }
  ]
});

describe("JSONApiClient", function() {
  let client: JSONApiClient;

  beforeEach(function() {
    fetchMock.reset();

    client = new JSONApiClient({
      basePath: "/api"
    });

    client
      .register(Author)
      .register(Article)
      .register(Comment);
  });

  it("works", async function() {
    const response = await client.query(Article).get(1);
    const cloned = JSON.parse(JSON.stringify(response));

    expect(cloned).to.eql([
      {
        id: "1",
        title: "JSON API paints my bikeshed!",
        author: {
          id: "9",
          "first-name": "Dan",
          "last-name": "Gebhardt",
          twitter: "dgeb"
        },
        comments: [
          {
            id: "5",
            body: "First!"
          },
          {
            id: "12",
            body: "I like XML better"
          }
        ]
      }
    ]);
  });

  it("correctly assigns classes if they are present", async function() {
    const articles = await client.query(Article).get(1);

    (articles as DenmoralizedResponseObject[]).forEach((article) => {
      expect(article).to.be.instanceof(Article);

      article.comments.forEach((comment) => {
        expect(comment).to.be.instanceof(Comment);
      });
    });
  });
});
