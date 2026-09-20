(function(){

  try {
    // Dynamic header on scroll
    var header = document.querySelector('header.site-header');
    if(header){
      var onHeaderScroll = function(){
        header.classList.toggle('scrolled', window.scrollY > 12);
      };
      window.addEventListener('scroll', onHeaderScroll, { passive:true });
      onHeaderScroll();
    }
  } catch(e){}

  try {
    // Burger menu overlay: use a horizontal site photo as a dim background
    var overlay = document.getElementById('menuOverlay');
    if(overlay && overlay.dataset.bg){
      overlay.style.backgroundImage = "url('" + overlay.dataset.bg + "')";
    }
  } catch(e){}

  try {
    // Size chart modal (shared across all product pages)
    var scLinks = document.querySelectorAll('.size-chart-link');
    var scModal = document.getElementById('sizeChartModal');
    if(scLinks.length && scModal){
      scLinks.forEach(function(link){
        link.addEventListener('click', function(e){
          e.preventDefault();
          scModal.classList.add('open');
        });
      });
      scModal.addEventListener('click', function(e){
        if(e.target.closest('.size-modal-close') || e.target.classList.contains('size-modal-backdrop')){
          scModal.classList.remove('open');
        }
      });
    }
  } catch(e){}

  try {
    // Catalog filter: sort by price + list/grid view toggle
    document.querySelectorAll('.catalog-body').forEach(function(body){
      var blocks = Array.prototype.slice.call(body.querySelectorAll('.product-block')).filter(function(b){
        return b.querySelector('.pd-price');
      });
      if(!blocks.length) return;

      var listParent = blocks[0].parentNode;
      var originalOrder = blocks.slice();
      var tileGrid = body.querySelector('.tile-grid');
      var filterBtn = document.querySelector('[data-filter-target="' + body.id + '"]');
      var filterPanel = document.getElementById(body.dataset.filterPanel);

      var priceOf = function(block){
        var priceText = block.querySelector('.pd-price').textContent;
        var digitsOnly = priceText.replace(/\D/g, '');
        return parseInt(digitsOnly, 10) || 0;
      };

      if(tileGrid){
        blocks.forEach(function(block, i){
          var img = block.querySelector('.pd-photo img, .pd-slide img');
          var imgSrc = img ? img.src : (block.dataset.thumb || '');
          var title = block.querySelector('h2');
          var price = block.querySelector('.pd-price');
          var tile = document.createElement('div');
          tile.className = 'tile-card';
          tile.dataset.index = i;
          tile.innerHTML =
            '<div class="tile-photo"><img src="' + imgSrc + '" alt="' + (title ? title.textContent : '') + '"></div>' +
            '<div class="tile-title">' + (title ? title.textContent : '') + '</div>' +
            '<div class="tile-price">' + (price ? price.textContent : '') + '</div>';
          tile.addEventListener('click', function(){
            body.classList.add('detail-open');
            blocks.forEach(function(b){ b.classList.remove('detail-active'); });
            block.classList.add('detail-active');
            block.scrollIntoView({ behavior:'smooth', block:'start' });
          });
          tileGrid.appendChild(tile);
        });
      }

      blocks.forEach(function(block){
        if(block.querySelector('.back-to-catalog')) return;
        var back = document.createElement('button');
        back.className = 'back-to-catalog';
        back.type = 'button';
        back.innerHTML = '‹ Усі товари';
        back.addEventListener('click', function(){
          body.classList.remove('detail-open');
          window.scrollTo({ top: tileGrid ? tileGrid.offsetTop - 100 : 0, behavior:'smooth' });
        });
        block.insertBefore(back, block.firstChild);
      });

      var sortBlocks = function(dir){
        var sorted = blocks.slice().sort(function(a, b){
          return dir === 'asc' ? priceOf(a) - priceOf(b) : priceOf(b) - priceOf(a);
        });
        sorted.forEach(function(b){ listParent.appendChild(b); });
        if(tileGrid){
          var tiles = Array.prototype.slice.call(tileGrid.children);
          sorted.forEach(function(b){
            var idx = blocks.indexOf(b);
            var matchingTile = tiles.filter(function(t){ return parseInt(t.dataset.index, 10) === idx; })[0];
            if(matchingTile) tileGrid.appendChild(matchingTile);
          });
        }
      };

      var setView = function(mode){
        body.classList.toggle('view-grid', mode === 'grid');
        body.classList.remove('detail-open');
      };

      if(filterPanel){
        var priceOptions = filterPanel.querySelectorAll('[data-sort]');
        var viewOptions = filterPanel.querySelectorAll('[data-view]');
        priceOptions.forEach(function(opt){
          opt.addEventListener('click', function(){
            priceOptions.forEach(function(o){ o.classList.remove('active'); });
            opt.classList.add('active');
          });
        });
        viewOptions.forEach(function(opt){
          opt.addEventListener('click', function(){
            viewOptions.forEach(function(o){ o.classList.remove('active'); });
            opt.classList.add('active');
          });
        });
        var applyBtn = filterPanel.querySelector('.filter-apply');
        if(applyBtn){
          applyBtn.addEventListener('click', function(){
            var activeSort = filterPanel.querySelector('[data-sort].active');
            var activeView = filterPanel.querySelector('[data-view].active');
            if(activeSort) sortBlocks(activeSort.dataset.sort);
            if(activeView) setView(activeView.dataset.view);
            filterPanel.classList.remove('open');
          });
        }
        var resetBtn = filterPanel.querySelector('.filter-reset');
        if(resetBtn){
          resetBtn.addEventListener('click', function(){
            priceOptions.forEach(function(o){ o.classList.toggle('active', o.dataset.sort === 'asc'); });
            viewOptions.forEach(function(o){ o.classList.toggle('active', o.dataset.view === 'list'); });
            originalOrder.forEach(function(b){ listParent.appendChild(b); });
            if(tileGrid){
              var tiles = Array.prototype.slice.call(tileGrid.children);
              originalOrder.forEach(function(b){
                var idx = blocks.indexOf(b);
                var matchingTile = tiles.filter(function(t){ return parseInt(t.dataset.index, 10) === idx; })[0];
                if(matchingTile) tileGrid.appendChild(matchingTile);
              });
            }
            setView('list');
            filterPanel.classList.remove('open');
          });
        }
        var closeBtn = filterPanel.querySelector('.filter-close');
        if(closeBtn) closeBtn.addEventListener('click', function(){ filterPanel.classList.remove('open'); });
        var backdrop = filterPanel.querySelector('.filter-backdrop');
        if(backdrop) backdrop.addEventListener('click', function(){ filterPanel.classList.remove('open'); });
      }
      if(filterBtn && filterPanel){
        filterBtn.addEventListener('click', function(){ filterPanel.classList.add('open'); });
      }
    });
  } catch(e){}

  try {
    // Hero slider (swipe + arrows + dots)
    var track = document.getElementById('heroTrack');
    var slider = document.getElementById('heroSlider');
    if(track && slider){
      var slides = track.querySelectorAll('.hero-slide');
      var dots = document.querySelectorAll('#heroDots button');
      var idx = 0;
      function go(i){
        idx = (i + slides.length) % slides.length;
        track.style.transform = 'translateX(-' + (idx * 100) + '%)';
        dots.forEach(function(d, di){ d.classList.toggle('active', di === idx); });
      }
      var prevBtn = document.getElementById('heroPrev');
      var nextBtn = document.getElementById('heroNext');
      var auto = setInterval(function(){ go(idx + 1); }, 2500);
      if(prevBtn) prevBtn.addEventListener('click', function(){ clearInterval(auto); go(idx - 1); });
      if(nextBtn) nextBtn.addEventListener('click', function(){ clearInterval(auto); go(idx + 1); });
      dots.forEach(function(d){ d.addEventListener('click', function(){ clearInterval(auto); go(parseInt(d.dataset.i, 10)); }); });

      var startX = null, startY = null, dragging = false;
      slider.addEventListener('touchstart', function(e){
        startX = e.touches[0].clientX; startY = e.touches[0].clientY; dragging = true;
      }, { passive:true });
      slider.addEventListener('touchend', function(e){
        if(!dragging) return;
        dragging = false;
        var dx = e.changedTouches[0].clientX - startX;
        var dy = e.changedTouches[0].clientY - startY;
        if(Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)){
          clearInterval(auto);
          if(dx < 0) go(idx + 1); else go(idx - 1);
        }
      }, { passive:true });
    }
  } catch(e){}

  try {
    // Swipeable product photo galleries (multiple per page)
    document.querySelectorAll('.pd-gallery').forEach(function(gallery){
      var track = gallery.querySelector('.pd-gallery-track');
      var slides = gallery.querySelectorAll('.pd-slide');
      if(!track || slides.length < 2) return;
      var idx = 0;
      var dots = gallery.querySelectorAll('.pd-gallery-dots button');
      function go(i){
        idx = (i + slides.length) % slides.length;
        track.style.transform = 'translateX(-' + (idx * 100) + '%)';
        dots.forEach(function(d, di){ d.classList.toggle('active', di === idx); });
      }
      var prevBtn = gallery.querySelector('.pd-gallery-arrow.left');
      var nextBtn = gallery.querySelector('.pd-gallery-arrow.right');
      if(prevBtn) prevBtn.addEventListener('click', function(){ go(idx - 1); });
      if(nextBtn) nextBtn.addEventListener('click', function(){ go(idx + 1); });
      dots.forEach(function(d, di){ d.addEventListener('click', function(){ go(di); }); });

      var startX = null;
      gallery.addEventListener('touchstart', function(e){ startX = e.touches[0].clientX; }, { passive:true });
      gallery.addEventListener('touchend', function(e){
        if(startX === null) return;
        var dx = e.changedTouches[0].clientX - startX;
        if(dx > 40) go(idx - 1);
        else if(dx < -40) go(idx + 1);
        startX = null;
      }, { passive:true });
    });
  } catch(e){}

  try {
    // Product color swatches — swap main photo
    document.querySelectorAll('.pd-photo').forEach(function(photoBox){
      var img = photoBox.querySelector('img');
      var wrap = photoBox.closest('.pd-wrap');
      if(!wrap || !img) return;
      var swatches = wrap.querySelectorAll('.swatch');
      swatches.forEach(function(sw){
        sw.addEventListener('click', function(){
          var newSrc = sw.getAttribute('data-img');
          if(!newSrc) return;
          swatches.forEach(function(s){ s.classList.remove('active'); });
          sw.classList.add('active');
          img.style.opacity = 0;
          setTimeout(function(){
            img.src = newSrc;
            img.style.opacity = 1;
          }, 120);
        });
      });
    });
  } catch(e){}

  try {
    // Burger menu
    var burgerBtn = document.getElementById('burgerBtn');
    var menuOverlay = document.getElementById('menuOverlay');
    if(burgerBtn && menuOverlay){
      burgerBtn.addEventListener('click', function(){
        var isOpen = menuOverlay.classList.toggle('open');
        burgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });
      menuOverlay.querySelectorAll('a').forEach(function(link){
        link.addEventListener('click', function(){
          menuOverlay.classList.remove('open');
          burgerBtn.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        });
      });
    }
  } catch(e){}

  try {
    // Reveal on scroll (light touch)
    var revealEls = document.querySelectorAll('[data-reveal]');
    if('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      var observer = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });
      revealEls.forEach(function(el){ observer.observe(el); });
    } else {
      revealEls.forEach(function(el){ el.classList.add('in-view'); });
    }
    window.addEventListener('load', function(){
      document.querySelectorAll('[data-reveal]').forEach(function(el){ el.classList.add('in-view'); });
    });
    setTimeout(function(){
      document.querySelectorAll('[data-reveal]').forEach(function(el){ el.classList.add('in-view'); });
    }, 2000);
  } catch(e){
    document.querySelectorAll('[data-reveal]').forEach(function(el){ el.classList.add('in-view'); });
  }

  try {
    // FAQ accordion — one open at a time
    var faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(function(item){
      item.addEventListener('toggle', function(){
        if(item.open){
          faqItems.forEach(function(other){ if(other !== item) other.open = false; });
        }
      });
    });
  } catch(e){}

  try {
    // Shop open/closed status (visitor's local clock — approximate)
    var statusEl = document.getElementById('shopStatus');
    var statusText = document.getElementById('shopStatusText');
    if(statusEl && statusText){
      var now = new Date();
      var day = now.getDay();
      var hour = now.getHours() + now.getMinutes() / 60;
      var isOpenHour = hour >= 10 && hour < 19;
      if(isOpenHour){
        statusEl.classList.add('open');
        statusText.textContent = 'Зараз відчинено';
      } else {
        statusEl.classList.add('closed');
        statusText.textContent = 'Зараз зачинено';
      }
    }
  } catch(e){}

  try {
    // Newsletter form — front-end only (no backend connected yet)
    var form = document.getElementById('newsletterForm');
    var success = document.getElementById('newsletterSuccess');
    var consent = document.getElementById('newsletterConsent');
    if(form && success && consent){
      form.addEventListener('submit', function(e){
        e.preventDefault();
        if(!consent.checked){ consent.focus(); return; }
        form.style.display = 'none';
        consent.parentElement.style.display = 'none';
        success.hidden = false;
      });
    }
  } catch(e){}

})();
