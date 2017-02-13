/* @flow */
import test from 'ava'
import {
  rename,
  isRelativeImportPath,
  convertToMovedPath,
  replaceRange,
  rewriteCode
} from './rename'
import {
  getFiles
} from './utils'

test('isRelativeImportPath', t => {
  const isRelative = isRelativeImportPath('./aaa')
  t.is(isRelative, true)
})

test('convertToMovedPath', t => {
  t.is(convertToMovedPath('./aaa', './bbb'), './bbb')
  t.is(convertToMovedPath('./aaa', './foo/bbb'), './foo/bbb')
  t.is(convertToMovedPath('./aaa/bbb', './bbb'), '../bbb')
})

test('replaceRange', t => {
  t.is(replaceRange('aabbcc', 'dd', 2, 3), 'aaddcc')
  t.is(replaceRange("'./a'", './b', 1, 3), "'./b'")
})

test('rewriteCode', t => {
  const code = "import a from './a'"
  t.is(rewriteCode(code, []), code)

  const changes = [{
    source: {
      value: './a',
      loc: {
        start: {
          line: 1,
          column: 14
        },
        end: {
          line: 1,
          column: 19
        }
      }
    },
    to: './b'
  }]
  t.is(rewriteCode(code, changes), "import a from './b'")
})

import path from 'path'
test('rename', t => {
  const a = path.resolve(__dirname, '../test-fixtures/foo.js')
  const b = path.resolve(__dirname, '../test-fixtures/bar.js')
  // const changeset = rename(a, b, getFiles(path.resolve(__dirname, '../test-fixtures')))
  const changeset = rename(a, b, getFiles())
  t.is(changeset[0].path, path.resolve(__dirname, '../test-fixtures/hah/xxx.js'))
  t.is(changeset[0].result, "/* @flow */\nimport '../bar'\n")
  t.is(changeset[1].path, path.resolve(__dirname, '../test-fixtures/index.js'))
  t.is(changeset[1].result, "/* @flow */\nimport foo from './bar'\nfoo()\n")
})
