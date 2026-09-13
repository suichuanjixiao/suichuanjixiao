(function(){
"use strict";
var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var FINE = window.matchMedia('(pointer: fine)').matches;

/* ---------- 走马灯内容复制（无缝循环） ---------- */
var mq = document.getElementById('mqTrack');
if(mq){ mq.innerHTML += mq.innerHTML; }

/* ---------- 预加载与入场编排 ---------- */
var loader = document.getElementById('loader');
var hero = document.getElementById('top');
var t0 = performance.now();
var revealed = false;
function revealPage(){
  if(revealed) return; revealed = true;
  if(loader) loader.classList.add('done');
  document.body.classList.remove('locked');
  if(hero) hero.classList.add('intro');
}
window.addEventListener('load', function(){
  var wait = Math.max(0, 1150 - (performance.now() - t0));
  setTimeout(revealPage, RM ? 0 : wait);
});
setTimeout(revealPage, 4200); /* 兜底 */

/* ---------- 滚动统一处理 ---------- */
var hd = document.getElementById('hd');
var bar = document.getElementById('progress');
var heroPar = document.getElementById('heroPar');
var heroInner = document.getElementById('heroInner');
var toTop = document.getElementById('toTop');
var progRing = toTop ? toTop.querySelector('.prog') : null;
var CIRC = 2 * Math.PI * 24;
if(progRing){ progRing.style.strokeDasharray = CIRC; progRing.style.strokeDashoffset = CIRC; }
var ticking = false;

function onScroll(){
  if(ticking) return; ticking = true;
  requestAnimationFrame(update);
}
function update(){
  var y = window.scrollY || 0;
  var dh = document.documentElement.scrollHeight - window.innerHeight;
  var p = dh > 0 ? y / dh : 0;
  if(hd) hd.classList.toggle('scrolled', y > 46);
  if(bar) bar.style.width = (p * 100) + '%';
  if(toTop){
    toTop.classList.toggle('show', y > 620);
    if(progRing) progRing.style.strokeDashoffset = CIRC * (1 - p);
  }
  if(!RM && hero){
    var hh = hero.offsetHeight || 1;
    if(y < hh){
      if(heroPar) heroPar.style.transform = 'translate3d(0,' + (y * 0.26) + 'px,0)';
      if(heroInner){
        heroInner.style.transform = 'translate3d(0,' + (y * 0.16) + 'px,0)';
        heroInner.style.opacity = Math.max(0, 1 - y / (hh * 0.72));
      }
    }
  }
  ticking = false;
}
window.addEventListener('scroll', onScroll, { passive: true });
update();

/* ---------- 回到顶部 ---------- */
if(toTop){
  toTop.addEventListener('click', function(){
    window.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' });
  });
}

/* ---------- 移动端菜单 ---------- */
var burger = document.getElementById('burger');
var mnav = document.getElementById('mnav');
function closeMenu(){
  document.body.classList.remove('mnav-open');
  document.body.classList.remove('locked');
  if(burger) burger.setAttribute('aria-expanded', 'false');
}
if(burger && mnav){
  burger.addEventListener('click', function(){
    var open = document.body.classList.toggle('mnav-open');
    if(open){ document.body.classList.add('locked'); } else { document.body.classList.remove('locked'); }
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  mnav.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', closeMenu);
  });
  mnav.addEventListener('click', function(e){
    if(e.target === mnav) closeMenu();
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closeMenu();
  });
}

/* ---------- 显现动画 ---------- */
var reveals = document.querySelectorAll('.reveal, [data-stagger]');
if('IntersectionObserver' in window && !RM){
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  reveals.forEach(function(el){
    var kids = el.hasAttribute('data-stagger') ? el.children : [];
    for(var i = 0; i < kids.length; i++){
      kids[i].style.transitionDelay = (i * 0.09).toFixed(2) + 's';
    }
    io.observe(el);
  });
}else{
  reveals.forEach(function(el){ el.classList.add('in'); });
}

/* ---------- 数字滚动 ---------- */
function runCount(el){
  var target = parseInt(el.getAttribute('data-count'), 10) || 0;
  if(RM){ el.textContent = target; return; }
  var dur = 1900, t0 = performance.now();
  function frame(now){
    var pr = Math.min((now - t0) / dur, 1);
    var e = 1 - Math.pow(1 - pr, 3);
    el.textContent = Math.round(target * e);
    if(pr < 1) requestAnimationFrame(frame);
    else el.textContent = target;
  }
  requestAnimationFrame(frame);
}
var counters = document.querySelectorAll('[data-count]');
if('IntersectionObserver' in window && !RM){
  var cio = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){ runCount(en.target); cio.unobserve(en.target); }
    });
  }, { threshold: 0.5 });
  counters.forEach(function(el){ cio.observe(el); });
}else{
  counters.forEach(function(el){ el.textContent = el.getAttribute('data-count'); });
}

