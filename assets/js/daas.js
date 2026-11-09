/* DaaS card: hover/focus reveal works in CSS; this adds tap-to-toggle for touch devices. */
(function(){
  var c=document.querySelector('.daas__card');
  if(!c)return;
  c.addEventListener('click',function(e){
    if(e.target.closest('a,.daas__bulb,.daas__call'))return;
    if(window.matchMedia('(hover:hover)').matches)return;
    c.classList.toggle('is-open');
  });
  c.addEventListener('keydown',function(e){
    if(e.key==='Enter'||e.key===' '){e.preventDefault();c.classList.toggle('is-open')}
    if(e.key==='Escape')c.classList.remove('is-open');
  });
})();

/* Tech tiles: pointer-following glow */
(function(){
  if(!window.matchMedia('(hover:hover)').matches)return;
  document.querySelectorAll('.tech-tile').forEach(function(t){
    t.addEventListener('pointermove',function(e){var r=t.getBoundingClientRect();t.style.setProperty('--mx',(e.clientX-r.left)+'px');t.style.setProperty('--my',(e.clientY-r.top)+'px')});
  });
})();

/* How we work: five-step framework (vertical rail, animated scene) */
(function(){
  var f=document.querySelector('[data-flow]');
  if(!f)return;
  var nodes=[].slice.call(f.querySelectorAll('.flow__node')),panels=[].slice.call(f.querySelectorAll('.flow__panel')),wins=[].slice.call(f.querySelectorAll('.flow__win')),bar=f.querySelector('.flow__bar i');
  var cur=0,timer=null,reduce=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  function restartBar(){if(!bar)return;f.classList.remove('is-playing');void bar.offsetWidth;if(timer)f.classList.add('is-playing')}
  function go(i,focus){
    cur=(i+nodes.length)%nodes.length;
    nodes.forEach(function(n,k){n.setAttribute('aria-selected',k===cur);n.tabIndex=k===cur?0:-1;n.classList.toggle('is-done',k<cur)});
    panels.forEach(function(p,k){p.hidden=k!==cur});
    f.style.setProperty('--p',cur/(nodes.length-1));
    f.setAttribute('data-step',cur+1);
    var lit=(cur+1)*Math.ceil(wins.length/nodes.length);
    wins.forEach(function(w,k){w.classList.toggle('on',k<lit)});
    restartBar();
    if(focus)nodes[cur].focus();
  }
  function stop(){if(timer){clearInterval(timer);timer=null}f.classList.remove('is-playing')}
  function start(){if(reduce||timer)return;timer=setInterval(function(){go(cur+1)},7000);restartBar()}
  nodes.forEach(function(n,i){
    n.addEventListener('click',function(){stop();go(i)});
    n.addEventListener('keydown',function(e){
      var t=null;
      if(e.key==='ArrowDown'||e.key==='ArrowRight')t=cur+1;else if(e.key==='ArrowUp'||e.key==='ArrowLeft')t=cur-1;else if(e.key==='Home')t=0;else if(e.key==='End')t=nodes.length-1;
      if(t!==null){e.preventDefault();stop();go(t,true)}
    });
  });
  f.querySelectorAll('.flow__btn').forEach(function(b){b.addEventListener('click',function(){stop();go(cur+parseInt(b.getAttribute('data-dir'),10))})});
  go(0);
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(en){en.forEach(function(x){x.isIntersecting?start():stop()})},{threshold:.5}).observe(f);
  }
  f.addEventListener('mouseenter',stop);
})();

/* DaaS bulb: click to open the call panel */
(function(){
  var b=document.querySelector('.daas__bulb'),p=document.getElementById('daas-call');
  if(!b||!p)return;
  function set(open){b.setAttribute('aria-expanded',open);if(open)p.removeAttribute('hidden');else p.setAttribute('hidden','')}
  b.addEventListener('click',function(e){e.stopPropagation();set(b.getAttribute('aria-expanded')!=='true')});
  document.addEventListener('click',function(e){if(!e.target.closest('.daas__bulb,.daas__call'))set(false)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&b.getAttribute('aria-expanded')==='true'){set(false);b.focus()}});
})();

/* Services portfolio: phase filter + tap-to-open on touch */
(function(){
  var root=document.querySelector('[data-ds]');
  if(!root)return;
  var cards=[].slice.call(root.querySelectorAll('.ds-card')),btns=[].slice.call(root.querySelectorAll('.ds-filter button')),grid=root.querySelector('.ds-grid');
  btns.forEach(function(b){
    b.addEventListener('click',function(){
      var f=b.getAttribute('data-f');
      btns.forEach(function(x){var on=x===b;x.classList.toggle('is-on',on);x.setAttribute('aria-pressed',on)});
      cards.forEach(function(c){c.classList.remove('is-open');c.hidden=!(f==='all'||c.getAttribute('data-phase')===f)});
      grid.classList.remove('is-filtering');void grid.offsetWidth;grid.classList.add('is-filtering');
    });
  });
  var touch=!window.matchMedia('(hover:hover)').matches;
  cards.forEach(function(c){
    c.addEventListener('click',function(){
      if(!touch)return;
      var open=c.classList.contains('is-open');
      cards.forEach(function(x){x.classList.remove('is-open')});
      if(!open)c.classList.add('is-open');
    });
    c.addEventListener('keydown',function(e){if(e.key==='Escape')c.classList.remove('is-open');if(e.key==='Enter'||e.key===' '){e.preventDefault();c.classList.toggle('is-open')}});
  });
})();


/* Services: open the card linked from the header menu (#svc-N) */
(function(){
  function show(){
    var id=location.hash.replace('#','');
    if(!/^svc-\d+$/.test(id))return;
    var c=document.getElementById(id),root=document.querySelector('[data-ds]');
    if(!c||!root)return;
    var all=root.querySelector('.ds-filter [data-f="all"]');
    if(c.hidden&&all)all.click();
    [].forEach.call(root.querySelectorAll('.ds-card.is-open'),function(x){x.classList.remove('is-open')});
    c.classList.add('is-open');
    setTimeout(function(){var hdr=document.querySelector('.site-header');var y=c.getBoundingClientRect().top+scrollY-(hdr?hdr.offsetHeight:0)-90;scrollTo({top:Math.max(0,y),behavior:'smooth'})},60);
  }
  window.addEventListener('hashchange',show);
  window.addEventListener('load',function(){setTimeout(show,150)});
})();

/* Header Services menu: #phase-1 / #phase-2 -> filter + scroll to the services section */
(function(){
  function go(){
    var m=/^#phase-([12])$/.exec(location.hash);if(!m)return;
    var root=document.querySelector('[data-ds]');if(!root)return;
    var b=root.querySelector('.ds-filter [data-f="'+m[1]+'"]');if(b)b.click();
    setTimeout(function(){var sec=document.getElementById('services');if(!sec)return;var h=document.querySelector('.site-header');
      scrollTo({top:Math.max(0,sec.getBoundingClientRect().top+scrollY-(h?h.offsetHeight:0)+2),behavior:'smooth'})},80);
  }
  window.addEventListener('hashchange',go);
  window.addEventListener('load',function(){setTimeout(go,200)});
})();
