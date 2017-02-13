# refactor-tools

WIP

Refactoring tools based on babylon.

```
npm install -g mizchi/refactor-tools
```

## Command

```sh
# Move file and rewrite import path by others
$ refactor-tools-rename a.js src/a.js
```

## TODO

- [x] `import '<path>'`
- [x] `import lib from '<path>'`
- [ ] `require('<path>')`
- [x] Rename file
- [x] Rename files to dir
- [x] Rename dir name
- [ ] Rename variables in file scope
- [ ] Rename exported symbols
- [ ] Documentation
- [ ] Test with fs mock
- [ ] Atom Plugin
