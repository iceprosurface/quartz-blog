import klaw from 'klaw';
import * as path from 'path'
import { URL } from 'url';
import fs from 'fs';
import Fontmin from 'fontmin';
const __dirname = new URL('.', import.meta.url).pathname;
import crypto from 'crypto';

const generateHash = (content) => {
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  return hash.substring(0, 7);
};
// 先读取 font 列表
const fontTextFilePath =  './font-list.txt';
const textText = fs.existsSync(fontTextFilePath) ? fs.readFileSync(path.resolve(__dirname,fontTextFilePath), 'utf8') : '';
const textSet = new Set(textText.split(''));
const dir = path.resolve(__dirname, "../content");
const files = klaw(dir);
for await (const file of files) {
  if (!file.stats.isDirectory()) {
    const content = fs.readFileSync(file.path, 'utf8');
    for(let i = 0; i < content.length; i++) {
      textSet.add(content[i]);
    }
  }
}
const allText = Array.from(textSet).sort().join('');
const hash = generateHash(allText);

const fontSrc = path.resolve(__dirname,`./LXGWWenKai-Light-${hash}.ttf`)
// 先 cp 一份
fs.copyFileSync(path.resolve(__dirname,'./LXGWWenKai-Light.ttf'), fontSrc)
const xlwkPath = './quartz/static/xlwk';
if (fs.existsSync(xlwkPath)) {
  fs.rmSync(xlwkPath, {
    recursive: true
  })
}

const fontmin = new Fontmin()
  .src(fontSrc)
  .use(Fontmin.glyph({
    text: allText,
    hinting: false 
  }))
  .use(Fontmin.ttf2woff({
    deflate: true           // deflate woff. default = false
  }))
  .use(Fontmin.ttf2woff2())
  .use(Fontmin.ttf2eot())
  .use(Fontmin.css({
    base64: false,          
    iconPrefix: 'xlwk-lite', 
    fontFamily: 'xlwk-lite',  
    asFileName: true,
    local: true,
    asFileName: false, 
  }))
  .dest('./quartz/static/xlwk');
fontmin.run(function (err, files) {
  fs.rmSync(fontSrc);
  fs.writeFileSync(path.resolve(__dirname, '../quartz/hash.ts'), `
export const xlwkHash = "${hash}";
`);
  fs.writeFileSync(
    path.resolve(__dirname, fontTextFilePath),
    Array.from(textSet)
    // 按照 char code 排序
    .sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0))
    .join(''), 
    {
      encoding: 'utf8'
    }
  );
  if (err) {
      throw err;
  }
});