import { deflateSync } from 'node:zlib'

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(bytes: Buffer): number {
  let crc = 0xffffffff
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

/**
 * A square RGBA PNG: a solid square in the middle, transparent around it unless
 * `opaque`. Enough for the launcher logo checks, with no image library.
 */
export function logoPng({ size = 200, opaque = false }: { size?: number; opaque?: boolean } = {}): Buffer {
  const inset = Math.floor(size / 4)
  const rows: Buffer[] = []
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4) // filter byte 0, then RGBA pixels
    for (let x = 0; x < size; x++) {
      const inside = x >= inset && x < size - inset && y >= inset && y < size - inset
      const pixel = inside ? [47, 91, 234, 255] : opaque ? [255, 255, 255, 255] : [0, 0, 0, 0]
      Buffer.from(pixel).copy(row, 1 + x * 4)
    }
    rows.push(row)
  }
  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0)
  header.writeUInt32BE(size, 4)
  header.writeUInt8(8, 8) // bit depth
  header.writeUInt8(6, 9) // colour type: RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(Buffer.concat(rows))),
    chunk('IEND', Buffer.alloc(0)),
  ])
}
