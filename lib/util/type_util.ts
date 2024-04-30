export function isBufferEncoding(str: string): str is BufferEncoding {
  return (
    str === 'ascii' ||
    str === 'utf8' ||
    str === 'utf-8' ||
    str === 'utf16le' ||
    str === 'utf-16le' ||
    str === 'ucs2' ||
    str === 'ucs-2' ||
    str === 'base64' ||
    str === 'base64url' ||
    str === 'latin1' ||
    str === 'binary' ||
    str === 'hex'
  );
}
