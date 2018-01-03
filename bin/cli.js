#!/usr/bin/env node
/* eslint-disable no-unused-expressions */
const { split, moveFile } = require("../index");

require("yargs")
  .command(
    "split <file>",
    "split one file into a folder with files for each export",
    yargs => {
      yargs.positional("file", {
        describe: "the file to split",
        type: "string"
      });
    },
    argv => {
      return split(argv.file);
    }
  )
  .command(
    "move-file <source> <target>",
    "move a file with ES modules",
    yargs => {
      yargs.positional("source", {
        describe: "the file to move",
        type: "string"
      });
      yargs.positional("target", {
        describe: "the destination",
        type: "string"
      });
    },
    argv => {
      return moveFile(argv.source, argv.target);
    }
  ).argv;
