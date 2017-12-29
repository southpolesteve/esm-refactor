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
  const newFolder = fullPath.split('.js').shift()
  await fs.ensureDirAsync(newFolder)
  const source = await fs.readFileAsync(fullPath, 'utf8')
  const ast = j(source)
  const exprts = ast.find(j.ExportNamedDeclaration)

  // copy exports into new files
  exprts.forEach(async path => {
    const exprt = j(path)
    const fileName = exprt.find(j.Identifier).at(0).nodes()[0].name + '.js'
    await fs.writeFile(newFolder + '/' + fileName, exprt.toSource())
    console.log(`Created: ${newFolder + '/' + fileName}`)
    exprt.replaceWith('test')
  })

  // replace old exports with re-exports from new files
  exprts.replaceWith(path => {
    const exprt = j(path)
    const name = exprt.find(j.Identifier).at(0).nodes()[0].name
    return `export { ${name} } from './${name}'`
  })

  await fs.writeFile(fullPath, ast.toSource())
}

module.exports = { split }
