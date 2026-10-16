const {chromium}=require('@playwright/test');
(async()=>{
  const b=await chromium.launch();
  const cases=[[390,844],[768,1024],[1024,1366],[1025,800],[1280,800]];
  for(const [w,h] of cases){
    const c=await b.newContext({viewport:{width:w,height:h}});
    const p=await c.newPage();
    await p.goto('http://localhost:3005/dashboard',{waitUntil:'networkidle'});
    await p.waitForTimeout(900);
    const r=await p.evaluate(()=>{
      const nav=document.querySelector('[data-tour-mobile-nav]');
      const pill=nav?.querySelector('div');
      const aside=document.querySelector('aside');
      const toggle=document.querySelector('button[aria-label*=theme],button[aria-label*=Theme],button[aria-label*=Toggle]');
      const rect=(el)=>el?el.getBoundingClientRect():null;
      const cs=(el)=>el?getComputedStyle(el):null;
      const vis=(el)=>{const s=cs(el);if(!el||s.display==='none'||s.visibility==='hidden')return false;const rr=rect(el);return rr&&rr.width>0&&rr.height>0&&parseFloat(s.opacity)>0.01;};
      const h1m=[...document.querySelectorAll('h1')].find(e=>e.className.includes('md:hidden'));
      const h1d=[...document.querySelectorAll('h1')].find(e=>!e.className.includes('md:hidden'));
      const cols=document.querySelector('.md\\:columns-2');
      const sb=aside&&cs(aside).display!=='none'?Math.round(rect(aside).width):0;
      return {nv:vis(nav),nb:rect(nav)?.bottom,sb,sbd:aside?cs(aside).display:'M',tog:vis(toggle),h1m:vis(h1m),h1d:vis(h1d),cc:cols?cs(cols).columnCount:'',ovf:document.documentElement.scrollWidth-document.documentElement.clientWidth};
    });
    console.log(w+'x'+h+': nv='+r.nv+'('+Math.round(r.nb||0)+'/'+h+') sb='+r.sb+'('+r.sbd+') tog='+r.tog+' h1m='+r.h1m+' h1d='+r.h1d+' cols='+r.cc+' ovf='+r.ovf);
    await c.close();
  }
  await b.close();
})();
