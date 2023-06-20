"use strict";

var scrolloffset = 55; // variable for menu height

// When Scrollspy Detects a change
var firstScrollSpyEl = document.querySelector('[data-bs-spy="scroll"]');
firstScrollSpyEl.addEventListener('activate.bs.scrollspy', function () {
  var hash = document.querySelector('.site-nav a.active').getAttribute('href');
  if (hash !== '#page-hero') document.querySelector('header nav').classList.add('inbody');else document.querySelector('header nav').classList.remove('inbody');

  // Animate Media Layout when it passes scroll
  document.querySelector('#page-media .animated-group').style.visibility = 'hidden';
  if (hash === '#page-media') document.querySelector('#page-media .animated-group').classList.add('animated', 'fadeInRight');
});

// Modifies modal and injects high resolution image
var siteModal = document.getElementById('site-modal');
siteModal.addEventListener('show.bs.modal', function (event) {
  siteModal.querySelector('.modal-content img').setAttribute('src', event.relatedTarget.dataset.highres);
});

// Use smooth scrolling when clicking on navigation
document.querySelectorAll('.navbar-nav a:not(.dropdown-toggle)').forEach(function (element) {
  element.addEventListener('click', function () {
    if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
      var target = document.querySelector(this.hash);
      target = target ? target : document.querySelector('[name=' + this.hash.slice(1) + ']');
      if (target) {
        window.scrollTo({
          top: target.offsetTop - scrolloffset,
          behavior: 'smooth'
        });
        return false;
      }
    }
  }); // Click function
}); // Smooth scroll
//# sourceMappingURL=maps/script.js.map
