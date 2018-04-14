import { expect } from "chai";
import * as moxios from "moxios";

import { JSONApiClient } from "../src";
import { DenmoralizedResponseObject } from "../src/interfaces";

import { Article, Author, Comment } from "./fixtures";

function respondWith(response) {
  return new Promise((resolve, reject) => {
    moxios.wait(() => {
      moxios.requests
        .mostRecent()
        .respondWith({
          status: 200,
          response
        })
        .then(resolve, reject);
    });
  });
}

describe("JSONApiClient", function() {
  let client: JSONApiClient;

  beforeEach(function() {
    client = new JSONApiClient({
      axiosOptions: {
        baseURL: "/api"
      }
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

    moxios.install(client.axios);

    moxios.stubRequest("/api/articles", {
      status: 200,
      response: require("./payloads/articles.json")
    });
  });

  afterEach(function() {
    moxios.uninstall(client.axios);
  });

  it("works", async function() {
    const response = await client.query(Article).all();
    const cloned = JSON.parse(JSON.stringify(response.data));

    await respondWith(require("./payloads/articles.json"));

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
    const response = await client.query(Article).all();

    await respondWith(require("./payloads/articles.json"));

    (response.data as DenmoralizedResponseObject[]).forEach((article) => {
      expect(article).to.be.instanceof(Article);

      article.comments.forEach((comment) => {
        expect(comment).to.be.instanceof(Comment);
      });
    });
  });
});
