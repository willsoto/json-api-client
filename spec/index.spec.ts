import { expect } from "chai";
import * as fetchMock from "fetch-mock";

import { JSONApiClient } from "../src";
import { DenmoralizedResponseObject } from "../src/interfaces";

import { Article, Author, Comment } from "./fixtures";

fetchMock.get(
  "http://example.com/api/articles",
  require("./payloads/articles.json")
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
    const response = await client.query(Article).all();
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
    const articles = await client.query(Article).all();

    (articles as DenmoralizedResponseObject[]).forEach((article) => {
      expect(article).to.be.instanceof(Article);

      article.comments.forEach((comment) => {
        expect(comment).to.be.instanceof(Comment);
      });
    });
  });
});
