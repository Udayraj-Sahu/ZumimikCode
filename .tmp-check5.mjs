import {chromium} from '@playwright/test';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:390,height:844}});
const p=await c.newPage();
await p.goto('http://localhost:3005/dashboard',{waitUntil:'networkidle'});
await p.waitForTimeout(2000);
const r=await p.evaluate(()=>{
  const nav=document.querySelector('[data-tour-mobile-nav]');
  if(!nav) return {found:false};
  const cs=getComputedStyle(nav);
  const rect=nav.getBoundingClientRect();
  return {found:true,display:cs.display,visibility:cs.visibility,opacity:cs.opacity,pointerEvents:cs.pointerEvents,rect:{bottom:rect.bottom,height:rect.height}};
});
console.log(r);
await b.close();
