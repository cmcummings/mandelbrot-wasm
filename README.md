# Mandelbrot (WASM)
Mandelbrot visualization using WASM for major calculations.

## Installation
Install NPM packages:
```
npm install
```
Build the Rust WASM package found in `rs/`:
```
npm run wasm
```

## Usage
### Development
```
npm run dev
```
This command builds the WASM and then runs the Vite development server. Any edits to WASM don't trigger Vite's hot reload, so they must be rebuilt which can be done by running the command again.

### Build
```
npm run build
```
This command builds WASM and bundles the application (via Vite).
