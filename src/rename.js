/* @flow */
import traverse from 'babel-traverse'
import path from 'path'
import fs from 'fs'
import { parseToAst } from './utils'

type Rewriter = {
  source: any,
  to: string
}

type RenamingChangeset = {
  path: string,
  result: string
}[]

export function isRelativeImportPath (importPath: string): boolean {
  return importPath[0] === '.'
}

export function convertToMovedPath (fpath: string, destPath: string): string {
  const relPath = path.relative(fpath, destPath)
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

export function rewriteCode (code: string, rewriters: Rewriter[]): string {
  const lines = code.split('\n')
  for (const rewriter of rewriters) {
    const lineNumber = rewriter.source.loc.start.line - 1
    const line = lines[lineNumber]
    const modifiedLine = line.replace(rewriter.source.value, rewriter.to)
    lines[lineNumber] = modifiedLine
  }
  return lines.join('\n')
}

export function rename (fromPath: string, destPath: string, targetFiles: string[]): RenamingChangeset {
  const changeset = []
  for (const fpath of targetFiles) {
    const absFileDir = path.dirname(fpath)
    const code = fs.readFileSync(fpath).toString()
    const ast = parseToAst(code)
    const rewriters: Rewriter[] = []
    traverse(ast, {
      ImportDeclaration: n => {
        const importPath = n.node.source.value
        if (isRelativeImportPath(importPath)) {
          const targetPath = path.resolve(absFileDir, n.node.source.value)
          if (fromPath === targetPath + '.js') {
            const relExpr = convertToMovedPath(fpath, destPath)
            if (n.node.source.value !== relExpr) {
              rewriters.push({
                source: n.node.source,
                to: relExpr
              })
            }
          }
        }
      }
    })
    if (rewriters.length > 0) {
      const result = rewriteCode(code, rewriters)
      changeset.push({
        path: fpath,
        result: result
      })
    }
  }
  return changeset
}
