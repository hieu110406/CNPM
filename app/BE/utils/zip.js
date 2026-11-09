
const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) {
        c = (c & 1)
            ? (0xedb88320 ^ (c >>> 1))
            : (c >>> 1);
    }
    return c >>> 0;
});

function crc32(buffer) {
    let c = 0xffffffff;

    for (const b of buffer) {
        c = crcTable[(c ^ b) & 255] ^ (c >>> 8);
    }

    return (c ^ 0xffffffff) >>> 0;
}

export function createZip(files) {
    const local = [];
    const central = [];
    let offset = 0;

    for (const { name, data } of files) {
        const filename = Buffer.from(name, 'utf8');
        const content = Buffer.isBuffer(data)
            ? data
            : Buffer.from(data);

        const crc = crc32(content);

        const head = Buffer.alloc(30);
        head.writeUInt32LE(0x04034b50, 0);
        head.writeUInt16LE(20, 4);
        head.writeUInt16LE(0x0800, 6);
        head.writeUInt32LE(crc, 14);
        head.writeUInt32LE(content.length, 18);
        head.writeUInt32LE(content.length, 22);
        head.writeUInt16LE(filename.length, 26);

        local.push(head, filename, content);

        const directory = Buffer.alloc(46);
        directory.writeUInt32LE(0x02014b50, 0);
        directory.writeUInt16LE(20, 4);
        directory.writeUInt16LE(20, 6);
        directory.writeUInt16LE(0x0800, 8);
        directory.writeUInt32LE(crc, 16);
        directory.writeUInt32LE(content.length, 20);
        directory.writeUInt32LE(content.length, 24);
        directory.writeUInt16LE(filename.length, 28);
        directory.writeUInt32LE(offset, 42);

        central.push(directory, filename);

        offset += head.length
            + filename.length
            + content.length;
    }

    const centralLength = central.reduce(
        (n, b) => n + b.length,
        0
    );

    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(files.length, 8);
    end.writeUInt16LE(files.length, 10);
    end.writeUInt32LE(centralLength, 12);
    end.writeUInt32LE(offset, 16);

    return Buffer.concat([...local, ...central, end]);
}