/* ---------- 数据条动画 ---------- */
var bars = document.querySelectorAll('.bar-item .fi');
if(bars.length){
  if('IntersectionObserver' in window && !RM){
    var bio = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          var f = en.target;
          f.style.width = f.getAttribute('data-w') || '0';
          bio.unobserve(f);
        }
      });
    }, { threshold: 0.4 });
    bars.forEach(function(f){ bio.observe(f); });
  }else{
    bars.forEach(function(f){ f.style.width = f.getAttribute('data-w') || '0'; });
  }
}

/* ---------- 发展历程时间轴 ---------- */
var tl = document.getElementById('timeline');
if(tl){
  if('IntersectionObserver' in window && !RM){
    var tio = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ tl.classList.add('play'); tio.unobserve(tl); }
      });
    }, { threshold: 0.3 });
    tio.observe(tl);
  }else{
    tl.classList.add('play');
  }
}

/* ---------- 导航高亮（scrollspy） ---------- */
var spyLinks = document.querySelectorAll('.nu a[data-spy]');
if(spyLinks.length && 'IntersectionObserver' in window){
  var sections = [];
  spyLinks.forEach(function(a){
    var sec = document.getElementById(a.getAttribute('data-spy'));
    if(sec) sections.push(sec);
  });
  var sio = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){
        spyLinks.forEach(function(a){
          a.classList.toggle('on', a.getAttribute('data-spy') === en.target.id);
        });
      }
    });
  }, { rootMargin: '-38% 0px -55% 0px' });
  sections.forEach(function(s){ sio.observe(s); });
}

