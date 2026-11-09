/* DroneX Facility Services — site interactions (no dependencies) */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  /* ---------------------------------------------------------------------
     Desktop dropdowns: click/tap toggles, hover opens on fine pointers,
     Escape closes and returns focus, ArrowDown moves into the menu.
     --------------------------------------------------------------------- */
  var triggers = Array.prototype.slice.call(document.querySelectorAll(".nav-trigger"));

  function closeAll(except) {
    triggers.forEach(function (t) {
      if (t !== except) setOpen(t, false);
    });
  }
  function setOpen(trigger, open) {
    var menu = document.getElementById(trigger.getAttribute("aria-controls"));
    trigger.setAttribute("aria-expanded", open ? "true" : "false");
    if (menu) menu.classList.toggle("is-open", open);
  }

  triggers.forEach(function (trigger) {
    var item = trigger.parentElement;
    var menu = document.getElementById(trigger.getAttribute("aria-controls"));
    var hoverTimer;

    trigger.addEventListener("click", function () {
      var open = trigger.getAttribute("aria-expanded") === "true";
      closeAll(trigger);
      setOpen(trigger, !open);
    });

    trigger.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        closeAll(trigger);
        setOpen(trigger, true);
        var first = menu && menu.querySelector("a");
        if (first) first.focus();
      }
    });

    if (menu) {
      menu.addEventListener("keydown", function (e) {
        var links = Array.prototype.slice.call(menu.querySelectorAll("a"));
        var i = links.indexOf(document.activeElement);
        if (e.key === "ArrowDown") { e.preventDefault(); links[(i + 1) % links.length].focus(); }
        if (e.key === "ArrowUp") { e.preventDefault(); links[(i - 1 + links.length) % links.length].focus(); }
      });
    }

    item.addEventListener("mouseenter", function () {
      if (!finePointer.matches) return;
      clearTimeout(hoverTimer);
      closeAll(trigger);
      setOpen(trigger, true);
    });
    item.addEventListener("mouseleave", function () {
      if (!finePointer.matches) return;
      hoverTimer = setTimeout(function () { setOpen(trigger, false); }, 160);
    });
    item.addEventListener("focusout", function (e) {
      if (!item.contains(e.relatedTarget)) setOpen(trigger, false);
    });
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".has-dropdown")) closeAll();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var openTrigger = triggers.filter(function (t) { return t.getAttribute("aria-expanded") === "true"; })[0];
    if (openTrigger) { setOpen(openTrigger, false); openTrigger.focus(); }
    if (drawer && drawer.classList.contains("is-open")) { toggleDrawer(false); menuBtn.focus(); }
  });

  /* ---------------------------------------------------------------------
     Mobile drawer
     --------------------------------------------------------------------- */
  var menuBtn = document.querySelector(".menu-toggle");
  var drawer = document.getElementById("mobile-nav");

  function toggleDrawer(open) {
    if (!drawer || !menuBtn) return;
    drawer.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("nav-open", open);
    if (open) {
      drawer.removeAttribute("inert");
      var first = drawer.querySelector("a, button");
      if (first) first.focus();
    } else {
      drawer.setAttribute("inert", "");
    }
  }
  if (menuBtn && drawer) {
    drawer.setAttribute("inert", "");
    menuBtn.addEventListener("click", function () {
      toggleDrawer(menuBtn.getAttribute("aria-expanded") !== "true");
    });
    drawer.querySelectorAll(".mobile-nav__trigger").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var sub = document.getElementById(btn.getAttribute("aria-controls"));
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", open ? "false" : "true");
        if (sub) sub.hidden = open;
      });
    });
    // Close the drawer when following an in-page anchor
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { toggleDrawer(false); });
    });
    window.matchMedia("(min-width: 1241px)").addEventListener("change", function (mq) {
      if (mq.matches) toggleDrawer(false);
    });
  }

  /* ---------------------------------------------------------------------
     FAQ accordion
     --------------------------------------------------------------------- */
  document.querySelectorAll(".faq__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", open ? "false" : "true");
      if (panel) panel.hidden = open;
    });
  });

  /* ---------------------------------------------------------------------
     Reveal on scroll (CSS disables this under reduced motion)
     --------------------------------------------------------------------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------------------------------------------------------------------
     Enquiry form — validation + honest submission
     --------------------------------------------------------------------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PHONE_RE = /^[+()\-.\s\d]{7,20}$/;

  function fieldMessage(input) {
    var v = (input.value || "").trim();
    if (input.type === "checkbox") return input.required && !input.checked ? input.dataset.msgRequired : "";
    if (input.type === "radio") {
      var group = input.form.querySelectorAll('input[name="' + input.name + '"]');
      var any = Array.prototype.some.call(group, function (r) { return r.checked; });
      return input.required && !any ? input.dataset.msgRequired : "";
    }
    if (input.required && !v) return input.dataset.msgRequired || "This field is required.";
    if (v && input.type === "email" && !EMAIL_RE.test(v)) return "Enter an email address in the format name@company.com.";
    if (v && input.type === "tel" && !PHONE_RE.test(v)) return "Enter a phone number using digits, spaces and an optional + country code.";
    if (v && input.minLength > 0 && v.length < input.minLength) return input.dataset.msgShort || ("Enter at least " + input.minLength + " characters.");
    return "";
  }

  function showError(input, msg) {
    var field = input.closest(".field");
    if (!field) return;
    var err = field.querySelector(".error");
    field.classList.toggle("is-invalid", !!msg);
    if (err) err.textContent = msg;
    var targets = input.type === "radio" ? field.querySelectorAll("input") : [input];
    Array.prototype.forEach.call(targets, function (t) {
      t.setAttribute("aria-invalid", msg ? "true" : "false");
    });
  }

  function validate(form) {
    var firstBad = null;
    var seenRadio = {};
    form.querySelectorAll("input, select, textarea").forEach(function (input) {
      if (input.closest(".hp") || input.type === "hidden") return;
      if (input.type === "radio") {
        if (seenRadio[input.name]) return;
        seenRadio[input.name] = true;
      }
      var msg = fieldMessage(input);
      showError(input, msg);
      if (msg && !firstBad) firstBad = input;
    });
    return firstBad;
  }

  function setStatus(form, kind, title, body) {
    var box = form.querySelector(".form-status");
    if (!box) return;
    box.className = "form-status form-status--" + kind + " is-visible";
    box.innerHTML = "<strong></strong><span></span>";
    box.querySelector("strong").textContent = title;
    box.querySelector("span").textContent = body;
    box.focus();
  }

  function collect(form) {
    var data = {};
    new FormData(form).forEach(function (value, key) { data[key] = typeof value === "string" ? value.trim() : value; });
    data.page = window.location.pathname;
    data.submittedAt = new Date().toISOString();
    return data;
  }

  document.querySelectorAll("form[data-enquiry]").forEach(function (form) {
    var submit = form.querySelector('[type="submit"]');
    var submitLabel = submit ? submit.querySelector(".label") : null;
    var defaultLabel = submitLabel ? submitLabel.textContent : "";

    form.addEventListener("input", function (e) {
      var field = e.target.closest(".field");
      if (field && field.classList.contains("is-invalid")) showError(e.target, fieldMessage(e.target));
    });
    form.addEventListener("change", function (e) {
      var field = e.target.closest(".field");
      if (field && field.classList.contains("is-invalid")) showError(e.target, fieldMessage(e.target));
    });
    form.querySelectorAll("input, select, textarea").forEach(function (input) {
      input.addEventListener("blur", function () {
        if (input.type === "radio" || input.type === "checkbox") return;
        if ((input.value || "").trim()) showError(input, fieldMessage(input));
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector(".form-status");
      if (status) status.className = "form-status";

      var bad = validate(form);
      if (bad) {
        var count = form.querySelectorAll(".field.is-invalid").length;
        setStatus(form, "error", "Check the highlighted fields", count + (count === 1 ? " field needs" : " fields need") + " attention before we can send your request.");
        bad.focus();
        return;
      }

      // Honeypot: bots fill hidden fields. Quietly stop.
      var hp = form.querySelector(".hp input");
      if (hp && hp.value) return;

      var cfg = window.DRONEX_CONFIG || {};
      if (!cfg.FORM_ENDPOINT) {
        setStatus(form, "notice", "Your request has not been sent",
          "Online submission is not connected yet on this preview site. Nothing you entered has been stored or delivered. Please contact DroneX directly once their approved contact details are published.");
        if (window.console) console.info("[DroneX] Form valid. No FORM_ENDPOINT configured in assets/js/config.js — submission skipped.", collect(form));
        return;
      }

      form.classList.add("is-loading");
      if (submit) { submit.disabled = true; submit.setAttribute("aria-disabled", "true"); }
      if (submitLabel) submitLabel.textContent = "Sending request…";

      var ctrl = "AbortController" in window ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, cfg.FORM_TIMEOUT_MS || 15000);

      fetch(cfg.FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(collect(form)),
        signal: ctrl ? ctrl.signal : undefined
      }).then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        var success = form.parentElement.querySelector(".form-success");
        form.hidden = true;
        if (success) { success.hidden = false; success.focus(); }
        if (window.dataLayer) window.dataLayer.push({ event: "enquiry_submitted", form: form.dataset.enquiry });
      }).catch(function (err) {
        var timedOut = err && err.name === "AbortError";
        setStatus(form, "error", "Your request was not sent",
          timedOut ? "The server took too long to respond. Your details are still in the form — please try again."
                   : "Something went wrong on our side. Your details are still in the form — please try again in a moment.");
      }).then(function () {
        clearTimeout(timer);
        form.classList.remove("is-loading");
        if (submit) { submit.disabled = false; submit.removeAttribute("aria-disabled"); }
        if (submitLabel) submitLabel.textContent = defaultLabel;
      });
    });
  });

  /* Contact page: adapt to ?type=consultation | partner from secondary CTAs */
  var params = new URLSearchParams(window.location.search);
  var type = params.get("type");
  var title = document.querySelector("[data-contact-title]");
  if (title && type) {
    if (type === "partner") {
      title.textContent = "Partner with DroneX";
      var svc = document.querySelector('select[name="service"]');
      if (svc) svc.value = "Partnership enquiry";
    } else if (type === "consultation") {
      title.textContent = "Request a consultation";
    }
    var ft = document.querySelector('input[name="formType"]');
    if (ft) ft.value = ft.value + ":" + type.replace(/[^a-z]/g, "");
  }

  /* Contact page: ?service= preselects the service of interest */
  var svcMap = { inspection: "Drone Inspection & Visual Surveys", facade: "Cleaning / Clearing via Drone" };
  var svcSel = document.querySelector('select[name="service"]');
  if (svcSel && svcMap[params.get("service")]) svcSel.value = svcMap[params.get("service")];

  /* Design switcher (staging builds only) */
  var sw = document.querySelector(".design-switch");
  if (sw) {
    var label = sw.querySelector("[data-design-label]");
    var applyDesign = function (d, persist) {
      var btn = sw.querySelector('[data-design="' + d + '"]') || sw.querySelector('[data-design="a"]');
      d = btn.getAttribute("data-design");
      document.documentElement.setAttribute("data-theme", d);
      sw.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      if (label) label.textContent = "Design " + d.toUpperCase() + ": " + btn.title;
      if (persist) {
        try { localStorage.setItem("dronex-design", d); } catch (e) {}
        var u = new URL(window.location.href); u.searchParams.set("design", d);
        history.replaceState(null, "", u);
      }
    };
    applyDesign(document.documentElement.getAttribute("data-theme") || "a", false);
    sw.addEventListener("click", function (e) {
      var b = e.target.closest("[data-design]");
      if (b) applyDesign(b.getAttribute("data-design"), true);
    });
  }

  /* Home: right-side section rail — highlights the section in view */
  var rail = document.querySelector(".section-rail");
  var heroEl = document.querySelector(".hero");
  if (rail && "IntersectionObserver" in window) {
    var railLinks = {};
    rail.querySelectorAll("[data-rail]").forEach(function (a) { railLinks[a.getAttribute("data-rail")] = a; });
    var railIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(railLinks).forEach(function (k) { railLinks[k].removeAttribute("aria-current"); });
        var link = railLinks[en.target.id];
        if (link) link.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(railLinks).forEach(function (id) { var el = document.getElementById(id); if (el) railIO.observe(el); });
    if (heroEl) {
      new IntersectionObserver(function (en) {
        rail.classList.toggle("is-visible", !en[0].isIntersecting);
      }, { threshold: 0.15 }).observe(heroEl);
    }
  }

  /* Respect reduced motion for the SVG drone animation (SMIL ignores CSS) */
  var flight = document.querySelector(".hero__flight svg");
  if (flight && window.matchMedia("(prefers-reduced-motion: reduce)").matches && flight.pauseAnimations) flight.pauseAnimations();

  /* Footer year */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();

