const j = require('jscodeshift')
// const runner = require('jscodeshift/dist/runner')
// const declarationTransform = require('refactoring-codemods/lib/transformers/import-declaration-transform')
// const relativeTransform = require('refactoring-codemods/lib/transformers/import-relative-transform')
// const specifierTransform = require('refactoring-codemods/lib/transformers/import-specifier-transform')
const path = require('path')
const process = require('process')
const fs = require('fs-extra-promise')

// function move (source, destination) {
//   let ast = recast.parse(source)
// }

async function split (filePath) {
  const fullPath = require.resolve(path.join(process.cwd(), filePath))
  const newFolderPath = fullPath.split('.js').shift()
  const newFolderName = newFolderPath.split('/').pop()
  await fs.ensureDirAsync(newFolderPath)
  const source = await fs.readFileAsync(fullPath, 'utf8')
  const ast = j(source)
  const exprts = ast.find(j.ExportNamedDeclaration)

  // copy exports into new files
  exprts.forEach(async path => {
    const exprt = j(path)
    const fileName = exprt.find(j.Identifier).at(0).nodes()[0].name + '.js'
    const newFile = newFolderPath + '/' + fileName
    await fs.writeFile(newFile, exprt.toSource())
    console.log(`Created: ${newFile}`)
  })

  // replace old exports with re-exports from new files
  exprts.replaceWith(path => {
    const exprt = j(path)
    const name = exprt.find(j.Identifier).at(0).nodes()[0].name
    return `export { ${name} } from './${newFolderName}/${name}'`
  })

  await fs.writeFile(fullPath, ast.toSource())
}

module.exports = { split }
