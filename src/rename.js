/* @flow */
import {parse} from 'babylon'
import traverse from 'babel-traverse'
import path from 'path'
import fs from 'fs'
import glob from 'glob'

const cwd = process.cwd()

type Detected = {
  source: any,
  to: string
}
type Change = {
  path: string,
  result: string
}

export function isRelativeImportPath (importPath: string): boolean {
  return importPath[0] === '.'
}

export function convertToMovedPath (absFilePath: string, toAbsPath: string): string {
  const relPath = path.relative(absFilePath, toAbsPath)
  let relExpr = relPath.substr(1)
  if (relExpr.indexOf('./../') === 0) {
    relExpr = relExpr.replace('./../', '../')
  }
  relExpr = path.dirname(relExpr) + '/' + path.basename(relExpr, '.js')
  return relExpr
}

// TODO: Use it instead of replace
export function replaceRange (text: string, replacer: string, start: number, end: number): string {
  return text.substr(0, start) + replacer + text.substr(end + 1)
}

export function rewriteCode (code: string, changes: Detected[]): string {
  const lines = code.split('\n')
  for (const change of changes) {
    const lineNumber = change.source.loc.start.line - 1
    const line = lines[lineNumber]
    const modifiedLine = line.replace(change.source.value, change.to)
    lines[lineNumber] = modifiedLine
  }
  return lines.join('\n')
}

function getFiles (): string[] {
  const files = glob.sync('**/*.js', {ignore: '**/node_modules/**', cwd: cwd})
  return files
}

function parseToAst (code: string): any {
  return parse(code, {sourceType: 'module',
    plugins: [
      'jsx',
      'flow',
      'decorators',
      'doExpressions',
      'exportExtensions',
      'classProperties',
      'asyncGenerators',
      'objectRestSpread',
      'functionBind',
      'functionSent',
      'dynamicImport'
    ]})
}

export function rename (fromAbsPath: string, toAbsPath: string): Change[] {
  const files = getFiles()
  const changeset = []
  for (const fpath of files) {
    const absFilePath = path.resolve(cwd, fpath)
    const absFileDir = path.dirname(absFilePath)
    const code = fs.readFileSync(absFilePath).toString()
    const ast = parseToAst(code)
    const detectedList: Detected[] = []
    traverse(ast, {
      ImportDeclaration: (n) => {
        const importPath = n.node.source.value
        if (isRelativeImportPath(importPath)) {
          const targetPath = path.resolve(absFileDir, n.node.source.value)
          if (fromAbsPath === targetPath + '.js') {
            const relExpr = convertToMovedPath(absFilePath, toAbsPath)
            if (n.node.source.value !== relExpr) {
              detectedList.push({
                source: n.node.source,
                to: relExpr
              })
            }
          }
        }
      }
    })
    if (detectedList.length > 0) {
      const result = rewriteCode(code, detectedList)
      changeset.push({
        path: absFilePath,
        result: result
      })
    }
  }
  return changeset
}

export function renameFilesToDir (paths: string[], toDir: string): Change[][] {
  return paths.map(p => {
    const base = path.basename(p)
    const dest = path.resolve(toDir, base)
    return rename(p, dest)
  })
}
