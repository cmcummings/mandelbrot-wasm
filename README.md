# Mandelbrot (WASM)
Mandelbrot visualization using WebAssembly for major calculations.

## Requirements
- Requires Node, NPM, Rust, Cargo.
- Requires [wasm-pack](https://github.com/rustwasm/wasm-pack) for building Rust to WebAssembly.

## Installation
Install NPM packages:
```
npm install
```
Build the Rust WebAssembly package found in `rs/`:
```
npm run wasm
```

## Usage
### Development
```
npm run dev
```
This command builds the WASM package and then runs the Vite development server. Any edits to WASM don't trigger Vite's hot reload, so they must be rebuilt which can be done by running the command again.

### Build
```
npm run build
```
This command builds the WASM package and bundles the application (via Vite) to `dist/.
