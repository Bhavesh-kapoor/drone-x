/* Mark sections that are off-screen so their animations pause (see perf.css). */
(function(){
  if(!('IntersectionObserver' in window))return;
  var targets=document.querySelectorAll('main > section, .hero, .page-hero, .ab-hero, .site-footer');
  var io=new IntersectionObserver(function(en){
    en.forEach(function(x){x.target.classList.toggle('is-off',!x.isIntersecting)});
  },{rootMargin:'80px 0px 80px 0px'});
  targets.forEach(function(t){io.observe(t)});
})();
