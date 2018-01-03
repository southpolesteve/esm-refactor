const assert = require("assert");
const fs = require("fs-extra-promise");
const { moveFile } = require("../index");

describe("moveFile", function() {
  beforeEach(async () => {
    await fs.removeAsync("./test/_fixtures");
    await fs.copyAsync("./test/fixtures", "./test/_fixtures");
  });
  it("creates a new folder and sub files", async function() {
    await moveFile(
      "./test/_fixtures/split.js",
      "./test/_fixtures/splitMoved.js"
    );
    assert(fs.existsSync("./test/_fixtures/splitMoved.js"));
  });
});
