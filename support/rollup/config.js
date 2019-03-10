import fs from 'fs'
import path from 'path'
import typescript from 'rollup-plugin-typescript2'
import builtins from 'rollup-plugin-node-builtins'
import globals from 'rollup-plugin-node-globals'
import json from 'rollup-plugin-json'
import resolve from 'rollup-plugin-node-resolve'

const ROOT_DIR = path.resolve(__dirname, '../..')
const PACKAGES_DIR = path.resolve(ROOT_DIR, 'packages')

const packages = fs.readdirSync(PACKAGES_DIR)

function sortByExternal(p1, p2) {
  const deps1 = {
    ...p1.dependencies,
    ...p1.devDependencies,
    ...p1.peerDependencies,
  }
  const deps2 = {
    ...p2.dependencies,
    ...p2.devDependencies,
    ...p2.peerDependencies,
  }
  if (deps1[p2.name]) return 1
  if (deps2[p1.name]) return -1

  return p1.name > p2.name ? -1 : p1.name < p2.name ? 1 : 0
}

function createConfig(pkg) {
  console.log('createConfig', pkg.name)
  // Remove the @gitbook part
  const pkgShortname = pkg.name.replace(/^\@gitbook\//, '')
  const deps = []
    .concat(pkg.dependencies ? Object.keys(pkg.dependencies) : [])
    .concat(pkg.peerDependencies ? Object.keys(pkg.peerDependencies) : [])

  const pkgDir = path.resolve(PACKAGES_DIR, pkgShortname)
  const input = path.resolve(pkgDir, 'src/index.ts')
  const srcDir = path.dirname(input)

  const plugins = [
    // Allow Rollup to resolve modules from `node_modules`, since it only
    // resolves local modules by default.
    resolve({
      browser: true,
    }),

    // Convert JSON imports to ES6 modules.
    json(),

    // Register Node.js builtins for browserify compatibility.
    builtins(),

    // Compile typescript and JS
    typescript({
      abortOnError: true,
      check: false,
      exclude: ['**/test/'],
      tsconfig: path.join(ROOT_DIR, 'tsconfig.json'),
      tsconfigOverride: {
        compilerOptions: {
          paths: null,
          rootDir: srcDir,
        },
        include: [srcDir],
      },
    }),

    // Register Node.js globals for browserify compatibility.
    globals(),
  ].filter(Boolean)

  return {
    plugins,
    input,
    output: [
      pkg.module && {
        file: path.resolve(pkgDir, pkg.module),
        format: 'es',
        sourcemap: true,
      },
      pkg.main && {
        file: path.resolve(pkgDir, pkg.main),
        format: 'cjs',
        exports: 'named',
        sourcemap: true,
      },
    ].filter(Boolean),
    // We need to explicitly state which modules are external, meaning that
    // they are present at runtime. In the case of non-UMD configs, this means
    // all non-Slate packages.
    external: id => {
      return !!deps.find(dep => dep === id || id.startsWith(`${dep}/`))
    },
  }
}

export default packages
  .filter(name => name === 'slate-edit-table')
  .map(name => require(path.join(PACKAGES_DIR, name, 'package.json')))
  .sort(sortByExternal)
  .map(createConfig)
