const assert = require('assert')
const fs = require('fs-extra-promise')
const { split } = require('../index')

describe('split', function () {
  beforeEach(async () => {
    await fs.removeAsync('./test/_fixtures')
    await fs.copyAsync('./test/fixtures', './test/_fixtures')
  })
  it('creates a new folder and sub files', async function () {
    await split('./test/_fixtures/split')
    assert(fs.existsSync('./test/_fixtures/split'))
    assert(fs.existsSync('./test/_fixtures/split/hello.js'))
    assert(fs.existsSync('./test/_fixtures/split/world.js'))
    assert(fs.existsSync('./test/_fixtures/split/one.js'))
  })
})
