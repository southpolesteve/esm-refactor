#!/usr/bin/env node
const { split } = require('../index')

require('yargs')
  .command('split <file>', 'split a file into seperate exports', (yargs) => {
    yargs.positional('file', {
      describe: 'the file to split',
      type: 'string'
    })
  }, (argv) => {
    return split(argv.file)
  })
  .command('move <file>', 'move a file', (yargs) => {
    yargs.positional('file', {
      describe: 'the file to split',
      type: 'string'
    })
  }, (argv) => {
    throw new Error('THIS DOES NOT WORK YET')
  })
  .argv
