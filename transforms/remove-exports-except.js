module.exports = function (file, api, options) {
  if (!options.except) { throw new Error('Must provide an export name to keep') }
  const j = api.jscodeshift
  const root = j(file.source)

  root.find(j.ExportNamedDeclaration).forEach(path => {
    const name = j(path).find(j.Identifier).nodes()[0].name
    if (name !== options.except) {
      j(path).remove()
    }
  })

  return root.toSource()
}
