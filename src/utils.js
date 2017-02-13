/* @flow */
import glob from 'glob'
import {parse} from 'babylon'

type GetFileOptions = {
  dir?: string,
  ignore?: string
}
export function getFiles (opts?: GetFileOptions = {}): string[] {
  return glob
    .sync('**/*.js', {
      ignore: opts.ignore || '**/node_modules/**',
      absolute: true,
      cwd: opts.dir || process.cwd()
    })
}

export function parseToAst (code: string): any {
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
