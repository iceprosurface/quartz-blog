function loadScript(url: string) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = () => {
      resolve();
    };
    script.onerror = () => {
      reject(new Error(`Failed to load script: ${url}`));
    };
    document.head.appendChild(script);
  });
}
async function init() {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/twikoo/1.6.36/twikoo.min.js');
  (window as any).twikoo?.init({
    envId: 'https://comment.iceprosurface.com',
    el: '#tcomment',
    path: (window as any).__comment_id__
  });
}
init();

document.addEventListener('nav', () => {
  init();
})

