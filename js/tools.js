(()=>{
const root=$('#tool-root');if(!root)return;
const err=m=>{throw new Error(m)};
const cap=s=>s[0].toUpperCase()+s.slice(1);
const fin=n=>{if(!Number.isFinite(n)||Math.abs(n)>1e21)err('The result is too large to display. Please use smaller values.');return n};
const N=(v,name='value',min=-Infinity,max=Infinity)=>{const s=String(v??'').trim();if(s==='')err('Please enter a value.');const n=Number(s);if(!Number.isFinite(n))err('Please enter a valid number.');if(n<min||n>max)err(`${cap(name)} must be ${max<Infinity&&min>-Infinity?`between ${min} and ${max}`:min>-Infinity?`at least ${min}`:`at most ${max}`}.`);return n};
const P=(v,name='value')=>{const n=N(v,name);if(n<=0)err(`${cap(name)} must be greater than zero.`);return n};
const need=s=>{if(!String(s??'').trim())err('Please enter a value.')};
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const D=s=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||'');if(!m)err('Please enter valid dates.');const d=new Date(+m[1],m[2]-1,+m[3]);if(d.getMonth()!==m[2]-1)err('Please enter valid dates.');return d};
const ymd=(a,b)=>{let y=b.getFullYear()-a.getFullYear(),m=b.getMonth()-a.getMonth(),d=b.getDate()-a.getDate();if(d<0){m--;d+=new Date(b.getFullYear(),b.getMonth(),0).getDate()}if(m<0){y--;m+=12}return{y,m,d}};
const dd=(a,b)=>Math.round((b-a)/864e5);
const cur=n=>'Rs. '+fin(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const sm=n=>{fin(n);const a=Math.abs(n);if(a===0)return'0';if(a>=1e6)return n.toLocaleString('en-US',{maximumFractionDigits:2});if(a<1e-6)return n.toExponential(4);return Number(n.toPrecision(6)).toLocaleString('en-US',{maximumFractionDigits:10})};
const num=(id,label,o={})=>({id,label,type:'number',step:'any',inputmode:'decimal',...o});
const TA=(o={})=>({id:'text',label:'Your text',type:'textarea',placeholder:'Paste or type text...',...o});
const sel=(id,label,opts,value)=>({id,label,type:'select',options:opts,value});

/* ---------- form framework: input → action → formatted result ---------- */
function build(fields,run,o={}){
  const form=h('form',{class:'tool-form',novalidate:''}),els={},resets=[];
  const out=h('div',{class:'result','aria-live':'polite'});
  let last='',url=null,seq=0,ran=false;
  const empty=()=>{out.replaceChildren(h('p',{class:'muted'},o.live?'Your result will appear here.':`Enter your details and use ${o.actions?'one of the buttons':`“${o.action||'Calculate'}”`} to see the result.`))};
  fields.forEach(f=>{
    let i;
    if(f.type==='select')i=h('select',{id:f.id},f.options.map(([v,l])=>h('option',{value:v},l)));
    else if(f.type==='textarea')i=h('textarea',{id:f.id,rows:f.rows||8,placeholder:f.placeholder||'',spellcheck:'false'});
    else i=h('input',{id:f.id,type:f.type||'text',placeholder:f.placeholder,step:f.step,min:f.min,max:f.max,accept:f.accept,inputmode:f.inputmode});
    els[f.id]=i;
    const wrap=h('div',{class:'field'+(f.type==='checkbox'?' check':'')},f.type==='checkbox'?[i,h('label',{for:f.id},f.label)]:[h('label',{for:f.id},f.label),i]);
    if(f.type==='file'){
      const info=h('p',{class:'note',role:'status'}),pv=h('img',{class:'preview',alt:'Selected image preview',hidden:''});
      const sh=()=>{const fl=i.files[0];if(pv.src)URL.revokeObjectURL(pv.src);pv.removeAttribute('src');pv.hidden=!fl;info.textContent='';if(!fl)return;pv.src=URL.createObjectURL(fl);info.textContent=`${fl.name} · ${fl.type||'unknown type'} · ${(fl.size/1024).toFixed(1)} KB`;pv.onload=()=>{info.textContent+=` · ${pv.naturalWidth} × ${pv.naturalHeight} px`}};
      i.addEventListener('change',sh);wrap.classList.add('drop');
      ['dragenter','dragover'].forEach(ev=>wrap.addEventListener(ev,e=>{e.preventDefault();wrap.classList.add('over')}));
      wrap.addEventListener('dragleave',()=>wrap.classList.remove('over'));
      wrap.addEventListener('drop',e=>{e.preventDefault();wrap.classList.remove('over');if(e.dataTransfer&&e.dataTransfer.files.length){i.files=e.dataTransfer.files;sh()}});
      wrap.append(h('p',{class:'note'},'…or drag and drop an image onto this box.'),pv,info);resets.push(sh);
    }
    form.append(wrap);
  });
  const val=f=>{const i=els[f.id];return f.type==='file'?i.files[0]:f.type==='checkbox'?i.checked:(f.type==='number'&&i.validity&&i.validity.badInput)?'invalid':i.value};
  const setDefaults=()=>{fields.forEach(f=>{const i=els[f.id];if(f.type==='checkbox')i.checked=!!f.value;else if(f.type==='file')i.value='';else i.value=f.value??''});resets.forEach(r=>r())};
  const status=h('span',{class:'status',role:'status'});
  const copyB=h('button',{type:'button',class:'btn secondary',hidden:'',onclick:async()=>{status.textContent=(await copyText(last))?'Copied!':'Copy failed. Please select the text and copy it manually.';setTimeout(()=>status.textContent='',2500)}},o.ta?'Copy':'Copy Result');
  const dlB=o.download?h('button',{type:'button',class:'btn secondary',hidden:'',onclick:()=>{const u=URL.createObjectURL(new Blob([last],{type:'text/plain'}));const a=h('a',{href:u,download:o.download});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)}},'Download'):null;
  const show=async m=>{
    ran=true;const v={};fields.forEach(f=>v[f.id]=val(f));if(m)v.m=m;const my=++seq;let r,ex=null;
    try{r=await run(v)}catch(e){ex=e}
    if(my!==seq)return;out.replaceChildren();if(url){URL.revokeObjectURL(url);url=null}
    try{
      if(ex)throw ex;last='';
      if(r==null){empty()}else{
        const x=typeof r==='string'?{text:r}:r;
        if(x.cards){out.append(h('div',{class:'cards'},x.cards.map(([l,c,big])=>h('div',{class:'stat'+(big?' big':'')},h('span',{class:'stat-l'},l),h('strong',{},c)))));last=x.cards.map(([l,c])=>`${l}: ${c}`).join('\n')}
        if(x.table)out.append(h('div',{class:'tbl'},h('table',{},h('caption',{},x.table.title||''),h('thead',{},h('tr',{},x.table.head.map(c=>h('th',{scope:'col'},c)))),h('tbody',{},x.table.rows.map(rw=>h('tr',{},rw.map(c=>h('td',{},c))))))));
        if(x.text!=null){last=x.text;out.append(o.ta?h('textarea',{class:'code',readonly:'',rows:9,'aria-label':'Result'},x.text):h('pre',{class:'output'},x.text))}
        if(x.blob){url=URL.createObjectURL(x.blob);out.append(h('img',{class:'preview',src:url,alt:'Processed image preview'}),h('a',{class:'btn',href:url,download:x.name},'Download image'))}
      }
    }catch(e){last='';out.append(h('p',{class:'error',role:'alert'},e.message||'Something went wrong. Please check your input.'))}
    copyB.hidden=!last;if(dlB)dlB.hidden=!last;
  };
  const again=()=>{if(ran)show()};
  form.addEventListener('submit',e=>{e.preventDefault();show()});
  const auto=()=>{if(o.live||(o.liveAfter&&ran))show()};
  form.addEventListener('input',auto);form.addEventListener('change',auto);
  const btns=h('div',{class:'row'});
  if(o.actions)o.actions.forEach(([l,m])=>btns.append(h('button',{type:'button',class:'btn',onclick:()=>show(m)},l)));
  else if(!o.live)btns.append(h('button',{type:'submit',class:'btn'},o.action||'Calculate'));
  (o.extra||[]).forEach(([l,fn])=>btns.append(h('button',{type:'button',class:'btn secondary',onclick:()=>fn(els,again)},l)));
  btns.append(h('button',{type:'button',class:'btn secondary',onclick:()=>{seq++;setDefaults();ran=false;last='';copyB.hidden=true;if(dlB)dlB.hidden=true;empty()}},o.reset||'Reset'),copyB);
  if(dlB)btns.append(dlB);btns.append(status);form.append(btns);
  root.replaceChildren(...(o.note?[h('p',{class:'note'},o.note)]:[]),form,out);setDefaults();empty();
}
const live={live:true};

