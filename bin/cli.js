#!/usr/bin/env node
const { split, moveFile } = require('../index')

require('yargs')
  .command('split <file>', 'split a file into seperate exports', (yargs) => {
    yargs.positional('file', {
      describe: 'the file to split',
      type: 'string'
    })
  }, (argv) => {
    return split(argv.file)
  })
  .command('move-file <source> <target>', 'move a file', (yargs) => {
    yargs.positional('source', {
      describe: 'the file to move',
      type: 'string'
    })
    yargs.positional('target', {
      describe: 'the destination',
      type: 'string'
    })
  }, (argv) => {
    return moveFile(argv.source, argv.target)
  })
  .argv
