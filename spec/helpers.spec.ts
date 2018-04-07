import { expect } from "chai";

import * as helpers from "../src/helpers";

describe("#marshal", function() {
  it("correctly denormalizes responses with attributes", function() {
    expect(
      helpers.marshal({
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
      helpers.marshal({
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
      helpers.marshal({
        id: "1",
        type: "books"
      })
    ).to.eql({
      id: "1"
    });
  });
});
