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

  const imports = ast.find(j.ImportDeclaration)

  // copy each export into a new file
  exprts.forEach(async exportPath => {
    const exprt = j(exportPath)
    const fileName = exprt.find(j.Identifier).at(0).nodes()[0].name + '.js'
    const newFile = newFolderPath + '/' + fileName
    let newImports

    // find imports used in this export
    exprt.find(j.Identifier).forEach((varPath) => {
      newImports = j(imports.map((path) => {
        const importVars = path.value.specifiers.map((specifier) => specifier.local.name)
        return importVars.includes(varPath.value.name) ? path : null
      }).nodes())
    })

    // update paths of copied import statements
    newImports
      .find(j.Literal)
      .forEach(p => {
        p.value.value = path.join('../', p.value.value)
      })

    // mash used imports and new exports together
    const newSource = [newImports.toSource(), exprt.toSource()].join('\n')

    // write new file
    await fs.writeFile(
      newFile,
      newSource
    )
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
