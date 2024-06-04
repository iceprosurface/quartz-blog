import archiver from 'archiver';
import { URL } from 'url';
import { resolve } from 'path';
import fs from 'fs';
const __dirname = new URL('.', import.meta.url).pathname;
const output = fs.createWriteStream(resolve(__dirname, '../public.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 }
});

archive.directory(resolve(__dirname, '../public'), false);
archive.pipe(output);
archive.finalize();