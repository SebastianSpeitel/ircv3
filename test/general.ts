import { expect } from "chai";

describe("ircv3", function () {
  describe("module", function () {
    it("exports anything", async function () {
      const ircv3 = await import("../src");

      expect(ircv3).to.not.be.an("undefined");
    });
  });
});
