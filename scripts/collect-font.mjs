import klaw from 'klaw';
import * as path from 'path'
import { URL } from 'url';
import fs from 'fs';
import Fontmin from 'fontmin';
const __dirname = new URL('.', import.meta.url).pathname;

const textSet = new Set();
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
const allText = Array.from(textSet).join('');
console.log(allText);
const fontmin = new Fontmin()
  .src(path.resolve(__dirname,'./LXGWWenKai-Light.ttf'))
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
    iconPrefix: 'blwk-lite', 
    fontFamily: 'blwk-lite',  
    asFileName: false,     
    local: true            
  }))
  .dest('./quartz/static/blwk');
fontmin.run(function (err, files) {
  if (err) {
      throw err;
  }
});