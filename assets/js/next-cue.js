(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  document.querySelectorAll('a.ab-next,a.ab-hero__scroll').forEach(function(a){
    a.addEventListener('click',function(e){
      var id=(a.getAttribute('href')||'').slice(1),t=id&&document.getElementById(id);
      if(!t)return;
      e.preventDefault();
      var go=function(){
        var hdr=document.querySelector('.site-header'),off=hdr?hdr.getBoundingClientRect().height:0;
        var y=t.getBoundingClientRect().top+(window.scrollY||window.pageYOffset)-off+1;
        window.scrollTo({top:Math.max(0,y),behavior:reduce?'auto':'smooth'});
        try{history.replaceState(null,'','#'+id)}catch(_){}
        t.setAttribute('tabindex','-1');
      };
      if(reduce){go();return}
      var w=a.closest('.ab-nx')||a;w.classList.add('is-go');a.classList.add('is-go');
      setTimeout(function(){go();setTimeout(function(){w.classList.remove('is-go');a.classList.remove('is-go')},900)},260);
    });
  });
})();

(function(){
  if(window.matchMedia('(prefers-reduced-motion:reduce)').matches||!window.matchMedia('(hover:hover)').matches)return;
  document.querySelectorAll('a.ab-next').forEach(function(a){
    a.addEventListener('pointermove',function(e){var r=a.getBoundingClientRect();a.style.transform='translate('+((e.clientX-r.left-r.width/2)*.08)+'px,'+((e.clientY-r.top-r.height/2)*.22)+'px)'});
    a.addEventListener('pointerleave',function(){a.style.transform=''});
  });
})();

(function(){
  var els=document.querySelectorAll('.ab-nx');
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('is-in')});return}
  var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('is-in');io.unobserve(x.target)}})},{threshold:.35});
  els.forEach(function(e){io.observe(e)});
})();

/* Safety net: never leave content hidden after a jump.
   Anything whose top edge is at or above the bottom of the viewport is revealed,
   including elements the smooth scroll skipped past too quickly for the observer. */
(function(){
  var ticking=false;
  function reveal(){
    ticking=false;
    var vh=window.innerHeight||document.documentElement.clientHeight;
    var left=document.querySelectorAll('.reveal:not(.is-in),.ab-nx:not(.is-in)');
    left.forEach(function(el){
      if(el.getBoundingClientRect().top<vh)el.classList.add('is-in');
    });
    if(!left.length){window.removeEventListener('scroll',queue);window.removeEventListener('resize',queue)}
  }
  function queue(){if(!ticking){ticking=true;requestAnimationFrame(reveal)}}
  window.addEventListener('scroll',queue,{passive:true});
  window.addEventListener('hashchange',queue);
  window.addEventListener('load',queue);
  window.addEventListener('resize',queue);
  // the cue click scrolls programmatically: also reveal the whole target section up front
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a.ab-next,a.ab-hero__scroll');
    if(!a)return;
    var t=document.getElementById((a.getAttribute('href')||'').slice(1));
    if(t){t.querySelectorAll('.reveal,.ab-nx').forEach(function(el){el.classList.add('is-in')})}
  },true);
  queue();
})();
