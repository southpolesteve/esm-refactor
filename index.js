const j = require('jscodeshift')
const runner = require('jscodeshift/dist/runner')
const path = require('path')
const process = require('process')
const fs = require('fs-extra-promise')
const ora = require('ora')

process.on('unhandledRejection', (reason, p) => {
  console.log(reason)
  process.exit(1)
})

async function moveFile (source, target) {
  const projectRoot = process.cwd()
  const sourceFullPath = require.resolve(path.join(process.cwd(), source))

  const spinner = ora(`${source} -> ${target}`).start()
  await fs.moveAsync(source, target)
  spinner.succeed()

  const targetFullPath = require.resolve(path.join(process.cwd(), target))

  // Update file relative imports
  spinner.text = `Updating relative imports for ${target}`
  spinner.start()
  await runner.run(
    require.resolve('refactoring-codemods/lib/transformers/import-relative-transform'),
    [ targetFullPath ],
    {
      prevFilePath: sourceFullPath,
      nextFilePath: targetFullPath,
      runInBand: true,
      silent: true,
      printOptions: {
        quote: 'single'
      }
    })
  spinner.succeed()

  // update all other files in the project
  spinner.text = 'Updating other project files. This could take a few minutes...'
  spinner.start()
  await runner.run(
    require.resolve('refactoring-codemods/lib/transformers/import-declaration-transform'),
    [ projectRoot ],
    {
      prevFilePath: sourceFullPath,
      nextFilePath: targetFullPath,
      runInBand: false,
      silent: true,
      extensions: 'js',
      ignorePattern: 'node_modules|dist|.git',
      printOptions: {
        quote: 'single'
      }
    })
  spinner.succeed()
}

async function split (filePath) {
  const fullPath = require.resolve(path.join(process.cwd(), filePath))
  const newFolderPath = fullPath.split('.js').shift()
  const newFolderName = newFolderPath.split('/').pop()
  await fs.ensureDirAsync(newFolderPath)
  const source = await fs.readFileAsync(fullPath, 'utf8')

  const ast = j(source)
  const exportNames = []
  const createdModules = []
  const exportPaths = ast.find(j.ExportNamedDeclaration)

  const spinner = ora(`Finding all exports`).start()
  // Get all exports and replace with re-export statement
  exportPaths.forEach(path => {
    const name = j(path).find(j.Identifier).nodes()[0].name
    exportNames.push(name)
    j(path).replaceWith(`export { ${name} } from './${newFolderName}/${name}'`)
  })
  spinner.succeed()

  spinner.text = `Creating new files`
  spinner.start()
  // Copy source as is to new files for each export
  await Promise.all(exportNames.map(name => {
    const file = newFolderPath + '/' + name + '.js'
    createdModules.push({ file, name })
    return fs.writeFile(file, source)
  }))
  spinner.succeed()

  spinner.text = `Rewriting original file to export new modules`
  spinner.start()
  // Write source back to original file
  await fs.writeFile(fullPath, ast.toSource())
  spinner.succeed()

  spinner.text = `Cleaning up new module files`
  spinner.start()
  // Remove all exports from modules except for the single named export
  for (let module of createdModules) {
    await runner.run(
      require.resolve('./transforms/remove-exports-except'),
      [ module.file ],
      { except: module.name, runInBand: true, silent: true })
  }

  // Remove unused imports in new modules
  await runner.run(
    require.resolve('./transforms/remove-unused-imports'),
    [ ...createdModules.map(m => m.file), fullPath ],
    { runInBand: true, silent: true })
  spinner.succeed()

  spinner.text = `Rewrite relative paths in new files`
  spinner.start()
  // Update all new module file relative imports
  for (let module of createdModules) {
    await runner.run(
      require.resolve('refactoring-codemods/lib/transformers/import-relative-transform'),
      [ module.file ],
      {
        prevFilePath: fullPath,
        nextFilePath: module.file,
        runInBand: true,
        silent: true,
        printOptions: {
          quote: 'single'
        }
      })
  }
  spinner.succeed()

  // TODO remove unused declerations
}

module.exports = { split, moveFile }
