import {chromium} from '@playwright/test';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1025,height:800}});
const p=await c.newPage();
const AUTH={state:{user:{id:'1',name:'QA',email:'q@q.com',role:'Champion'},token:'t',isAuthenticated:true,isOnboarded:true},version:0};
const ONB={state:{isOnboarded:true,planHookSeen:true,arenaHookSeen:true,pitchHookSeen:true,planId:'cat-fast-track',targetExam:'cat'},version:1};
const WK={state:{completed:true},version:0};
await c.addInitScript(({s})=>{for(const[k,v]of s)localStorage.setItem(k,JSON.stringify(v))},{s:[['exam-arena-auth',AUTH],['exam-arena-onboarding',ONB],['exam-arena-walkthrough',WK],['exam-arena-walkthrough-v2',WK]]});
await p.goto('http://localhost:3008/dashboard',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(2000);
const r=await p.evaluate(()=>{
  const all=document.querySelectorAll('[class*="pl-"]');
  const matches=[...all].filter(x=>x.className.includes('1025')&&x.className.includes('pl'));
  return {found:matches.length};
});
console.log(JSON.stringify(r));
await b.close();
