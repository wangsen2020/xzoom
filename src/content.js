// X native photo viewer enhancement. The image is fetched only while a photo preview is open.
(() => {
  if (globalThis.__xzoom) return;
  const labels = {"图片预览，滚轮缩放，拖动查看":"viewer","帖子图片":"photo","图片缩放":"zoom","缩放比例":"scale","正在加载原图…":"loading","缩小":"out","放大":"in","适应窗口":"fit","原始尺寸":"actual","下载原图":"download","重试原图":"retry","原图":"original","预览图":"preview","原图暂不可用，可重试加载":"unavailable"};
  const t = text => globalThis.chrome?.i18n?.getMessage(labels[text]) || text;
  function originalMediaUrl(input) {
    try {
      const url = new URL(input);
      if (url.protocol !== 'https:' || url.hostname !== 'pbs.twimg.com' || url.port || url.username || url.password) return null;
      const match = url.pathname.match(/^\/media\/([\w-]+)(?:\.(jpg|jpeg|png|webp|avif|gif))?(?::(?:orig|large|medium|small|thumb))?$/i);
      if (!match) return null;
      const format = url.searchParams.get('format') || match[2];
      if (format && !/^(jpg|jpeg|png|webp|avif|gif)$/i.test(format)) return null;
      const result = new URL('https://pbs.twimg.com/media/' + match[1]);
      if (format) result.searchParams.set('format', format);
      result.searchParams.set('name', 'orig');
      return result.href;
    } catch { return null; }
  }
  const photoRoute = path => /\/status\/\d+\/photo\/[1-4]\/?$/.test(path);
  const fitScale = (width, height, areaWidth, areaHeight) => Math.min(1, Math.max(1, areaWidth - 24) / width, Math.max(1, areaHeight - 24) / height);
  let active = null, scheduled = 0, destroyed = false;
  const icons = {minus:'M5 12h14',plus:'M5 12h14M12 5v14',fit:'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5',download:'M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4',retry:'M20 7v5h-5M4 17v-5h5M19 12a7 7 0 0 0-12-5M5 12a7 7 0 0 0 12 5'};
  function button(label, icon, action) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'xzoom-photo-zoom-button panzoom-exclude';
    b.dataset.xzoomAction=icon||'actual'; b.setAttribute('aria-label', t(label)); b.setAttribute('data-xzoom-tip', t(label));
    if (icon) b.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icons[icon]}"/></svg>`;
    else b.textContent = '1:1';
    b.addEventListener('click', event => { event.stopPropagation(); action(); }); return b;
  }
  function teardown() {
    const old = active; active = null; if (!old) return;
    old.abort?.abort(); clearTimeout(old.timeout); old.resize.disconnect(); old.panzoom?.destroy(); old.root.remove();
    if (old.hidden.style.visibility === 'hidden') old.hidden.style.setProperty('visibility', old.oldVisibility, old.oldVisibilityPriority);
    if (old.changedPosition && old.frame.style.position === 'relative') old.frame.style.setProperty('position', old.oldPosition, old.oldPositionPriority);
    if (old.objectUrl) URL.revokeObjectURL(old.objectUrl);
  }
  function attach(nativeImage, frame, source) {
    const hidden = nativeImage.parentElement;
    const root = document.createElement('div'); root.className = 'xzoom-photo-zoom'; root.setAttribute('data-xzoom-viewer', '');
    const stage = document.createElement('div'); stage.className = 'xzoom-photo-zoom-stage'; stage.tabIndex = 0;
    stage.setAttribute('role', 'group'); stage.setAttribute('aria-label', t('图片预览，滚轮缩放，拖动查看'));
    const surface = document.createElement('div'); surface.className = 'xzoom-photo-zoom-surface';
    const image = document.createElement('img'); image.className = 'xzoom-photo-zoom-image'; image.alt = nativeImage.alt || t('帖子图片'); image.draggable = false;
    const bar = document.createElement('div'); bar.className = 'xzoom-photo-zoom-toolbar panzoom-exclude'; bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', t('图片缩放'));
    const meter = document.createElement('output'); meter.className = 'xzoom-photo-zoom-percent'; meter.setAttribute('aria-label', t('缩放比例')); meter.textContent = '—';
    const status = document.createElement('span'); status.className = 'xzoom-photo-zoom-status'; status.setAttribute('aria-live', 'polite'); status.textContent = t('正在加载原图…');
    const a = {root,stage,surface,image,bar,nativeImage,frame,hidden,source,original:originalMediaUrl(source),resize:null,panzoom:null,width:0,height:0,fit:1,
      oldVisibility:hidden.style.getPropertyValue('visibility'),oldVisibilityPriority:hidden.style.getPropertyPriority('visibility'),
      oldPosition:frame.style.getPropertyValue('position'),oldPositionPriority:frame.style.getPropertyPriority('position'),changedPosition:getComputedStyle(frame).position==='static'};
    active = a;
    if (a.changedPosition) frame.style.position = 'relative';
    const showScale = () => {
      if (!a.panzoom) return;
      const scale = a.panzoom.getScale(); meter.textContent = Math.round(scale * 100) + '%';
      minus.disabled = scale <= a.fit + .0001; plus.disabled = scale >= 8 - .0001;
    };
    const fit = () => { if (!a.panzoom) return; a.panzoom.setOptions({startScale:a.fit}); a.panzoom.reset({animate:false}); showScale(); };
    const minus = button('缩小','minus',() => { a.panzoom?.zoomOut({animate:false}); showScale(); });
    const plus = button('放大','plus',() => { a.panzoom?.zoomIn({animate:false}); showScale(); });
    const fitButton = button('适应窗口','fit',fit);
    const actual = button('原始尺寸',null,() => { if (!a.panzoom) return; a.panzoom.zoom(1,{animate:false}); a.panzoom.pan(0,Math.max(0,(a.height-stage.clientHeight)/2),{force:true}); showScale(); });
    const download = button('下载原图','download',() => {
      if (!a.blob) return;
      const url = URL.createObjectURL(a.blob), link = document.createElement('a');
      const match = location.pathname.match(/\/status\/(\d+)\/photo\/(\d)/);
      const extension = ({'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/avif':'avif','image/gif':'gif'})[a.blob.type] || 'jpg';
      link.href = url; link.download = `x-${match?.[1] || 'photo'}-${match?.[2] || '1'}.${extension}`;
      link.style.display = 'none'; document.body.append(link); link.click(); link.remove();
      // Keep the download URL alive after a fast photo switch or viewer close.
      setTimeout(() => URL.revokeObjectURL(url), 40000);
    });
    const retry = button('重试原图','retry',() => loadOriginal()); retry.hidden = true;
    for (const b of [minus,plus,fitButton,actual,download]) b.disabled = true;
    bar.append(minus,meter,plus,fitButton,actual,download,status,retry); surface.append(image); stage.append(surface); root.append(stage,bar); frame.append(root);
    function resize() {
      if (!a.panzoom || !stage.clientWidth || !stage.clientHeight) return;
      const oldFit = a.fit, wasFit = Math.abs(a.panzoom.getScale()-oldFit)<.001;
      a.fit = fitScale(a.width,a.height,stage.clientWidth,stage.clientHeight);
      a.panzoom.setOptions({minScale:a.fit,startScale:a.fit}); if (wasFit) fit(); showScale();
    }
    a.resize = new ResizeObserver(resize); a.resize.observe(stage);
    function display(url,width,height) {
      if (active !== a || !root.isConnected || !width || !height) return;
      const ratio = a.panzoom ? a.panzoom.getScale()/a.fit : 1, oldPan = a.panzoom?.getPan(), oldFit = a.fit;
      a.width = width; a.height = height; image.src = url;
      Object.assign(image.style,{width:width+'px',height:height+'px',marginLeft:-width/2+'px',marginTop:-height/2+'px'});
      a.fit = fitScale(width,height,stage.clientWidth,stage.clientHeight);
      hidden.style.visibility = 'hidden';
      if (!a.panzoom) {
        a.panzoom = globalThis.Panzoom(surface,{canvas:true,noBind:true,cursor:'grab',startScale:a.fit,minScale:a.fit,maxScale:8,step:.25,panOnlyWhenZoomed:true});
        surface.addEventListener('panzoomchange',showScale);
      } else {
        a.panzoom.setOptions({minScale:a.fit,startScale:a.fit}); a.panzoom.zoom(Math.min(8,a.fit*ratio),{force:true,animate:false});
        if (oldPan) a.panzoom.pan(oldPan.x*oldFit/a.fit,oldPan.y*oldFit/a.fit,{force:true});
      }
      fitButton.disabled = actual.disabled = false; showScale();
    }
    if (nativeImage.complete && nativeImage.naturalWidth) display(source,nativeImage.naturalWidth,nativeImage.naturalHeight);
    stage.addEventListener('wheel',event => { if (!a.panzoom || event.deltaY===0 && event.deltaX===0) return; event.preventDefault(); event.stopPropagation(); const delta=event.deltaY||event.deltaX;
      // Zoom around the preview center, independent of mouse position.
      (delta<0?a.panzoom.zoomIn:a.panzoom.zoomOut)({animate:false,step:.25/3}); showScale(); },{passive:false});
    const pointers=new Set();
    stage.addEventListener('pointerdown',event=>{if(!a.panzoom||event.pointerType==='mouse'&&event.button!==0)return;event.preventDefault();event.stopPropagation();pointers.add(event.pointerId);stage.setPointerCapture(event.pointerId);a.panzoom.handleDown(event);stage.style.cursor='grabbing';},true);
    stage.addEventListener('pointermove',event=>{if(!pointers.has(event.pointerId))return;event.preventDefault();event.stopPropagation();a.panzoom.handleMove(event);},true);
    const pointerUp=event=>{if(!pointers.delete(event.pointerId))return;event.stopPropagation();a.panzoom?.handleUp(event);if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);stage.style.cursor='grab';};
    stage.addEventListener('pointerup',pointerUp,true);stage.addEventListener('pointercancel',pointerUp,true);stage.addEventListener('lostpointercapture',pointerUp,true);
    stage.addEventListener('click',event => event.stopPropagation());
    stage.addEventListener('dblclick',event => { event.preventDefault(); event.stopPropagation(); if (Math.abs((a.panzoom?.getScale()||0)-a.fit)<.001) actual.click(); else fit(); });
    root.addEventListener('keydown',event => { if (event.ctrlKey || event.metaKey || event.altKey) return; const action=event.key==='+'||event.key==='='?plus:event.key==='-'?minus:event.key==='0'?fitButton:null;if(action){event.preventDefault();event.stopPropagation();action.click();} });
    async function loadOriginal() {
      a.abort?.abort(); const abort = new AbortController(); a.abort = abort; clearTimeout(a.timeout);
      a.timeout = setTimeout(() => abort.abort(),20000); retry.hidden = true; status.textContent = t('正在加载原图…');
      try {
        const requestOptions={credentials:'omit',signal:abort.signal,referrerPolicy:'no-referrer'};
        let response = await fetch(a.original,requestOptions);
        // Some originals retain PNG while their preview was transcoded to JPEG.
        if(response.status===404){const alternative=new URL(a.original);alternative.searchParams.set('format',alternative.searchParams.get('format')==='png'?'jpg':'png');response=await fetch(alternative.href,requestOptions);}
        if (!response.ok) throw Error('HTTP '+response.status);
        const blob = await response.blob(); if (!/^image\/(jpeg|png|webp|avif|gif)$/.test(blob.type)) throw Error('Invalid image');
        const url = URL.createObjectURL(blob), probe = new Image();
        try { probe.src = url; await probe.decode(); if (active!==a || abort.signal.aborted) { URL.revokeObjectURL(url); return; } }
        catch(error) { URL.revokeObjectURL(url); throw error; }
        if (a.objectUrl) URL.revokeObjectURL(a.objectUrl); a.objectUrl = url; a.blob = blob;
        display(url,probe.naturalWidth,probe.naturalHeight); download.disabled = false; status.textContent = t('原图');
        status.title = `${t('原图')} · ${probe.naturalWidth} × ${probe.naturalHeight}`;
      } catch {
        if (active!==a || a.abort!==abort) return;
        if (!a.panzoom && nativeImage.complete && nativeImage.naturalWidth) display(source,nativeImage.naturalWidth,nativeImage.naturalHeight);
        status.textContent = t('预览图'); status.title = t('原图暂不可用，可重试加载'); retry.hidden = false;
      } finally { if(a.abort===abort)clearTimeout(a.timeout); }
    }
    void loadOriginal();
  }
  function refresh() {
    scheduled = 0; if (destroyed) return;
    if (!photoRoute(location.pathname) || !globalThis.chrome?.runtime?.id) { teardown(); return; }
    const images = [...document.querySelectorAll('[role="dialog"][aria-modal="true"] [data-testid="swipe-to-dismiss"] img')];
    const nativeImage = images.filter(img => !img.closest('[data-xzoom-viewer]') && originalMediaUrl(img.currentSrc||img.src))
      .map(img=>{const r=img.getBoundingClientRect();return {img,area:Math.max(0,Math.min(innerWidth,r.right)-Math.max(0,r.left))*Math.max(0,Math.min(innerHeight,r.bottom)-Math.max(0,r.top))};})
      .filter(item=>item.area>0).sort((a,b)=>b.area-a.area)[0]?.img;
    const frame = nativeImage?.closest('[data-testid="swipe-to-dismiss"]'), source = nativeImage?.currentSrc||nativeImage?.src;
    if (active && active.nativeImage===nativeImage && active.source===source && active.root.isConnected) return;
    teardown(); if (nativeImage && frame && typeof globalThis.Panzoom==='function') attach(nativeImage,frame,source);
  }
  function schedule() { if (!scheduled && !destroyed) scheduled = requestAnimationFrame(refresh); }
  function onImageLoad(event){if(event.target?.tagName==='IMG'&&!event.target.closest('[data-xzoom-viewer]')&&photoRoute(location.pathname))schedule();}
  const api = {originalMediaUrl,photoRoute,fitScale,refresh:schedule,destroy(){destroyed=true;cancelAnimationFrame(scheduled);observer?.disconnect();teardown();document.removeEventListener('click',schedule,true);window.removeEventListener('popstate',schedule);window.removeEventListener('resize',schedule);document.removeEventListener('visibilitychange',schedule);document.removeEventListener('load',onImageLoad,true);document.removeEventListener('transitionend',schedule,true);if(globalThis.__xzoom===api)delete globalThis.__xzoom;}};
  globalThis.__xzoom = api;
  if (typeof document==='undefined') return;
  const observer = new MutationObserver(records => { if (records.every(record=>active?.root.contains(record.target))) return;if (photoRoute(location.pathname)||active) schedule(); });
  observer.observe(document,{childList:true,subtree:true,attributes:true,attributeFilter:['src','srcset']});
  document.addEventListener('click',schedule,true);window.addEventListener('popstate',schedule);window.addEventListener('resize',schedule);document.addEventListener('visibilitychange',schedule);document.addEventListener('load',onImageLoad,true);document.addEventListener('transitionend',schedule,true);schedule();
})();
