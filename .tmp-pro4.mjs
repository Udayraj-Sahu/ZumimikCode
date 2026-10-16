import {chromium} from '@playwright/test';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:430,height:932},isMobile:true,hasTouch:true});
const p=await c.newPage();
const AUTH={state:{user:{id:'1',name:'QA',email:'q@q.com',role:'Champion'},token:'t',isAuthenticated:true,isOnboarded:true},version:0};
const ONB={state:{isOnboarded:true,planHookSeen:true,arenaHookSeen:true,pitchHookSeen:true,planId:'cat-fast-track',targetExam:'cat'},version:1};
const WK={state:{completed:true},version:0};
await c.addInitScript(({s})=>{for(const[k,v]of s)localStorage.setItem(k,JSON.stringify(v))},{s:[['exam-arena-auth',AUTH],['exam-arena-onboarding',ONB],['exam-arena-walkthrough',WK],['exam-arena-walkthrough-v2',WK]]});
await p.goto('http://localhost:3008/dashboard',{waitUntil:'networkidle'});
await p.waitForTimeout(1000);
await p.screenshot({path:'.tmp-iphone.png'});
const r=await p.evaluate(()=>{
  const nav=document.querySelector('[data-tour-mobile-nav]');
  const pill=nav?.firstElementChild;
  const pr=pill?.getBoundingClientRect();
  return {visible:!!pill && pr?.bottom>0 && pr?.bottom<=window.innerHeight+10};
});
console.log(r);
await b.close();
