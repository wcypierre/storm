// Shim to provide a default export for filesize, which ngx-filesize expects.
// filesize v11+ uses named exports only; this bridges the gap.
export { filesize as default, filesize, partial } from 'filesize';
