import {chromium} from '@playwright/test';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:390,height:844}});
const p=await c.newPage();
await p.goto('http://localhost:3005/dashboard',{waitUntil:'networkidle'});
await p.waitForTimeout(2000);
const r=await p.evaluate(()=>{
  const nav=document.querySelector('[data-tour-mobile-nav]');
  const pill=nav?.firstElementChild;
  const aside=document.querySelector('aside');
  const toggle=document.querySelector('button[aria-label*=theme],button[aria-label*=Theme]');
  const rect=(el)=>el?el.getBoundingClientRect():null;
  const cs=(el)=>el?getComputedStyle(el):null;
  const vis=(el)=>{const s=cs(el);if(!el||s.display==='none'||s.visibility==='hidden'||s.pointerEvents==='none')return false;const rr=rect(el);if(!rr||rr.width<=0||rr.height<=0)return false;const op=parseFloat(s.opacity);if(isNaN(op)||op<0.05)return false;return rr.bottom>=0&&rr.top<=window.innerHeight;};
  return {nv:vis(nav),navDisp:nav?cs(nav).display:'M',pillOp:pill?cs(pill).opacity:'x',nb:rect(nav)?.bottom,ht:window.innerHeight,tog:vis(toggle)};
});
console.log(r);
await b.close();
