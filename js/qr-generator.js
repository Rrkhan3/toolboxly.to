(()=>{
const root=$('#tool-root');if(!root)return;
qrcode.stringToBytes=qrcode.stringToBytesFuncs['UTF-8']; /* proper Unicode (incl. Nepali) support */
const err=m=>{throw new Error(m)};
const need=(s,m)=>{if(!String(s??'').trim())err(m)};
const esc=s=>String(s??'').replace(/([\\;,:])/g,'\\$1'); /* vCard/Wi-Fi field escaping */
const escN=s=>String(s??'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n');

const TYPES=[
 ['text','Text'],['url','URL'],['email','Email'],['phone','Phone'],['sms','SMS'],
 ['wifi','Wi-Fi'],['vcard','vCard / Contact'],['image','Image'],
];
const FIELDS={
 text:[{id:'t',label:'Text',type:'textarea',rows:5,placeholder:'Enter text to generate QR code'}],
 url:[{id:'u',label:'URL',placeholder:'https://example.com'}],
 email:[{id:'e',label:'Email Address',placeholder:'name@example.com'},{id:'sub',label:'Subject (optional)'},{id:'msg',label:'Message (optional)',type:'textarea',rows:4}],
 phone:[{id:'p',label:'Phone Number',placeholder:'+977 98XXXXXXXX'}],
 sms:[{id:'p',label:'Phone Number',placeholder:'+977 98XXXXXXXX'},{id:'msg',label:'Message',type:'textarea',rows:4}],
 wifi:[{id:'ssid',label:'Network Name (SSID)'},{id:'pass',label:'Password'},{id:'sec',label:'Security',type:'select',options:[['WPA','WPA/WPA2'],['WEP','WEP'],['nopass','None (open network)']],value:'WPA'}],
 vcard:[{id:'first',label:'First Name'},{id:'last',label:'Last Name'},{id:'org',label:'Organization'},{id:'title',label:'Job Title'},{id:'phone',label:'Phone'},{id:'email',label:'Email'},{id:'site',label:'Website'},{id:'addr',label:'Address'},{id:'city',label:'City'},{id:'country',label:'Country'}],
 image:[{id:'file',label:'Choose an image (max 5 MB — JPEG, PNG, WebP or GIF)',type:'file',accept:'image/jpeg,image/png,image/webp,image/gif'},{id:'imgurl',label:'…or an Image URL',placeholder:'https://example.com/photo.jpg'}],
};
const MAXQR=1800; /* safe byte budget for a scannable QR at level M */
const MAX_UPLOAD=5*1024*1024; /* 5 MB upload limit */
const ACCEPTED_TYPES=new Set(['image/jpeg','image/png','image/webp','image/gif']);
const MAX_QR_DIM=320; /* max dimension when optimizing for QR payload */
const isEmail=s=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
const isURLish=s=>/^[a-z][a-z0-9+.-]*:\/\//i.test(s)||/^[\w-]+(\.[\w-]+)+([/?#].*)?$/i.test(s);
const normURL=s=>/^https?:\/\//i.test(s)?s:'https://'+s;

function payloadFor(type,v){
 switch(type){
  case 'text': need(v.t,'Please enter some text.'); return v.t;
  case 'url': { need(v.u,'Please enter a URL.'); const s=v.u.trim(); if(!isURLish(s))err('Please enter a valid URL, for example https://example.com.'); return normURL(s); }
  case 'email': { need(v.e,'Please enter an email address.'); if(!isEmail(v.e.trim()))err('Please enter a valid email address.');
    const q=[]; if(v.sub)q.push('subject='+encodeURIComponent(v.sub)); if(v.msg)q.push('body='+encodeURIComponent(v.msg));
    return 'mailto:'+encodeURIComponent(v.e.trim())+(q.length?'?'+q.join('&'):''); }
  case 'phone': { need(v.p,'Please enter a phone number.'); const d=v.p.trim(); if(!/^\+?[0-9()\-.\s]{5,20}$/.test(d))err('Please enter a valid phone number.'); return 'tel:'+d.replace(/[()\-.\s]/g,''); }
  case 'sms': { need(v.p,'Please enter a phone number.'); const d=v.p.trim(); if(!/^\+?[0-9()\-.\s]{5,20}$/.test(d))err('Please enter a valid phone number.');
    return 'SMSTO:'+d.replace(/[()\-.\s]/g,'')+':'+(v.msg||''); }
  case 'wifi': { need(v.ssid,'Please enter the network name (SSID).'); const sec=v.sec==='nopass'?'nopass':v.sec;
    if(sec!=='nopass')need(v.pass,'Please enter the Wi-Fi password, or choose "None" for an open network.');
    return `WIFI:T:${sec};S:${esc(v.ssid)};P:${sec==='nopass'?'':esc(v.pass)};;`; }
  case 'vcard': { if(!v.first.trim()&&!v.last.trim())err('Please enter at least a first or last name.');
    const L=['BEGIN:VCARD','VERSION:3.0',`N:${escN(v.last)};${escN(v.first)}`,`FN:${escN((v.first+' '+v.last).trim())}`];
    if(v.org)L.push(`ORG:${escN(v.org)}`); if(v.title)L.push(`TITLE:${escN(v.title)}`); if(v.phone)L.push(`TEL:${escN(v.phone)}`);
    if(v.email){if(!isEmail(v.email.trim()))err('Please enter a valid contact email address.');L.push(`EMAIL:${escN(v.email)}`)}
    if(v.site)L.push(`URL:${escN(v.site)}`);
    if(v.addr||v.city||v.country)L.push(`ADR:;;${escN(v.addr)};${escN(v.city)};;;${escN(v.country)}`);
    L.push('END:VCARD'); return L.join('\n'); }
  case 'image': {
   if(v.file){
    return v.file.then(dataUrl=>{
     if(dataUrl.length<=MAXQR) return dataUrl;
     /* try browser-side optimization */
     return optimizeForQR(dataUrl).then(opt=>{
      if(opt && opt.length<=MAXQR) return opt;
      err('This image is too detailed to fit directly inside a QR code. Try a smaller image or use an Image URL.');
     });
    });
   }
   need(v.imgurl,'Please choose an image file, or enter an Image URL.');
   const s=v.imgurl.trim(); if(!isURLish(s))err('Please enter a valid image URL.'); return normURL(s);
  }
 }
}
const readFile=f=>new Promise((res,rej)=>{
 if(!f) return rej(new Error('Please choose an image file.'));
 if(!ACCEPTED_TYPES.has(f.type) && !f.type.startsWith('image/')) return rej(new Error('Please choose a JPEG, PNG, WebP or GIF image.'));
 if(f.size > MAX_UPLOAD) return rej(new Error('Image is too large. Please upload an image smaller than 5 MB.'));
 if(f.size === 0) return rej(new Error('The selected file is empty. Please choose a valid image.'));
 const r=new FileReader();
 r.onload=()=>res(r.result);
 r.onerror=()=>rej(new Error('This image could not be read. The file may be corrupted.'));
 r.readAsDataURL(f);
});
/** Create a smaller data-URL copy suitable for QR embedding (canvas resize + JPEG compress). */
function optimizeForQR(dataUrl){
 /* Progressive resize + compress for Image→QR.
    MAXQR is a hard data-URL character budget — never bypassed.
    Bounded attempts try smaller sizes and lower quality until one fits. */
 return new Promise((resolve)=>{
  try{
   const img=new Image();
   img.onload=()=>{
    try{
     const ow=img.naturalWidth||img.width, oh=img.naturalHeight||img.height;
     if(!ow||!oh){ resolve(null); return; }

     const SRC_CAP=1024;
     let sw=ow, sh=oh;
     if(Math.max(sw,sh)>SRC_CAP){
      const s=SRC_CAP/Math.max(sw,sh);
      sw=Math.max(1,Math.round(sw*s)); sh=Math.max(1,Math.round(sh*s));
     }
     const src=document.createElement('canvas');
     src.width=sw; src.height=sh;
     const sctx=src.getContext('2d');
     if(!sctx){ resolve(null); return; }
     sctx.drawImage(img,0,0,sw,sh);

     let hasAlpha=false;
     try{
      const sample=sctx.getImageData(0,0,Math.min(sw,48),Math.min(sh,48)).data;
      for(let i=3;i<sample.length;i+=4){ if(sample[i]<250){ hasAlpha=true; break; } }
     }catch(e){}

     const canWebP=(()=>{ try{
      return document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp')===0;
     }catch(e){ return false; } })();

     /* 8 progressive attempts: smaller + lower quality until payload fits */
     const attempts=[];
     const push=(dim,type,q)=>{ attempts.push({dim,type,q}); };
     /* Start moderate, then aggressively shrink — order matters */
     if(canWebP) push(96,'image/webp',0.5);
     push(96,'image/jpeg',0.45);
     if(canWebP) push(72,'image/webp',0.4);
     push(72,'image/jpeg',0.35);
     push(56,'image/jpeg',0.3);
     push(48,'image/jpeg',0.25);
     push(40,'image/jpeg',0.2);
     push(32,'image/jpeg',0.15);
     /* Optional late PNG try for simple transparent icons only */
     if(hasAlpha) push(40,'image/png',null);

     const MAX_ATTEMPTS=8;
     let tries=0;
     for(const step of attempts){
      if(tries>=MAX_ATTEMPTS) break;
      const scale=Math.min(1, step.dim/Math.max(sw,sh));
      const w=Math.max(1,Math.round(sw*scale)), h=Math.max(1,Math.round(sh*scale));
      if(w>512||h>512) continue;
      const cv=document.createElement('canvas');
      cv.width=w; cv.height=h;
      const ctx=cv.getContext('2d');
      if(!ctx){ cv.width=cv.height=0; continue; }
      ctx.fillStyle='#ffffff';
      ctx.fillRect(0,0,w,h);
      ctx.drawImage(src,0,0,w,h);
      tries++;
      let out='';
      try{
       out=step.q==null ? cv.toDataURL(step.type) : cv.toDataURL(step.type, step.q);
      }catch(e){ out=''; }
      cv.width=cv.height=0;
      if(!out || out.length>MAXQR || out.indexOf('data:image/')!==0) continue;
      if(step.type==='image/webp' && out.indexOf('data:image/webp')!==0) continue;
      src.width=src.height=0;
      resolve(out); return;
     }
     src.width=src.height=0;
     resolve(null);
    }catch(e){ resolve(null); }
   };
   img.onerror=()=>resolve(null);
   img.src=dataUrl;
  }catch(e){ resolve(null); }
 });
}

function build(){
 const state={type:'text'};
 const typeSel=h('div',{class:'qr-types',role:'radiogroup','aria-label':'QR code type'},TYPES.map(([k,l])=>h('button',{type:'button',class:'chip qr-type'+(k==='text'?' active':''),'aria-pressed':String(k==='text'),onclick:()=>selectType(k)},l)));
 const fieldWrap=h('div',{class:'tool-form'});
 const size=h('select',{id:'qsize'},[128,256,320,512].map(n=>h('option',{value:n,selected:n===256?'':false},n+' px')));
 const ecl=h('select',{id:'qecl'},[['L','L — small, less recovery'],['M','M — balanced (recommended)'],['Q','Q — better recovery'],['H','H — best recovery, denser']].map(([v,l])=>h('option',{value:v,selected:v==='M'?'':false},l)));
 const fg=h('input',{id:'qfg',type:'color',value:'#111827'}),bg=h('input',{id:'qbg',type:'color',value:'#ffffff'});
 const margin=h('input',{id:'qmargin',type:'range',min:'0',max:'8',value:'4'});
 const contrastMsg=h('p',{class:'note',role:'status'});
 const opts=h('div',{class:'tool-form qr-opts'},
  h('div',{class:'field'},h('label',{for:'qsize'},'QR Size'),size),
  h('div',{class:'field'},h('label',{for:'qecl'},'Error Correction'),ecl),
  h('div',{class:'field'},h('label',{for:'qfg'},'Foreground Color'),fg),
  h('div',{class:'field'},h('label',{for:'qbg'},'Background Color'),bg),
  h('div',{class:'field'},h('label',{for:'qmargin'},'Margin / Quiet Zone'),margin),
 );
 const genBtn=h('button',{type:'button',class:'btn'},'Generate QR');
 const resetBtn=h('button',{type:'button',class:'btn secondary'},'Reset');
 const status=h('span',{class:'status',role:'status'});
 const out=h('div',{class:'result qr-result','aria-live':'polite'});
 const left=h('div',{class:'qr-left'},h('h2',{class:'sr-only',style:'position:absolute;left:-9999px'},'QR type and details'),typeSel,fieldWrap,h('h3',{},'Customize'),opts,contrastMsg,h('div',{class:'row'},genBtn,resetBtn,status));
 const right=h('div',{class:'qr-right'},out);
 root.replaceChildren(h('div',{class:'qr-grid'},left,right));

 const contrastRatio=(a,b)=>{const L=c=>{const[r,g,bl]=[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*r+.7152*g+.0722*bl};
  const l1=L(a)+.05,l2=L(b)+.05;return l1>l2?l1/l2:l2/l1};
 const checkContrast=()=>{const c=contrastRatio(fg.value.slice(1),bg.value.slice(1));
  contrastMsg.textContent=c<3?'Warning: these colors are too close in contrast and this QR code may not scan reliably.':''};
 [fg,bg].forEach(i=>i.addEventListener('input',checkContrast));

 let els={},lastPayload='',lastURL=null;
 function selectType(k){state.type=k;$$('.qr-type',typeSel).forEach(b=>{const on=b.textContent===TYPES.find(t=>t[0]===k)[1];b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
  els={};fieldWrap.replaceChildren();
  FIELDS[k].forEach(f=>{let i;
   if(f.type==='select')i=h('select',{id:'qr-'+f.id},f.options.map(([v,l])=>h('option',{value:v,selected:v===f.value?'':false},l)));
   else if(f.type==='textarea')i=h('textarea',{id:'qr-'+f.id,rows:f.rows||4,placeholder:f.placeholder||''});
   else i=h('input',{id:'qr-'+f.id,type:f.type||'text',placeholder:f.placeholder||'',accept:f.accept});
   els[f.id]=i;fieldWrap.append(h('div',{class:'field'},h('label',{for:'qr-'+f.id},f.label),i));
   if(f.type==='file'){const pv=h('img',{class:'preview',alt:'Selected image preview',hidden:'',style:'max-height:140px;margin-top:.5rem'});
    const info=h('p',{class:'muted file-info',style:'font-size:.85rem;margin:.25rem 0 0'});
    i.addEventListener('change',()=>{const file=i.files[0];if(pv.src)URL.revokeObjectURL(pv.src);info.textContent='';if(!file){pv.hidden=true;return}
     const kb=(file.size/1024).toFixed(1); const mb=(file.size/1024/1024).toFixed(2);
     if(file.size>MAX_UPLOAD){info.textContent='Image is too large ('+mb+' MB). Limit is 5 MB.';info.style.color='var(--danger,#b91c1c)';pv.hidden=true;i.value='';return}
     if(!ACCEPTED_TYPES.has(file.type)&&!file.type.startsWith('image/')){info.textContent='Unsupported type. Use JPEG, PNG, WebP or GIF.';info.style.color='var(--danger,#b91c1c)';pv.hidden=true;i.value='';return}
     info.textContent=file.name+' — '+(file.size>=1024*1024?mb+' MB':kb+' KB')+' (max 5 MB)';info.style.color='';
     pv.src=URL.createObjectURL(file);pv.hidden=false});
    fieldWrap.append(info,pv);}
  });
  clear();
 }
 function val(k){const f=FIELDS[k];const v={};f.forEach(x=>{const i=els[x.id];v[x.id]=x.type==='file'?(i.files[0]?readFile(i.files[0]):null):i.value});return v}
 function clear(){out.replaceChildren(h('p',{class:'muted'},'Fill in the details and press "Generate QR" to see your code here.'));lastPayload='';if(lastURL){URL.revokeObjectURL(lastURL);lastURL=null}}
 async function generate(){
  status.textContent='';let payload;
  try{ payload=await payloadFor(state.type,val(state.type)); if(payload&&payload.then)payload=await payload; if(typeof payload!=='string'||!payload)err('Please fill in the required details.'); }
  catch(e){ out.replaceChildren(h('p',{class:'error',role:'alert'},e.message||'Please check your input.')); return; }
  let qr;
  try{ qr=qrcode(0,ecl.value); qr.addData(payload); qr.make(); }
  catch(e){ out.replaceChildren(h('p',{class:'error',role:'alert'},'This content is too long to fit in a QR code. Please shorten it.')); return; }
  const n=qr.getModuleCount(),m=+margin.value,px=+size.value,cell=Math.max(1,Math.floor(px/(n+m*2))),W=cell*(n+m*2);
  const cv=document.createElement('canvas');cv.width=W;cv.height=W;const ctx=cv.getContext('2d');
  ctx.fillStyle=bg.value;ctx.fillRect(0,0,W,W);ctx.fillStyle=fg.value;
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(qr.isDark(r,c))ctx.fillRect((c+m)*cell,(r+m)*cell,cell,cell);
  const dataUrl=cv.toDataURL('image/png');lastPayload=payload;if(lastURL)URL.revokeObjectURL(lastURL);
  const typeLabel=TYPES.find(t=>t[0]===state.type)[1];
  out.replaceChildren(
   h('div',{class:'qr-card'},
    h('img',{src:dataUrl,width:W,height:W,alt:`Generated QR code (${typeLabel})`,class:'qr-img'}),
    h('p',{},h('strong',{},'Type: '),typeLabel),
    h('div',{class:'row'},
     h('a',{class:'btn',href:dataUrl,download:'toolboxy-qr-code.png'},'Download PNG'),
     h('button',{type:'button',class:'btn secondary',onclick:svgDownload(qr,n,m,px,fg.value,bg.value)},'Download SVG'),
     h('button',{type:'button',class:'btn secondary',onclick:async e=>{const ok=await copyText(lastPayload);e.target.closest('.row').querySelector('.qr-copy-status').textContent=ok?'Copied!':'Copy failed.';setTimeout(()=>e.target.closest('.row').querySelector('.qr-copy-status').textContent='',2200)}},'Copy Payload'),
     h('span',{class:'status qr-copy-status',role:'status'}),
    )));
 }
 function svgDownload(qr,n,m,px,f,b){return()=>{const cell=px/(n+m*2);let rects='';
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(qr.isDark(r,c))rects+=`<rect x="${(c+m)*cell}" y="${(r+m)*cell}" width="${cell}" height="${cell}"/>`;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${px} ${px}"><rect width="${px}" height="${px}" fill="${b}"/><g fill="${f}">${rects}</g></svg>`;
  const u=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));const a=h('a',{href:u,download:'toolboxy-qr-code.svg'});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)};}
 genBtn.addEventListener('click',generate);
 resetBtn.addEventListener('click',()=>{selectType('text');fg.value='#111827';bg.value='#ffffff';size.value='256';ecl.value='M';margin.value='4';checkContrast();clear()});
 selectType('text');checkContrast();
}
if(typeof qrcode==='undefined'){root.replaceChildren(h('p',{class:'error',role:'alert'},'The QR code library could not be loaded. Please refresh the page and try again.'));}
else build();
})();
