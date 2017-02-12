/* @flow */
const path = require('path')
const fs = require('fs')
const rename = require('../lib/rename').default

const cwd = process.cwd()
const fromPath = process.argv[2]
const toPath = process.argv[3]
const fromAbsPath = path.resolve(cwd, fromPath)
const toAbsPath = path.resolve(cwd, toPath)

const results = rename(fromAbsPath, toAbsPath)
for (const r of results) {
  fs.writeFileSync(r.path, r.result)
}
fs.renameSync(fromAbsPath, toAbsPath)
