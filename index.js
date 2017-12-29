const j = require('jscodeshift')
const runner = require('jscodeshift/dist/runner')
const path = require('path')
const process = require('process')
const fs = require('fs-extra-promise')

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

  // Get all exports and replace with re-export statement
  exportPaths.forEach(path => {
    const name = j(path).find(j.Identifier).nodes()[0].name
    exportNames.push(name)
    j(path).replaceWith(`export { ${name} } from './${newFolderName}/${name}'`)
  })

  // Copy source as is to new files for each export
  await Promise.all(exportNames.map(name => {
    const file = newFolderPath + '/' + name + '.js'
    createdModules.push({ file, name })
    return fs.writeFile(file, source)
  }))

  // Write source back to original file
  await fs.writeFile(fullPath, ast.toSource())

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
}

module.exports = { split }
