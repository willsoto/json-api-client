import { expect } from "chai";
import * as fetchMock from "fetch-mock";

import { JSONApiClient } from "../src";
import { DenmoralizedResponseObject } from "../src/interfaces";

import { Article, Author, Comment } from "./fixtures";

fetchMock.get(
  "http://example.com/api/articles/1",
  require("./payloads/articles-1.json")
);

describe("JSONApiClient", function() {
  let client: JSONApiClient;

  beforeEach(function() {
    fetchMock.reset();

    client = new JSONApiClient({
      basePath: "/api"
    });

    client
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

  describe("#marshal", function() {
    it("correctly denormalizes responses with attributes", function() {
      expect(
        client.marshal({
          id: "1",
          type: "books",
          attributes: {
            title: "Ulysses"
          }
        })
      ).to.eql({
        id: "1",
        title: "Ulysses"
      });
    });

    it("correctly denormalizes responses with empty attributes", function() {
      expect(
        client.marshal({
          id: "1",
          type: "books",
          attributes: {}
        })
      ).to.eql({
        id: "1"
      });
    });

    it("correctly denormalizes responses without attributes", function() {
      expect(
        client.marshal({
          id: "1",
          type: "books"
        })
      ).to.eql({
        id: "1"
      });
    });
  });
});
