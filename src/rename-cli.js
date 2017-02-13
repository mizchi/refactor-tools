/* @flow */
import path from 'path'
import fs from 'fs'
import {rename} from './rename'

// debug property
const dryRun = false

function execRename (fromPath: string, destPath: string) {
  const results = rename(fromPath, destPath)
  for (const r of results) {
    if (dryRun) {
      console.log('rewrite:', r.path)
    } else {
      fs.writeFileSync(r.path, r.result)
    }
  }
  if (dryRun) {
    console.log('rename:', fromPath, 'to', destPath)
  } else {
    fs.renameSync(fromPath, destPath)
  }
}

const cwd = process.cwd()
const destRelPath = process.argv[process.argv.length - 1]
const destPath = path.resolve(cwd, destRelPath)

// Example.
//   refactor-tools-rename a.js b.js mydir
if (fs.existsSync(destPath) && fs.lstatSync(destPath).isDirectory()) {
  const relPaths = process.argv.slice(2, process.argv.length - 1)
  relPaths.map(p => path.resolve(cwd, p)).forEach(fromPath => {
    const destFilePath = path.resolve(destPath, path.basename(fromPath))
    execRename(fromPath, destFilePath)
  })
// Example.
//   refactor-tools-rename a.js b.js
} else {
  // reject: refactor-tools-rename a.js b.js c.js
  if (process.argv.length > 4) {
    throw new Error('refactor-tools-rename: too much arguments')
  }
  const fromPath = path.resolve(cwd, process.argv[2])
  execRename(fromPath, destPath)
}
