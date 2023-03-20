# Mandelbrot (WASM)
Mandelbrot visualization using WASM for major calculations.

## Requirements
Requires Node and Rust.
Install Node dependencies:
```
npm install
```
Build the Rust WASM package in `rs/`:
```
npm run wasm
```

## Usage
### Development
Builds WASM, then runs the Vite development server.
```
npm run dev
```
Note: Any edits to WASM don't trigger Vite's hot reload, so they must be rebuilt which can be done by running the command again.

### Build
Builds WASM and bundles the application (via Vite).
`npm run build`
