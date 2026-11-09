/* DaaS card: hover/focus reveal works in CSS; this adds tap-to-toggle for touch devices. */
(function(){
  var c=document.querySelector('.daas__card');
  if(!c)return;
  c.addEventListener('click',function(e){
    if(e.target.closest('a'))return;
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
