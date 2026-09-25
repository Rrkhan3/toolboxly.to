/* ToolBoxy ads — central config. Set a format to false to disable it on every page.
   Provider scripts are loaded DIRECTLY on the page (no iframe/sandbox wrapper), each container exists
   before its script, each format loads once per page, banners load one after another so the global
   atOptions is never overwritten before invoke.js reads it, and every failure is contained.
   Debug: open any page with ?adsdebug=1 to log ad status in the browser console. */
window.ADS_CONFIG=window.ADS_CONFIG||{nativeBanner:true,banner320x50:true,banner300x250:true,socialBar:true};
(()=>{try{
const C=window.ADS_CONFIG,S=window.ToolBoxyAds={status:{},debug:/[?&]adsdebug=1/.test(location.search)};
const log=(k,v)=>{S.status[k]=v;if(S.debug)console.info('[ToolBoxy ads]',k,v)};
/* New provider units (2026) */
const NATIVE_ID='container-58bb1cd370c508613c19043160d74684';
const NATIVE_SRC='https://pl31507521.profitableratecpmnetwork.com/58bb1cd370c508613c19043160d74684/invoke.js';
const SOCIAL_SRC='https://pl31507520.profitableratecpmnetwork.com/1d/81/cb/1d81cb9a33937bc70d191e3f2e6ad01b.js';
const B={
  b320:{key:'b6e7cd4156ea928ea222226cd2c4921c',width:320,height:50,cls:'ad-banner-320x50'},
  b300:{key:'ee7fa95f6d2f4e1eaff174f474259930',width:300,height:250,cls:'ad-banner-300x250'}
};
const used=new Set();
const inject=(src,parent,name,done,attrs)=>{const s=document.createElement('script');s.src=src;s.async=true;for(const k in attrs||{})s.setAttribute(k,attrs[k]);
  let fin=false;const end=ok=>{if(fin)return;fin=true;log(name,ok?'loaded':'failed');try{done&&done(ok)}catch(e){}};
  s.onload=()=>end(true);s.onerror=()=>end(false);setTimeout(()=>end(false),8000);parent.append(s);log(name,'requested')};
const collapseIfEmpty=(el,test,ms)=>setTimeout(()=>{try{if(!test()){el.hidden=true;log(el.dataset.ad,'collapsed (provider returned nothing)')}}catch(e){}},ms);
/* banners: one at a time (global atOptions must not be overwritten mid-load) */
const q=[];let busy=false;
const pump=()=>{if(busy||!q.length)return;busy=true;const t=q.shift();try{t(()=>{busy=false;pump()})}catch(e){busy=false;pump()}};
const banner=(el,box,f)=>q.push(done=>{const b=B[f];box.classList.add(b.cls);box.style.minHeight=b.height+'px';
  window.atOptions={key:b.key,format:'iframe',height:b.height,width:b.width,params:{}};
  inject('https://www.highrevenueformat.com/'+b.key+'/invoke.js',box,f,ok=>{if(!ok)el.hidden=true;done()});
  collapseIfEmpty(el,()=>box.querySelector('iframe'),7000)});
const native=(el,box)=>{box.classList.add('ad-native-box');const d=document.createElement('div');d.id=NATIVE_ID;box.append(d);
  inject(NATIVE_SRC,box,'native',ok=>{if(!ok)el.hidden=true},{'data-cfasync':'false','async':'async'});
  collapseIfEmpty(el,()=>d.childElementCount>0||d.textContent.trim(),9000)};
const mob=()=>matchMedia('(max-width: 767px)').matches;
const pick=k=>{if(k==='native')return C.nativeBanner?'native':null;
  const a=C.banner320x50?'b320':null,b=C.banner300x250?'b300':null,p=mob()?(a||b):(b||a),o=p==='b320'?b:p==='b300'?a:null;return k==='banner'?p:o};
const start=()=>{try{
  document.querySelectorAll('.ad-wrap[data-ad]').forEach(el=>{try{
    const f=pick(el.dataset.ad),box=el.querySelector('.ad-box');if(!f||!box||used.has(f)){el.hidden=true;return}used.add(f);
    const go=()=>{try{f==='native'?native(el,box):banner(el,box,f);pump()}catch(e){el.hidden=true}};
    f==='native'?go():('IntersectionObserver'in window?new IntersectionObserver((en,ob)=>{if(en.some(x=>x.isIntersecting)){ob.disconnect();go()}},{rootMargin:'500px'}).observe(el):go());
  }catch(e){el.hidden=true}});
  if(C.socialBar&&!document.querySelector('script[data-ad-social]'))inject(SOCIAL_SRC,document.body,'socialBar',null,{'data-ad-social':'1'});
}catch(e){}};
document.readyState==='complete'?setTimeout(start,0):addEventListener('load',()=>setTimeout(start,0));
}catch(e){}})();
