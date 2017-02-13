/* @flow */
import test from 'ava'
import path from 'path'
import {
  getFiles
} from './utils'

test('getFiles', t => {
  const files = getFiles({dir: path.resolve(__dirname, '../test-fixtures')})
  // console.log(files)
  t.is(files.length, 3)
})
