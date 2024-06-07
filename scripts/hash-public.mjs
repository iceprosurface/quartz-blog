import fs from "fs"
import klaw from 'klaw';
import crypto from 'crypto';
import path from "path"
import { load } from 'cheerio';
const __dirname = new URL('.', import.meta.url).pathname;
// 搜索所有的 js、css 文件
const files = klaw(path.resolve(__dirname, '../public'))
const resources = new Map();
const filePaths = new Set();
for await (const file of files) {
  if (!file.stats.isDirectory()) {
    filePaths.add(file);
  }
}
function resolveLink(src, filePath) {
  // 绝对路径
  if (src.startsWith('/')) {
    return path.resolve(__dirname, '../public', src.slice(1));
  }
  // 相对路径
  return path.resolve(path.dirname(filePath), src);
}
// 处理 js、css 文件
for(const file of filePaths) {
  if ((file.path.endsWith('.js') || file.path.endsWith('.css')) && !file.path.includes('xlwk')) {
    const content = fs.readFileSync(file.path, 'utf8');
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    const shortHash = hash.substring(0, 7);
    resources.set(file.path, shortHash);
    // 重命名文件
    fs.renameSync(file.path, file.path.replace(/(\.js|\.css)$/, `-${shortHash}$1`));
  }
}
// 处理 html
for(const file of filePaths) {
  if (file.path.endsWith('.html')) {
    const content = fs.readFileSync(file.path, 'utf8');
    const $ = load(content);
    // js
    $('script').each((index, element) => {
      const src = $(element).attr('src');
      if (src) {
        const hash = resources.get(resolveLink(src, file.path));
        if (hash) {
          $(element).attr('src', src.replace(/\.js$/, `-${hash}.js`));
        }
      }
    });
    // css
    $('link').each((index, element) => {
      const href = $(element).attr('href');
      if (href) {
        const hash = resources.get(resolveLink(href, file.path));
        if (hash) {
          $(element).attr('href', href.replace(/\.css$/, `-${hash}.css`));
        }
      }
    });
    // meta
    $('[data-js]').each((index, element) => {
      const src = $(element).attr('content');
      if (src) {
        const hash = resources.get(resolveLink(src, file.path));
        if (hash) {
          $(element).attr('content', src.replace(/\.js$/, `-${hash}.js`));
        }
      }
    })
    // 重新写入文件
    fs.writeFileSync(file.path, $.html());
  }
}