/* ---------- image helpers ---------- */
const loadImg=f=>new Promise((res,rej)=>{if(!f)return rej(new Error('Please choose an image file first.'));if(!f.type.startsWith('image/'))return rej(new Error('Please choose a valid image file (JPG, PNG, WebP or similar).'));
  const u=URL.createObjectURL(f),i=new Image();i.onload=()=>{URL.revokeObjectURL(u);res(i)};i.onerror=()=>{URL.revokeObjectURL(u);rej(new Error('This image could not be read. Please try another file.'))};i.src=u});
const toBlob=(c,t,q)=>new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error('Your browser could not create this image format.')),t,q));
const EXT={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
const cvs=(w,hh,type)=>{if(!Number.isInteger(w)||!Number.isInteger(hh)||w<1||hh<1||w>8000||hh>8000)err('Width and height must be whole numbers between 1 and 8000 pixels.');const c=document.createElement('canvas');c.width=w;c.height=hh;const x=c.getContext('2d');if(type==='image/jpeg'){x.fillStyle='#fff';x.fillRect(0,0,w,hh)}return[c,x]};
const done=async(c,type,q,f,tag,extra='')=>{const b=await toBlob(c,type,q);return{text:`${c.width} × ${c.height} px · ${(b.size/1024).toFixed(1)} KB${extra}`,blob:b,name:`${f.name.replace(/\.[^.]+$/,'')}-${tag}.${EXT[type]}`}};
const fmtOpts=[['image/png','PNG'],['image/jpeg','JPG'],['image/webp','WebP']];
const FILE={id:'file',label:'Choose an image',type:'file',accept:'image/*'};
const imgNote='Your image is processed locally in your browser and is never uploaded to a server.';
const img=(fields,fn,action='Process image')=>build([FILE,...fields],async v=>{const i=await loadImg(v.file);return fn(v,i)},{action,note:imgNote});

/* ---------- text helpers ---------- */
const words=s=>s.replace(/([a-z0-9])([A-Z])/g,'$1 $2').split(/[^A-Za-z0-9]+/).filter(Boolean);
const b64e=s=>{const b=new TextEncoder().encode(s);let t='';for(let i=0;i<b.length;i+=8192)t+=String.fromCharCode(...b.subarray(i,i+8192));return btoa(t)};
const b64d=s=>{const t=atob(s.replace(/\s+/g,'').replace(/-/g,'+').replace(/_/g,'/'));return new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(t,c=>c.charCodeAt(0)))};
const fmtHTML=s=>{const t=s.replace(/>\s+</g,'><').trim().split(/(<[^>]+>)/).filter(x=>x.trim()!=='');let d=0;const V=/^<(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr|!)/i,o=[];
  for(const x of t){const p='  '.repeat(d);if(/^<\//.test(x)){d=Math.max(0,d-1);o.push('  '.repeat(d)+x)}else if(/^<[a-z]/i.test(x)&&!/\/>$/.test(x)&&!V.test(x)){o.push(p+x);d++}else o.push(p+x.trim())}return o.join('\n')};
const fmtCSS=s=>{let o='',d=0,p=0,q=null;const I=()=>'  '.repeat(d);s=s.replace(/\s+/g,' ').trim();
  for(let i=0;i<s.length;i++){const c=s[i];
    if(q){o+=c;if(c===q&&s[i-1]!=='\\')q=null;continue}
    if(c==='"'||c==="'"){q=c;o+=c;continue}
    if(c===' '&&/\n\s*$/.test(o))continue;
    if(c==='(')p++;if(c===')')p--;
    if(c==='{'&&!p){o=o.trimEnd()+' {\n';d++;o+=I()}
    else if(c==='}'&&!p){d=Math.max(0,d-1);o=o.trimEnd()+'\n'+I()+'}\n'+I()}
    else if(c===';'&&!p)o+=';\n'+I();
    else o+=c}
  return o.replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim()+'\n'};

/* ---------- JavaScript formatter (re-indents; never executes code) ---------- */
const fmtJS=s=>{let o='',d=0,p=0,i=0;const n=s.length,I=()=>'  '.repeat(d),nl=()=>{o=o.trimEnd()+'\n'+I()};
  while(i<n){const c=s[i],c2=s[i+1];
    if(c==='/'&&c2==='/'){const e=s.indexOf('\n',i),t=s.slice(i,e<0?n:e);o+=t;i=e<0?n:e;nl();continue}
    if(c==='/'&&c2==='*'){const e=s.indexOf('*/',i+2),t=s.slice(i,e<0?n:e+2);o+=t;i=e<0?n:e+2;nl();continue}
    if(c==='"'||c==="'"||c==='`'){let j=i+1;while(j<n&&s[j]!==c){if(s[j]==='\\')j++;j++}o+=s.slice(i,j+1);i=j+1;continue}
    if(/\s/.test(c)){if(!/\s$/.test(o))o+=' ';i++;continue}
    if(c==='(')p++;if(c===')')p--;
    if(c==='{'){o=o.trimEnd()+' {';d++;nl();i++;continue}
    if(c==='}'){d=Math.max(0,d-1);nl();o+='}';i++;const r=s.slice(i);if(/^\s*(else|catch|finally)\b/.test(r))o+=' ';else{const m=/^\s*(\S)/.exec(r);if(m&&!/[,;).\]]/.test(m[1]))nl()}continue}
    if(c===';'&&p<=0){o+=';';nl();i++;continue}
    o+=c;i++}
  return o.replace(/[ \t]+\n/g,'\n').replace(/\n\s*\n\s*\n/g,'\n\n').trim()+'\n'};

/* ---------- code editor tool with sandboxed preview ---------- */
const HOOK="<script>(function(){function s(t,a){try{parent.postMessage({tb:1,t:t,m:a.map(function(x){try{return typeof x==='object'?JSON.stringify(x):String(x)}catch(e){return String(x)}}).join(' ')},'*')}catch(e){}}['log','info','warn','error'].forEach(function(k){console[k]=function(){s(k,[].slice.call(arguments))}});window.addEventListener('error',function(e){s('error',[e.message])})})();<\/script>";
function codeTool({inputs,fmtId,format,action='Format',extras=[],preview,file='output.txt'}){
  const els={},box=h('div',{class:'code-box'});
  inputs.forEach(f=>{const t=h('textarea',{id:f.id,class:'code',rows:f.rows||8,spellcheck:'false',autocomplete:'off',placeholder:f.placeholder||''});els[f.id]=t;box.append(h('div',{class:'field'},h('label',{for:f.id},f.label),t))});
  const outT=h('textarea',{id:'code-output',class:'code',rows:10,readonly:'',placeholder:'Output appears here after you press '+action+'.'});
  const msg=h('div',{'aria-live':'polite'}),st=h('span',{class:'status',role:'status'});
  const flash=t=>{st.textContent=t;setTimeout(()=>st.textContent='',2500)};
  const act=fn=>()=>{msg.replaceChildren();try{const s=els[fmtId].value;need(s);outT.value=fn(s)}catch(e){outT.value='';msg.replaceChildren(h('p',{class:'error',role:'alert'},e.message||'Something went wrong.'))}};
  const bar=h('div',{class:'row'},h('button',{type:'button',class:'btn',onclick:act(format)},action),extras.map(([l,fn])=>h('button',{type:'button',class:'btn secondary',onclick:act(fn)},l)));
  let clearPv=()=>{};
  bar.append(h('button',{type:'button',class:'btn secondary',onclick:()=>{Object.values(els).forEach(t=>t.value='');outT.value='';msg.replaceChildren();clearPv()}},'Clear'),
    h('button',{type:'button',class:'btn secondary',onclick:async()=>{if(!outT.value)return flash('Nothing to copy yet.');flash((await copyText(outT.value))?'Copied!':'Copy failed.')}},'Copy Code'),
    h('button',{type:'button',class:'btn secondary',onclick:()=>{if(!outT.value)return flash('Nothing to download yet.');const u=URL.createObjectURL(new Blob([outT.value],{type:'text/plain'})),a=h('a',{href:u,download:file});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)}},'Download'),st);
  const codePane=h('div',{},box,bar,msg,h('div',{class:'field'},h('label',{for:'code-output'},'OUTPUT'),outT));
  if(!preview){root.replaceChildren(codePane);return}
  /* sandboxed preview: user code runs ONLY inside this iframe (opaque origin, no allow-same-origin) and only after Run Preview */
  const frame=h('iframe',{class:'pv-frame',title:'Sandboxed preview',sandbox:'allow-scripts',referrerpolicy:'no-referrer'});
  const handle=h('div',{class:'pv-handle',role:'slider',tabindex:'0','aria-label':'Resize preview width (drag, or use left and right arrow keys)','aria-valuemin':'240','aria-valuemax':'2400','aria-valuenow':'0','aria-orientation':'horizontal'});
  const vp=h('div',{class:'pv-vp'},frame,handle),stage=h('div',{class:'pv-stage'},vp),info=h('p',{class:'pv-info',role:'status'});
  const con=h('pre',{class:'output console',id:'console-out',tabindex:'0','aria-label':'Console output'}),pmsg=h('div',{'aria-live':'polite'});
  let mode='responsive',dev=[];
  const upd=()=>{const w=Math.round(vp.getBoundingClientRect().width);info.textContent=`Preview: ${mode[0].toUpperCase()+mode.slice(1)} · Width: ${mode==='responsive'?`100% (${w}px)`:`${w}px`}`;handle.setAttribute('aria-valuenow',String(w))};
  const setMode=(m,px)=>{mode=m;vp.style.width=px?px+'px':'100%';dev.forEach(([b,k])=>b.setAttribute('aria-pressed',String(k===m)));upd()};
  dev=[['Responsive','responsive',0],['Mobile','mobile',390],['Tablet','tablet',768],['Desktop','desktop',1280]].map(([l,k,px])=>[h('button',{type:'button',class:'btn secondary','aria-pressed':String(k==='responsive'),onclick:()=>setMode(k,px)},l),k]);
  if('ResizeObserver'in window)new ResizeObserver(upd).observe(vp);
  const resizeTo=w=>setMode('custom',Math.max(240,Math.min(2400,Math.round(w))));
  handle.addEventListener('pointerdown',e=>{e.preventDefault();const x0=e.clientX,w0=vp.getBoundingClientRect().width;handle.setPointerCapture(e.pointerId);frame.classList.add('dragging');
    const mv=ev=>resizeTo(w0+(ev.clientX-x0)),up=()=>{frame.classList.remove('dragging');handle.removeEventListener('pointermove',mv);handle.removeEventListener('pointerup',up);handle.removeEventListener('pointercancel',up)};
    handle.addEventListener('pointermove',mv);handle.addEventListener('pointerup',up);handle.addEventListener('pointercancel',up)});
  handle.addEventListener('keydown',e=>{const w=vp.getBoundingClientRect().width;if(e.key==='ArrowRight'){e.preventDefault();resizeTo(w+16)}if(e.key==='ArrowLeft'){e.preventDefault();resizeTo(w-16)}});
  const CSP=`<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; script-src 'unsafe-inline'; form-action 'none'">`;
  const g=id=>els[id]?els[id].value:'';
  const run=()=>{pmsg.replaceChildren();con.textContent='';
    if(!(g('html')+g('css')+g('js')).trim()){pmsg.append(h('p',{class:'error',role:'alert'},'Please enter some code to preview.'));return}
    const css=g('css'),js=g('js');
    frame.srcdoc=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${CSP}<style>body{font-family:system-ui,sans-serif;margin:12px}</style>${css?`<style>${css.replace(/<\/style/gi,'<\\/style')}</style>`:''}</head><body>${g('html')}${js?HOOK+'<script>'+js.replace(/<\/script/gi,'<\\/script')+'<\/script>':''}</body></html>`;upd()};
  window.addEventListener('message',e=>{if(e.source!==frame.contentWindow||!e.data||e.data.tb!==1||con.textContent.length>20000)return;con.textContent+=`[${String(e.data.t).slice(0,8)}] ${String(e.data.m).slice(0,2000)}\n`});
  clearPv=()=>{frame.srcdoc='';con.textContent='';pmsg.replaceChildren()};
  const pbox=h('div',{class:'pv-box'}),fsB=h('button',{type:'button',class:'btn secondary'},'Full Screen');
  let fake=false;const isFs=()=>document.fullscreenElement===pbox||fake;
  const sync=()=>{fsB.textContent=isFs()?'Exit Full Screen':'Full Screen';pbox.classList.toggle('pv-fs',isFs());upd()};
  const exitFs=()=>{fake=false;if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});sync()};
  fsB.onclick=async()=>{if(isFs())return exitFs();try{if(pbox.requestFullscreen){await pbox.requestFullscreen()}else{fake=true}}catch(e){fake=true}sync()};
  document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)fake=false;sync()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&fake)exitFs()});
  const tools=h('div',{class:'row pv-tools',role:'group','aria-label':'Preview controls'},h('button',{type:'button',class:'btn',onclick:run},'Run Preview'),dev.map(x=>x[0]),h('button',{type:'button',class:'btn secondary',onclick:()=>{if(frame.srcdoc)run();else pmsg.replaceChildren(h('p',{class:'error',role:'alert'},'Press Run Preview first.'))}},'Refresh Preview'),fsB,h('button',{type:'button',class:'btn secondary',onclick:clearPv},'Reset Preview'));
  pbox.append(tools,pmsg,info,stage,h('label',{for:'console-out'},'Console'),con);
  const pvPane=h('div',{hidden:''},h('p',{class:'note'},'The preview runs in an isolated sandboxed frame and cannot access ToolBoxy. Nothing runs until you press Run Preview.'),pbox);
  const tb=[['Code',codePane],['Preview',pvPane]].map(([l,p])=>{const b=h('button',{type:'button',class:'btn','aria-pressed':l==='Code'?'true':'false'},l);b.onclick=()=>{tb.forEach(x=>{x[0].setAttribute('aria-pressed',String(x[0]===b));x[1].hidden=x[1]!==p});upd()};return[b,p]});
  root.replaceChildren(h('div',{class:'tabs',role:'group','aria-label':'Code or preview'},tb.map(x=>x[0])),codePane,pvPane);
}
const jp=s=>{try{return JSON.parse(s)}catch(e){err(`Invalid JSON: ${e.message}`)}};

/* ---------- converters ---------- */
const sm2=n=>sm(n);
const conv=(list,a,b,note)=>{const M=Object.fromEntries(list.map(x=>[x[0],x])),o=list.map(x=>[x[0],`${x[2]} (${x[3]})`]);
  build([sel('f','Convert From',o,a),num('v','Value',{placeholder:'e.g. 100'}),sel('t','Convert To',o,b)],v=>{const x=N(v.v),F=M[v.f],U=M[v.t],r=fin(x*F[1]/U[1]);
    return{cards:[['Result',`${sm(x)} ${F[3]} = ${sm(r)} ${U[3]}`,1],['Conversion rate',`1 ${F[3]} = ${sm(F[1]/U[1])} ${U[3]}`]]}},
    {action:'Convert',liveAfter:1,note,extra:[['Swap Units',(els,again)=>{[els.f.value,els.t.value]=[els.t.value,els.f.value];again()}]]})};
const LEN=[['mm',.001,'Millimeter','mm'],['cm',.01,'Centimeter','cm'],['m',1,'Meter','m'],['km',1000,'Kilometer','km'],['in',.0254,'Inch','in'],['ft',.3048,'Foot','ft'],['yd',.9144,'Yard','yd'],['mi',1609.344,'Mile','mi']];
const WGT=[['mg',1e-6,'Milligram','mg'],['g',.001,'Gram','g'],['kg',1,'Kilogram','kg'],['t',1000,'Metric Ton','t'],['oz',.028349523125,'Ounce','oz'],['lb',.45359237,'Pound','lb'],['st',6.35029318,'Stone','st']];
const ARE=[['m2',1,'Square Meter','m²'],['km2',1e6,'Square Kilometer','km²'],['cm2',1e-4,'Square Centimeter','cm²'],['mm2',1e-6,'Square Millimeter','mm²'],['ft2',.09290304,'Square Foot','ft²'],['yd2',.83612736,'Square Yard','yd²'],['mi2',2589988.110336,'Square Mile','mi²'],['in2',6.4516e-4,'Square Inch','in²'],['ha',1e4,'Hectare','ha'],['ac',4046.8564224,'Acre','ac']];
const VOL=[['ml',.001,'Milliliter','mL'],['l',1,'Liter','L'],['m3',1000,'Cubic Meter','m³'],['cm3',.001,'Cubic Centimeter','cm³'],['ft3',28.316846592,'Cubic Foot','ft³'],['in3',.016387064,'Cubic Inch','in³'],['gal',3.785411784,'Gallon (US)','gal'],['qt',.946352946,'Quart (US)','qt'],['pt',.473176473,'Pint (US)','pt'],['cup',.2365882365,'Cup (US)','cup']];
const SPD=[['ms',1,'Meter per Second','m/s'],['kmh',1/3.6,'Kilometer per Hour','km/h'],['mph',.44704,'Mile per Hour','mph'],['kn',1852/3600,'Knot','kn'],['fps',.3048,'Foot per Second','ft/s']];
const TIM=[['ms',.001,'Millisecond','ms'],['s',1,'Second','s'],['min',60,'Minute','min'],['h',3600,'Hour','h'],['d',86400,'Day','d'],['w',604800,'Week','wk']];
const DAT=[['bit',.125,'Bit','bit'],['B',1,'Byte','B'],['KB',1024,'Kilobyte','KB'],['MB',1048576,'Megabyte','MB'],['GB',1073741824,'Gigabyte','GB'],['TB',1099511627776,'Terabyte','TB'],['PB',1125899906842624,'Petabyte','PB']];


/* ---------- tools ---------- */
const T={
'age-calculator':()=>build([{id:'dob',label:'Date of Birth',type:'date'},{id:'on',label:'Calculate As Of Date',type:'date',value:today()}],v=>{
  const a=D(v.dob),b=D(v.on);if(a>b)err('Date of birth must be before the calculation date.');
  const r=ymd(a,b),d=dd(a,b),nx=new Date(b.getFullYear(),a.getMonth(),a.getDate());if(nx<b)nx.setFullYear(nx.getFullYear()+1);const n=dd(b,nx);
  return{cards:[['Age',`${r.y} Years ${r.m} Months ${r.d} Days`,1],['Total Months',fmt(r.y*12+r.m,0)],['Total Weeks',fmt(Math.floor(d/7),0)],['Total Days',fmt(d,0)],['Next Birthday',`${nx.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})} (${n===0?'today':`in ${fmt(n,0)} days`})`]]}},{action:'Calculate Age'}),
'percentage-calculator':()=>build([sel('mode','Calculation',[['of','What is X% of Y?'],['is','X is what percent of Y?'],['inc','Percentage increase from X to Y'],['dec','Percentage decrease from X to Y']],'of'),num('a','Value X',{placeholder:'e.g. 25'}),num('b','Value Y',{placeholder:'e.g. 800'})],v=>{
  const a=N(v.a),b=N(v.b);
  if(v.mode==='of')return{cards:[['Result',`${sm(a)}% of ${sm(b)} = ${sm(a*b/100)}`,1]]};
  if(v.mode==='is'){if(b===0)err('Value Y cannot be zero.');return{cards:[['Result',`${sm(a)} is ${sm(a/b*100)}% of ${sm(b)}`,1]]}}
  if(a===0)err('Value X cannot be zero.');const c=(b-a)/Math.abs(a)*100;
  if(v.mode==='inc'&&c<=0)err('Value Y must be greater than value X for an increase.');
  if(v.mode==='dec'&&c>=0)err('Value Y must be smaller than value X for a decrease.');
  return{cards:[['Result',`${v.mode==='inc'?'Increase':'Decrease'} of ${sm(Math.abs(c))}%`,1],['Change',`${sm(a)} → ${sm(b)} (${sm(b-a)})`]]}},{action:'Calculate'}),
'discount-calculator':()=>build([num('p','Original Price',{placeholder:'e.g. 10000'}),num('d','Discount Percentage (%)',{placeholder:'e.g. 20'})],v=>{
  const p=N(v.p,'original price',0),d=N(v.d,'discount percentage',0,100),s=p*d/100;
  return{cards:[['Original Price',cur(p)],['Discount',`${sm(d)}%`],['Discount Amount',cur(s)],['Final Price',cur(p-s),1]]}},{action:'Calculate Discount'}),
'bmi-calculator':()=>build([num('w','Weight (kg)',{placeholder:'e.g. 70'}),num('h','Height (cm)',{placeholder:'e.g. 175'})],v=>{
  const w=P(v.w,'weight'),hh=P(v.h,'height');if(hh<50||hh>272)err('Height must be between 50 and 272 cm.');const b=w/((hh/100)**2);
  return{cards:[['BMI',b.toFixed(1),1],['Category',b<18.5?'Underweight':b<25?'Normal weight':b<30?'Overweight':'Obese']],text:`BMI: ${b.toFixed(1)}`}},{action:'Calculate BMI',note:'BMI is a general screening number, not a medical diagnosis.'}),
'emi-calculator':()=>build([num('p','Loan Amount',{placeholder:'e.g. 100000'}),num('r','Interest Rate (% per year)',{placeholder:'e.g. 10'}),num('n','Loan Tenure',{step:'1',placeholder:'e.g. 12'}),sel('u','Tenure Unit',[['m','Months'],['y','Years']],'m')],v=>{
  const p=P(v.p,'loan amount'),a=N(v.r,'interest rate',0,100);let n=P(v.n,'loan tenure');if(v.u==='y')n*=12;if(!Number.isInteger(n))err('Loan tenure must be a whole number of months.');if(n>600)err('Loan tenure must be 50 years or less.');
  const r=a/1200,e=fin(r===0?p/n:p*r*(1+r)**n/((1+r)**n-1));let bal=p,yi=0,yp=0;const rows=[];
  for(let m=1;m<=n;m++){const i=bal*r,pr=e-i;bal=Math.max(0,bal-pr);yi+=i;yp+=pr;if(m%12===0||m===n){rows.push([`Year ${Math.ceil(m/12)}`,cur(yp),cur(yi),cur(bal)]);yi=0;yp=0}}
  return{cards:[['Monthly EMI',cur(e),1],['Total Interest',cur(e*n-p)],['Total Payment',cur(e*n)]],table:{title:'Yearly amortization',head:['Period','Principal paid','Interest paid','Balance'],rows}}},{action:'Calculate EMI'}),
'simple-interest-calculator':()=>build([num('p','Principal',{placeholder:'e.g. 1000'}),num('r','Interest Rate (% per year)',{placeholder:'e.g. 5'}),num('t','Time',{placeholder:'e.g. 3'}),sel('u','Time Unit',[['y','Years'],['m','Months']],'y')],v=>{
  const p=P(v.p,'principal'),r=N(v.r,'interest rate',0),t=P(v.t,'time'),y=v.u==='m'?t/12:t,i=p*r*y/100;
  return{cards:[['Principal',cur(p)],['Interest',cur(i)],['Total Amount',cur(p+i),1]]}},{action:'Calculate'}),
'compound-interest-calculator':()=>build([num('p','Principal',{placeholder:'e.g. 1000'}),num('r','Interest Rate (% per year)',{placeholder:'e.g. 5'}),num('t','Time (years)',{placeholder:'e.g. 10'}),sel('n','Compounding Frequency',[['1','Yearly'],['2','Half-yearly'],['4','Quarterly'],['12','Monthly'],['365','Daily']],'1')],v=>{
  const p=P(v.p,'principal'),r=N(v.r,'interest rate',0),t=P(v.t,'time'),n=+v.n;if(t>50)err('Time must be 50 years or less.');
  const A=y=>p*(1+r/100/n)**(n*y),a=fin(A(t)),rows=[];for(let y=1;y<=Math.ceil(t);y++){const b=A(Math.min(y,t));rows.push([`Year ${y}`,cur(b),cur(b-p)])}
  return{cards:[['Principal',cur(p)],['Interest Earned',cur(a-p)],['Final Amount',cur(a),1]],table:{title:'Growth summary',head:['Period','Balance','Interest so far'],rows}}},{action:'Calculate'}),
'date-difference':()=>build([{id:'a',label:'Start Date',type:'date'},{id:'b',label:'End Date',type:'date',value:today()}],v=>{
  const a=D(v.a),b=D(v.b);if(b<a)err('End date must be after the start date.');const r=ymd(a,b),d=dd(a,b);
  return{cards:[['Years',fmt(r.y,0)],['Months',fmt(r.m,0)],['Days',fmt(r.d,0)],['Total Days',fmt(d,0),1],['Total Weeks',fmt(d/7,2)]]}},{action:'Calculate Difference'}),
'average-calculator':()=>build([TA({label:'Numbers (separated by commas, spaces or new lines)',placeholder:'e.g. 10, 20, 30, 40, 50',rows:5})],v=>{
  need(v.text);const a=v.text.split(/[\s,;]+/).filter(Boolean).map(Number);if(a.some(x=>!Number.isFinite(x)))err('Please enter a valid number list, separated by commas, spaces or new lines.');
  const s=[...a].sort((x,y)=>x-y),m=s.length>>1,med=s.length%2?s[m]:(s[m-1]+s[m])/2,sum=fin(a.reduce((x,y)=>x+y,0));
  return{cards:[['Average',sm(sum/a.length),1],['Count',fmt(a.length,0)],['Sum',sm(sum)],['Minimum',sm(s[0])],['Maximum',sm(s[s.length-1])],['Median',sm(med)]]}},{action:'Calculate Average',reset:'Clear'}),
'time-calculator':()=>{const z=n=>String(n).padStart(2,'0'),g=x=>{const s=String(x??'').trim();if(s==='')return 0;const n=Number(s);if(!Number.isInteger(n)||n<0)err('Please enter whole numbers of 0 or more.');return n},F=(id,l)=>num(id,l,{step:'1',min:0,placeholder:'0'});
  build([F('h1','Hours (first time)'),F('m1','Minutes (first time)'),F('s1','Seconds (first time)'),sel('op','Operation',[['+','Add (+)'],['-','Subtract (−)']],'+'),F('h2','Hours (second time)'),F('m2','Minutes (second time)'),F('s2','Seconds (second time)')],v=>{
    const a=g(v.h1)*3600+g(v.m1)*60+g(v.s1),b=g(v.h2)*3600+g(v.m2)*60+g(v.s2);if(!a&&!b)err('Please enter a value.');const r=v.op==='+'?a+b:a-b;if(r<0)err('The result would be negative. Try a smaller second time.');
    return{cards:[['Result (HH:MM:SS)',`${z(Math.floor(r/3600))}:${z(Math.floor(r%3600/60))}:${z(r%60)}`,1],['Total Hours',sm(r/3600)],['Total Minutes',sm(r/60)],['Total Seconds',fmt(r,0)]]}},{action:'Calculate'})},

'word-counter':()=>build([TA()],v=>{const t=v.text;if(!t.trim())return null;const w=t.trim().split(/\s+/).length;
  return{cards:[['Words',fmt(w,0),1],['Characters',fmt([...t].length,0)],['Characters without spaces',fmt([...t.replace(/\s/g,'')].length,0)],['Lines',fmt(t.split('\n').length,0)],['Paragraphs',fmt(t.split(/\n\s*\n/).filter(x=>x.trim()).length,0)],['Sentences',fmt((t.match(/[.!?]+(\s|$)/g)||[]).length||1,0)],['Reading time',`about ${Math.max(1,Math.ceil(w/200))} min`]]}},{live:true,reset:'Clear'}),
'character-counter':()=>build([TA()],v=>{const t=v.text;if(!t)return null;return{cards:[['Characters',fmt([...t].length,0),1],['Characters without spaces',fmt([...t.replace(/\s/g,'')].length,0)],['Lines',fmt(t.split('\n').length,0)],['UTF-8 bytes',fmt(new TextEncoder().encode(t).length,0)]]}},{live:true,reset:'Clear'}),
'case-converter':()=>build([TA()],v=>{need(v.text);const t=v.text,c=x=>x[0].toUpperCase()+x.slice(1).toLowerCase(),w=words(t);
  return{text:{up:t.toUpperCase(),low:t.toLowerCase(),title:t.toLowerCase().replace(/(^|\s)\S/g,x=>x.toUpperCase()),sent:t.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z])/g,(m,a,b)=>a+b.toUpperCase()),camel:w.map((x,i)=>i?c(x):x.toLowerCase()).join(''),snake:w.map(x=>x.toLowerCase()).join('_'),kebab:w.map(x=>x.toLowerCase()).join('-')}[v.m]}},
  {ta:1,reset:'Clear',download:'converted.txt',actions:[['UPPERCASE','up'],['lowercase','low'],['Title Case','title'],['Sentence case','sent'],['camelCase','camel'],['snake_case','snake'],['kebab-case','kebab']]}),
'text-reverser':()=>build([TA(),sel('m','Reverse',[['c','Characters'],['w','Word order'],['l','Line order']],'c')],v=>{need(v.text);const t=v.text;return{text:v.m==='c'?[...t].reverse().join(''):v.m==='w'?t.split(/\s+/).filter(Boolean).reverse().join(' '):t.split('\n').reverse().join('\n')}},{ta:1,reset:'Clear',download:'reversed.txt',action:'Reverse Text'}),
'remove-duplicate-lines':()=>build([TA({label:'Your lines (one per line)'}),{id:'cs',label:'Case-sensitive',type:'checkbox',value:true},{id:'tr',label:'Ignore leading and trailing spaces',type:'checkbox',value:true}],v=>{
  need(v.text);const seen=new Set(),o=[],all=v.text.split('\n');all.forEach(l=>{let k=v.tr?l.trim():l;if(!v.cs)k=k.toLowerCase();if(!seen.has(k)){seen.add(k);o.push(v.tr?l.trim():l)}});
  return{cards:[['Duplicate lines removed',fmt(all.length-o.length,0)]],text:o.join('\n')}},{ta:1,reset:'Clear',download:'unique-lines.txt',action:'Remove Duplicates'}),
'text-sorter':()=>build([TA({label:'Your lines (one per line)'}),sel('m','Sort',[['az','A → Z'],['za','Z → A'],['len','By length'],['num','Numerically'],['rev','Reverse current order']],'az')],v=>{
  need(v.text);const l=v.text.split('\n').filter(x=>x.trim()),c=(a,b)=>a.localeCompare(b,undefined,{numeric:true,sensitivity:'base'}),n=x=>{const f=parseFloat(x);return Number.isNaN(f)?Infinity:f};
  if(v.m==='az')l.sort(c);else if(v.m==='za')l.sort((a,b)=>c(b,a));else if(v.m==='len')l.sort((a,b)=>a.length-b.length||c(a,b));else if(v.m==='num')l.sort((a,b)=>n(a)===n(b)?0:n(a)<n(b)?-1:1);else l.reverse();
  return{text:l.join('\n')}},{ta:1,reset:'Clear',download:'sorted.txt',action:'Sort Lines'}),
'slug-generator':()=>build([TA({label:'Title or text',rows:3,placeholder:'e.g. Hello, World! Café Guide'})],v=>{
  if(!v.text.trim())return null;const s=v.text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');if(!s)err('No letters or numbers (A–Z, 0–9) were found to build a slug.');return{text:s}},{live:true,ta:1,reset:'Clear'}),
'text-cleaner':()=>build([TA(),{id:'trim',label:'Trim spaces at the start and end of each line',type:'checkbox',value:true},{id:'sp',label:'Collapse repeated spaces',type:'checkbox',value:true},{id:'bl',label:'Remove blank lines',type:'checkbox',value:true},{id:'html',label:'Remove HTML tags',type:'checkbox',value:false}],v=>{
  need(v.text);let t=v.text;if(v.html)t=t.replace(/<[^>]*>/g,'');if(v.sp)t=t.replace(/[ \t]{2,}/g,' ');if(v.trim)t=t.split('\n').map(x=>x.trim()).join('\n');if(v.bl)t=t.split('\n').filter(x=>x.trim()).join('\n');return{text:t}},{ta:1,reset:'Clear',download:'cleaned.txt',action:'Clean Text'}),

'json-formatter':()=>codeTool({inputs:[{id:'in',label:'INPUT CODE',placeholder:'{"name":"ToolBoxy","tools":["calculator","converter"]}',rows:10}],fmtId:'in',format:s=>JSON.stringify(jp(s),null,2),extras:[['Minify',s=>JSON.stringify(jp(s))]],file:'formatted.json'}),
'json-validator':()=>codeTool({inputs:[{id:'in',label:'INPUT CODE',placeholder:'{"valid": true}',rows:10}],fmtId:'in',action:'Validate',format:s=>{const j=jp(s);return `✔ Valid JSON\nRoot type: ${Array.isArray(j)?'array':j===null?'null':typeof j}`},file:'validation.txt'}),
'html-formatter':()=>codeTool({inputs:[{id:'html',label:'HTML (Format uses this editor)',placeholder:'<h1>Hello ToolBoxy</h1>',rows:9},{id:'css',label:'CSS (optional, used in preview)',placeholder:'h1{font-size:40px}',rows:9},{id:'js',label:'JavaScript (optional, used in preview)',placeholder:'console.log("Hello ToolBoxy");',rows:9}],fmtId:'html',format:fmtHTML,preview:'js',file:'formatted.html'}),
'css-formatter':()=>codeTool({inputs:[{id:'html',label:'HTML (optional, used in preview)',placeholder:'<h1>Hello ToolBoxy</h1>',rows:9},{id:'css',label:'CSS (Format uses this editor)',placeholder:'h1{font-size:40px}',rows:9},{id:'js',label:'JavaScript (optional, used in preview)',placeholder:'console.log("Hello ToolBoxy");',rows:9}],fmtId:'css',format:fmtCSS,preview:'js',file:'formatted.css'}),
'js-formatter':()=>codeTool({inputs:[{id:'html',label:'HTML (optional, used in preview)',placeholder:'<h1>Hello ToolBoxy</h1>',rows:9},{id:'css',label:'CSS (optional, used in preview)',placeholder:'h1{font-size:40px}',rows:9},{id:'js',label:'JavaScript (Format uses this editor)',placeholder:'console.log("Hello ToolBoxy");',rows:9}],fmtId:'js',format:fmtJS,preview:'js',file:'formatted.js'}),
'base64-encoder':()=>build([TA({label:'Text to encode'})],v=>{need(v.text);return{text:b64e(v.text)}},{ta:1,reset:'Clear',download:'encoded.txt',action:'Encode'}),
'base64-decoder':()=>build([TA({label:'Base64 to decode'})],v=>{need(v.text);try{return{text:b64d(v.text)}}catch{err('Please enter valid Base64 text (letters, numbers, + / and = only, decoding to UTF-8 text).')}},{ta:1,reset:'Clear',download:'decoded.txt',action:'Decode'}),
'url-encoder':()=>build([TA({label:'Text or URL to encode',rows:5}),sel('m','Mode',[['c','Encode a value (encodeURIComponent)'],['u','Encode a full URL (encodeURI)']],'c')],v=>{need(v.text);return{text:v.m==='c'?encodeURIComponent(v.text):encodeURI(v.text)}},{ta:1,reset:'Clear',download:'encoded.txt',action:'Encode'}),
'url-decoder':()=>build([TA({label:'Encoded text or URL',rows:5})],v=>{need(v.text);try{return{text:decodeURIComponent(v.text.replace(/\+/g,' '))}}catch{err('This text contains a malformed % sequence and cannot be decoded.')}},{ta:1,reset:'Clear',download:'decoded.txt',action:'Decode'}),
'uuid-generator':()=>build([num('n','How many UUIDs? (1–50)',{value:5,step:'1',min:1,max:50})],v=>{
  const n=N(v.n,'number of UUIDs',1,50);if(!Number.isInteger(n))err('Please enter a whole number between 1 and 50.');
  const g=()=>crypto.randomUUID?crypto.randomUUID():'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=crypto.getRandomValues(new Uint8Array(1))[0]&15;return(c==='x'?r:(r&3)|8).toString(16)});
  return{text:Array.from({length:n},g).join('\n')}},{ta:1,action:'Generate',download:'uuids.txt'}),

'image-resizer':()=>img([num('w','New width (px)',{step:'1',placeholder:'e.g. 1200'}),num('h','New height (px, optional when keeping ratio)',{step:'1',placeholder:'e.g. 800'}),{id:'k',label:'Keep aspect ratio',type:'checkbox',value:true},sel('t','Output format',fmtOpts,'image/png')],async(v,i)=>{
  let w=v.w?N(v.w,'width'):0,hh=v.h?N(v.h,'height'):0;if(!w&&!hh)err('Please enter a width or a height.');
  if(v.k){if(w)hh=Math.round(i.height*w/i.width);else w=Math.round(i.width*hh/i.height)}else if(!w||!hh)err('Please enter both width and height, or turn on "Keep aspect ratio".');
  const[c,x]=cvs(Math.round(w),Math.round(hh),v.t);x.drawImage(i,0,0,c.width,c.height);return done(c,v.t,.92,v.file,'resized',`\nOriginal: ${i.width} × ${i.height} px`)},'Resize image'),
'image-compressor':()=>img([{id:'q',label:'Quality (10–95)',type:'number',value:70,min:10,max:95,step:'1'},sel('t','Output format',[['image/jpeg','JPG'],['image/webp','WebP']],'image/jpeg')],async(v,i)=>{
  const q=N(v.q,'quality',10,95),[c,x]=cvs(i.width,i.height,v.t);x.drawImage(i,0,0);const r=await done(c,v.t,q/100,v.file,'compressed'),o=v.file.size,n=r.blob.size;
  r.text+=`\nOriginal: ${(o/1024).toFixed(1)} KB\n${n<o?`Saved ${((1-n/o)*100).toFixed(0)}%`:'The new file is not smaller. Try a lower quality or WebP.'}`;return r},'Compress image'),
'image-cropper':()=>img([num('x','Left (x, px)',{value:0,step:'1'}),num('y','Top (y, px)',{value:0,step:'1'}),num('w','Crop width (px)',{step:'1'}),num('h','Crop height (px)',{step:'1'}),sel('t','Output format',fmtOpts,'image/png')],async(v,i)=>{
  const x=N(v.x,'left position',0),y=N(v.y,'top position',0),w=P(v.w,'crop width'),hh=P(v.h,'crop height');
  if(x+w>i.width||y+hh>i.height)err(`The crop area goes outside the image. This image is ${i.width} × ${i.height} px.`);
  const[c,g]=cvs(w,hh,v.t);g.drawImage(i,x,y,w,hh,0,0,w,hh);return done(c,v.t,.92,v.file,'cropped')},'Crop image'),
'jpg-to-png':()=>img([],async(v,i)=>{if(!/jpe?g/.test(v.file.type))err('Please choose a JPG/JPEG image.');const[c,x]=cvs(i.width,i.height,'image/png');x.drawImage(i,0,0);return done(c,'image/png',1,v.file,'converted')},'Convert to PNG'),
'png-to-jpg':()=>img([{id:'q',label:'JPG quality (10–100)',type:'number',value:90,min:10,max:100,step:'1'}],async(v,i)=>{if(v.file.type!=='image/png')err('Please choose a PNG image.');const q=N(v.q,'quality',10,100),[c,x]=cvs(i.width,i.height,'image/jpeg');x.drawImage(i,0,0);return done(c,'image/jpeg',q/100,v.file,'converted','\nTransparent areas were filled with white.')},'Convert to JPG'),
'image-to-base64':()=>build([FILE],v=>new Promise((res,rej)=>{const f=v.file;if(!f)return rej(new Error('Please choose an image file first.'));if(!f.type.startsWith('image/'))return rej(new Error('Please choose a valid image file.'));if(f.size>5*1048576)return rej(new Error('Please choose an image smaller than 5 MB.'));
  const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(new Error('This image could not be read.'));r.readAsDataURL(f)}),{action:'Convert to Base64',download:'image-base64.txt',note:imgNote}),

'length-converter':()=>conv(LEN,'m','ft'),'weight-converter':()=>conv(WGT,'kg','lb'),'area-converter':()=>conv(ARE,'m2','ft2'),
'volume-converter':()=>conv(VOL,'l','gal'),'speed-converter':()=>conv(SPD,'kmh','mph'),'time-converter':()=>conv(TIM,'h','min'),
'data-storage-converter':()=>conv(DAT,'GB','MB','Binary system: 1 KB = 1,024 bytes, 1 MB = 1,024 KB, 1 GB = 1,024 MB and so on. 1 byte = 8 bits.'),
'temperature-converter':()=>{const o=[['C','Celsius (°C)'],['F','Fahrenheit (°F)'],['K','Kelvin (K)']],toC={C:x=>x,F:x=>(x-32)*5/9,K:x=>x-273.15},fr={C:c=>c,F:c=>c*9/5+32,K:c=>c+273.15},S={C:'°C',F:'°F',K:'K'};
  build([sel('f','Convert From',o,'C'),num('v','Temperature',{placeholder:'e.g. 25'}),sel('t','Convert To',o,'F')],v=>{const x=N(v.v,'temperature'),c=toC[v.f](x);if(c<-273.15-1e-9)err('Temperature cannot be below absolute zero.');
    return{cards:[['Result',`${sm(x)} ${S[v.f]} = ${sm(fr[v.t](c))} ${S[v.t]}`,1]]}},{action:'Convert',liveAfter:1,extra:[['Swap Units',(els,again)=>{[els.f.value,els.t.value]=[els.t.value,els.f.value];again()}]]})}
};
try{(T[root.dataset.tool]||(()=>err('This tool could not be loaded.')))()}catch(e){root.replaceChildren(h('p',{class:'error',role:'alert'},e.message))}
})();
