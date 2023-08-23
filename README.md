# Narrative Engine

Implementing ideas from https://www.gamedeveloper.com/author/ron-newcomb

With help of old-school "planner" AI I originally implemented for Inform 7: https://github.com/i7/extensions/blob/master/Ron%20Newcomb/Problem-Solving%20Characters.i7x

`tsc  c*.ts i*.ts p*.ts n*.ts g*.ts  --lib es2020,dom  --module None  --outFile build.js  --watch`

Pull up index.html, view F12 console

## With Rollup

if rollup is installed globally `npm i rollup --global`

then ES6 import/export can be used

```
tsc g1.ts  --lib es2020,dom   --module esnext
rollup g1.js --file bundle.js
```

Or use `--watch` on both commands in 2 different windows

`tsc g1.ts  --lib es2020,dom   --module esnext   --watch`

`rollup g1.js --file bundle.js   --watch`
