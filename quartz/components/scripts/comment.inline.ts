import { loadScript } from "./util";

async function init() {
  await Promise.all([
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/twikoo/1.6.36/twikoo.min.js'),
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js")
      .then(() => loadScript("https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js")),
  ]);
  document.getElementById("tcomment")?.addEventListener('click', (event) => {
    event.stopPropagation();
    event.preventDefault();
    return false
  });
  (window as any).twikoo?.init({
    envId: 'https://comment.iceprosurface.com',
    el: '#tcomment',
    path: (window as any).__comment_id__
  });
}
init();

document.addEventListener('nav', (event) => {
  init();
})

