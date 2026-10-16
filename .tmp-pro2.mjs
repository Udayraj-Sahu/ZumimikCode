import {chromium} from '@playwright/test';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:393,height:852},userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1'});
const p=await c.newPage();
const AUTH={state:{user:{id:'1',name:'QA',email:'q@q.com',role:'Champion'},token:'t',isAuthenticated:true,isOnboarded:true},version:0};
const ONB={state:{isOnboarded:true,planHookSeen:true,arenaHookSeen:true,pitchHookSeen:true,planId:'cat-fast-track',targetExam:'cat'},version:1};
const WK={state:{completed:true},version:0};
await c.addInitScript(({s})=>{for(const[k,v]of s)localStorage.setItem(k,JSON.stringify(v))},{s:[['exam-arena-auth',AUTH],['exam-arena-onboarding',ONB],['exam-arena-walkthrough',WK],['exam-arena-walkthrough-v2',WK]]});
await p.goto('http://localhost:3008/dashboard',{waitUntil:'networkidle'});
await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{
  const nav=document.querySelector('[data-tour-mobile-nav]');
  const pill=nav?.firstElementChild;
  const rect=pill?.getBoundingClientRect();
  return {pill:rect?{bottom:Math.round(rect.bottom),height:Math.round(rect.height)}:null,viewportH:window.innerHeight};
});
console.log(JSON.stringify(r));
await b.close();