/* ---------- 3D 倾斜卡片 ---------- */
if(FINE && !RM){
  document.querySelectorAll('[data-tilt]').forEach(function(card){
    card.style.transition = 'transform .55s cubic-bezier(.22,.61,.28,1), box-shadow .55s';
    card.addEventListener('mousemove', function(e){
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;
      var y = (e.clientY - r.top) / r.height;
      card.style.transition = 'transform .1s ease-out, box-shadow .4s';
      card.style.transform = 'perspective(1000px) rotateX(' + ((0.5 - y) * 6.5).toFixed(2) + 'deg) rotateY(' + ((x - 0.5) * 8).toFixed(2) + 'deg) translateY(-5px)';
      card.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
      card.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
    });
    card.addEventListener('mouseleave', function(){
      card.style.transition = 'transform .65s cubic-bezier(.22,.61,.28,1), box-shadow .55s';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });
}

/* ---------- 磁吸按钮 ---------- */
if(FINE && !RM){
  document.querySelectorAll('.magnetic').forEach(function(btn){
    btn.addEventListener('mousemove', function(e){
      var r = btn.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2);
      var dy = e.clientY - (r.top + r.height / 2);
      btn.style.translate = (dx * 0.14).toFixed(1) + 'px ' + (dy * 0.2).toFixed(1) + 'px';
    });
    btn.addEventListener('mouseleave', function(){
      btn.style.translate = '0px 0px';
    });
  });
}

/* ---------- 金色光尘粒子 ---------- */
var cv = document.getElementById('dust');
if(cv && !RM){
  var ctx = cv.getContext('2d');
  var W = 0, H = 0, DPR = 1, parts = [], heroVisible = true, rafId = null;
  var mouse = { x: -9999, y: -9999 };

  function resize(){
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * DPR; cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    seed();
  }
  function seed(){
    var n = W < 720 ? 44 : (W < 1200 ? 76 : 118);
    parts = [];
    for(var i = 0; i < n; i++){
      parts.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.8 + Math.random() * 3.1,
        vx: (Math.random() - 0.5) * 0.26,
        vy: -(0.07 + Math.random() * 0.34),
        tw: Math.random() * Math.PI * 2,
        tws: 0.009 + Math.random() * 0.024,
        a: 0.3 + Math.random() * 0.55,
        big: Math.random() > 0.74
      });
    }
    var orbs = W < 720 ? 3 : 6;
    for(var j = 0; j < orbs; j++){
      parts.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 26 + Math.random() * 62,
        vx: (Math.random() - 0.5) * 0.1,
        vy: -(0.03 + Math.random() * 0.08),
        tw: Math.random() * Math.PI * 2,
        tws: 0.004 + Math.random() * 0.008,
        a: 0.05 + Math.random() * 0.06,
        big: true
      });
    }
  }
  function tick(){
    if(!heroVisible){ rafId = null; return; }
    ctx.clearRect(0, 0, W, H);
    for(var i = 0; i < parts.length; i++){
      var p = parts[i];
      p.x += p.vx; p.y += p.vy; p.tw += p.tws;
      var dx = p.x - mouse.x, dy = p.y - mouse.y;
      var d2 = dx * dx + dy * dy;
      if(d2 < 12100){
        var d = Math.sqrt(d2) || 1;
        p.x += (dx / d) * 1.15; p.y += (dy / d) * 1.15;
      }
      if(p.y < -8) { p.y = H + 8; p.x = Math.random() * W; }
      if(p.x < -8) p.x = W + 8;
      if(p.x > W + 8) p.x = -8;
      var alpha = p.a * (0.55 + 0.45 * Math.sin(p.tw));
      if(p.r > 14){
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, 'rgba(232,196,138,' + alpha.toFixed(3) + ')');
        g.addColorStop(0.55, 'rgba(226,186,120,' + (alpha * 0.4).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(226,186,120,0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }else{
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(230,196,138,' + alpha.toFixed(3) + ')';
        if(p.big){
          ctx.shadowColor = 'rgba(230,196,138,' + (alpha * 0.9).toFixed(3) + ')';
          ctx.shadowBlur = 14;
        }else{
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      }
    }
    ctx.shadowBlur = 0;
    rafId = requestAnimationFrame(tick);
  }
  function wake(){
    if(heroVisible && rafId === null) rafId = requestAnimationFrame(tick);
  }
  window.addEventListener('resize', function(){
    resize();
  });
  cv.parentElement.addEventListener('mousemove', function(e){
    var r = cv.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  cv.parentElement.addEventListener('mouseleave', function(){
    mouse.x = -9999; mouse.y = -9999;
  });
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(entries){
      heroVisible = entries[0].isIntersecting;
      wake();
    }, { threshold: 0.02 }).observe(hero);
  }
  resize();
  wake();
}

/* ---------- 图片灯箱预览 ---------- */
var lb = document.createElement('div');
lb.id = 'lightbox';
lb.setAttribute('role', 'dialog');
lb.setAttribute('aria-label', '图片预览');
lb.innerHTML = '<img alt="预览大图"><button class="lb-close" aria-label="关闭预览">&times;</button>';
document.body.appendChild(lb);
var lbImg = lb.querySelector('img');
var lbOpened = false;
function lbOpen(src){
  lbImg.src = src;
  lb.classList.add('on');
  document.body.classList.add('locked');
  lbOpened = true;
}
function lbClose(){
  lb.classList.remove('on');
  document.body.classList.remove('locked');
  lbOpened = false;
}
document.addEventListener('click', function(e){
  var card = e.target.closest('.g-card:not(.pano-card), .img-card, .qr-frame, .plan-fig');
  if(card){
    var im = card.querySelector('img');
    if(im && im.src) lbOpen(im.src);
    return;
  }
  if(e.target.closest('.lb-close') || e.target === lb) lbClose();
});
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape' && lbOpened) lbClose();
  if(e.key === 'Enter'){
    var f = document.activeElement;
    if(f && (f.classList.contains('qr-frame') || f.classList.contains('plan-fig'))){
      var im = f.querySelector('img');
      if(im && im.src) lbOpen(im.src);
    }
  }
});
})();
