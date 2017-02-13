/* @flow */
import glob from 'glob'
// import path from 'path'

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
    // .map(p => path.resolve(process.cwd(), p))
}