/* Site-wide back-to-top button (skipped where a page ships its own) */
(function(){
  if(document.querySelector('.ab-top,.to-top'))return;
  var b=document.createElement('button');
  b.className='to-top';
  b.type='button';b.setAttribute('aria-label','Back to top');
  b.innerHTML='<svg class="to-top__ring" viewBox="0 0 48 48" aria-hidden="true"><circle class="to-top__track" cx="24" cy="24" r="22"/><circle class="to-top__bar" cx="24" cy="24" r="22"/></svg><svg class="to-top__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  var bar=b.querySelector('.to-top__bar'),C=2*Math.PI*22;bar.style.strokeDasharray=C;
  document.body.appendChild(b);
  var on=false,t=false;
  function upd(){t=false;var max=document.documentElement.scrollHeight-window.innerHeight;bar.style.strokeDashoffset=C*(1-(max>0?Math.min(1,window.scrollY/max):0));var s=window.scrollY>600;if(s!==on){on=s;b.classList.toggle('is-on',s)}}
  window.addEventListener('scroll',function(){if(!t){t=true;requestAnimationFrame(upd)}},{passive:true});
  b.addEventListener('click',function(){var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;window.scrollTo({top:0,behavior:r?'auto':'smooth'})});
  upd();
})();

/* Industries menu: "Segments" opens the two segment panels (hover or click) */
(function(){
  var dd=document.getElementById('dd-industries');if(!dd)return;
  var t=dd.querySelector('.dd-segtrig');if(!t)return;
  var fine=window.matchMedia('(hover:hover)');
  function set(o){dd.classList.toggle('seg-open',o);t.setAttribute('aria-expanded',o?'true':'false')}
  t.addEventListener('click',function(){set(!dd.classList.contains('seg-open'))});
  t.addEventListener('mouseenter',function(){if(fine.matches)set(true)});
  new MutationObserver(function(){if(!dd.classList.contains('is-open'))set(false)}).observe(dd,{attributes:true,attributeFilter:['class']});
})();
