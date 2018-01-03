# esm-refactor

[![Build Status](https://travis-ci.org/southpolesteve/esm-refactor.svg?branch=master)](https://travis-ci.org/southpolesteve/esm-refactor)

Refactoring projects with a lot of ES modules is hard. This tool makes it easier. It is not perfect, but it will do 80% of the work for you. In most cases the linter will help with the last 20%.


```
esm-refactor [command]

Commands:
  esm-refactor split <file>                 split one file into a folder with files for each export
  esm-refactor move-file <source> <target>  move a file with ES modules

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
