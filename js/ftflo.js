(function () {
  "use strict";

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* 따로추가한부분 */
  function initHorizontalSkills() {
    const track = document.querySelector(".skills-track");

    if (!track) return;

    const cards = track.querySelectorAll(".skill-card");

    if (!cards.length) return;

    const firstCard = cards[0];
    const lastCard = cards[cards.length - 1];

    /* CSS에서 .skills-track의 좌우 padding을 calc(50vw - 카드폭/2)로
       맞춰뒀기 때문에, 첫 카드는 스크롤 시작 시점에 이미 화면 정중앙에 있다.
       따라서 "첫 카드 위치 -> 마지막 카드 위치" 거리만큼만 딱 이동시키면
       스크롤이 끝나는 순간 마지막 카드도 정확히 정중앙에 도착한다. */
    const distance = lastCard.offsetLeft - firstCard.offsetLeft;

    gsap.to(track, {
      x: -distance,

      ease: "none",

      scrollTrigger: {
        trigger: ".skills",

        start: "top top",

        end: "bottom bottom",

        scrub: 3,
      },
    });
  }

  // 또추가
  const heroIntro = gsap.timeline();

  heroIntro
    .from(".hero-small", {
      opacity: 0,

      y: 30,

      duration: 0.8,
    })

    .from(
      ".hero-name",
      {
        opacity: 0,

        y: 80,

        duration: 1,
      },
      "-=.3",
    )

    .from(
      ".hero-role",
      {
        opacity: 0,

        y: 30,

        duration: 0.8,
      },
      "-=.4",
    )

    .from(
      ".hero-bg-word",
      {
        opacity: 0,

        scale: 0.9,

        duration: 1.4,
      },
      "-=.8",
    );

  const gradient = document.querySelector(".hero-gradient");

  window.addEventListener("mousemove", (e) => {
    const x = (e.clientX - window.innerWidth / 2) * 0.02;

    const y = (e.clientY - window.innerHeight / 2) * 0.02;

    gsap.to(gradient, {
      x,

      y,

      duration: 1.5,

      ease: "power3.out",
    });
  });

  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".hero",

        start: "top top",

        end: "+=100%",

        scrub: 1,

        pin: true,
      },
    })

    .to(
      ".hero-inner",
      {
        opacity: 0,

        y: -80,
      },
      0,
    )

    .to(
      ".hero-bg-word",
      {
        scale: 1.15,

        opacity: 0.05,
      },
      0,
    )

    .to(
      ".hero-gradient",
      {
        scale: 1.2,
      },
      0,
    );

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  if (!reduceMotion && window.Lenis) {
    lenis = new Lenis({
      duration: 1.15,
      easing: function (t) {
        return 1 - Math.pow(1 - t, 3);
      },
      smoothWheel: true,
      wheelMultiplier: 1,
    });
    lenis.on("scroll", ScrollTrigger.update);
    lenis.stop();
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Anchor / dot nav scrolling ---------- */
  function scrollToTarget(id) {
    var el = document.getElementById(id);
    if (!el) return;

    if (lenis) {
      if (id === "hero") {
        lenis.scrollTo(0, {
          duration: 1.2,
        });
      } else {
        lenis.scrollTo(el, {
          offset: -80,
          duration: 1.2,
        });
      }
    } else {
      window.scrollTo({
        top: el.offsetTop - 80,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
  }

  document.querySelectorAll(".scene-dot").forEach(function (btn) {
    btn.addEventListener("click", function () {
      scrollToTarget(btn.dataset.target);
    });
  });
  document.querySelectorAll('.top-nav a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      scrollToTarget(a.getAttribute("href").slice(1));
    });
  });

  /* ---------- Top nav show/hide + solid bg ---------- */
  var topNav = document.getElementById("topNav");
  var heroEl = document.getElementById("hero");
  ScrollTrigger.create({
    trigger: heroEl,
    start: "bottom top+=80",
    onEnter: function () {
      topNav.classList.add("visible");
    },
    onLeaveBack: function () {
      topNav.classList.remove("visible");
    },
  });
  ScrollTrigger.create({
    start: 100,
    end: 99999,
    onUpdate: function (self) {
      topNav.classList.toggle("solid", self.scroll() > 40);
    },
  });

  /* ---------- Scene dot active state ---------- */
  var sceneIds = ["hero", "about", "skills", "projects", "gallery", "contact"];
  sceneIds.forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el,
      start: "top 30%",
      end: "bottom 30%",
      onToggle: function (self) {
        if (self.isActive) {
          document.querySelectorAll(".scene-dot").forEach(function (d) {
            d.classList.remove("active");
          });
          var dot = document.querySelector(
            '.scene-dot[data-target="' + id + '"]',
          );
          if (dot) dot.classList.add("active");
        }
      },
    });
  });

  /* ---------- Generic line reveal ---------- */
  function revealLines(container, opts) {
    opts = opts || {};
    var lines = container.querySelectorAll(".line");
    if (!lines.length) return;
    gsap.to(lines, {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.09,
      scrollTrigger: {
        trigger: container,
        start: opts.start || "top 85%",
        toggleActions: "play none none reverse",
      },
    });
  }

  /* ---------- Loader: 카운터 + 커튼 와이프, 끝나면 Hero 등장 ---------- */
  function playHero() {
    if (!reduceMotion) {
      gsap.to(".hero .line", {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 1,
        ease: "power3.out",
        stagger: 0.12,
      });
    } else {
      gsap.set(".line", { y: 0, opacity: 1, filter: "blur(0px)" });
    }
  }

  var loaderEl = document.getElementById("loader");
  var loaderPanel = document.getElementById("loaderPanel");
  var loaderCount = document.getElementById("loaderCount");
  var loaderBar = document.getElementById("loaderBar");

  document.documentElement.classList.add("no-scroll");
  function finishLoading() {
    document.body.classList.remove("loading");
    document.documentElement.classList.remove("no-scroll");
    if (lenis) lenis.start();
    ScrollTrigger.refresh();
  }

  if (reduceMotion) {
    loaderEl.style.display = "none";
    loaderPanel.style.display = "none";
    finishLoading();
    playHero();
  } else {
    var counter = { val: 0 };
    gsap.to(counter, {
      val: 100,
      duration: 1.3,
      ease: "power2.inOut",
      onUpdate: function () {
        var v = Math.round(counter.val);
        loaderCount.firstChild.textContent = v;
        loaderBar.style.width = v + "%";
      },
      onComplete: function () {
        var tl = gsap.timeline({
          onComplete: function () {
            loaderEl.style.display = "none";
            loaderPanel.style.display = "none";
            finishLoading();
            playHero();
          },
        });
        tl.to(loaderPanel, {
          scaleY: 1,
          transformOrigin: "bottom",
          duration: 0.5,
          ease: "power3.inOut",
        })
          .set(loaderEl, { opacity: 0 })
          .to(loaderPanel, {
            scaleY: 0,
            transformOrigin: "top",
            duration: 0.6,
            ease: "power3.inOut",
            delay: 0.05,
          });
      },
    });
  }

  /* ---------- Custom cursor ---------- */
  var isFinePointer = window.matchMedia("(pointer:fine)").matches;
  if (isFinePointer && !reduceMotion) {
    document.body.classList.add("has-cursor");
    var cursorDot = document.getElementById("cursorDot");
    var cursorRing = document.getElementById("cursorRing");
    var cursorLabel = document.getElementById("cursorLabel");

    var dotX = gsap.quickTo(cursorDot, "x", {
      duration: 0.12,
      ease: "power3.out",
    });
    var dotY = gsap.quickTo(cursorDot, "y", {
      duration: 0.12,
      ease: "power3.out",
    });
    var ringX = gsap.quickTo(cursorRing, "x", {
      duration: 0.35,
      ease: "power3.out",
    });
    var ringY = gsap.quickTo(cursorRing, "y", {
      duration: 0.35,
      ease: "power3.out",
    });

    window.addEventListener("mousemove", function (e) {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    });

    document.querySelectorAll("a, button").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        var label = el.dataset.cursor || "";
        document.body.classList.add(
          label === "DRAG" ? "cursor-drag" : "cursor-hover",
        );
        cursorLabel.textContent = label;
      });
      el.addEventListener("mouseleave", function () {
        document.body.classList.remove("cursor-hover", "cursor-drag");
        cursorLabel.textContent = "";
      });
    });
    var galleryTrackEl = document.getElementById("galleryTrack");
    if (galleryTrackEl) {
      galleryTrackEl.addEventListener("mouseenter", function () {
        document.body.classList.add("cursor-drag");
        cursorLabel.textContent = "DRAG";
      });
      galleryTrackEl.addEventListener("mouseleave", function () {
        document.body.classList.remove("cursor-drag");
        cursorLabel.textContent = "";
      });
    }
  }

  /* ---------- Magnetic elements ---------- */
  if (!reduceMotion) {
    document.querySelectorAll(".magnetic").forEach(function (el) {
      var mx = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
      var my = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.35);
        my((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener("mouseleave", function () {
        mx(0);
        my(0);
      });
    });
  }

  /* ---------- Scramble text (eyebrow labels) ---------- */
  var SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ01//--";
  function scrambleTo(el, finalText, duration) {
    var frame = 0;
    var totalFrames = Math.round(duration * 60);
    function tick() {
      var progress = frame / totalFrames;
      var revealCount = Math.floor(progress * finalText.length);
      var out = "";
      for (var i = 0; i < finalText.length; i++) {
        if (i < revealCount || finalText[i] === " " || finalText[i] === "/") {
          out += finalText[i];
        } else {
          out +=
            SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
      }
      el.textContent = out;
      frame++;
      if (frame <= totalFrames) requestAnimationFrame(tick);
      else el.textContent = finalText;
    }
    tick();
  }
  document.querySelectorAll(".scramble").forEach(function (el) {
    var finalText = el.textContent;
    ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: function () {
        reduceMotion
          ? (el.textContent = finalText)
          : scrambleTo(el, finalText, 0.6);
      },
    });
  });

  /* ---------- Ghost parallax text ---------- */
  if (!reduceMotion) {
    document.querySelectorAll(".ghost-text").forEach(function (el) {
      var speed = parseFloat(el.dataset.speed || "0.15");
      gsap.to(el, {
        yPercent: speed * 300,
        ease: "none",
        scrollTrigger: {
          trigger: el.closest("section"),
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });
  }

  /* ---------- Marquee ticker (스크롤 방향에 따라 반대로) ---------- */
  if (!reduceMotion) {
    var marqueeTrack = document.getElementById("marqueeTrack");
    if (marqueeTrack) {
      var marqueeTween = gsap.to(marqueeTrack, {
        xPercent: -50,
        ease: "none",
        duration: 22,
        repeat: -1,
      });
      ScrollTrigger.create({
        trigger: marqueeTrack,
        start: "top bottom",
        end: "bottom top",
        onUpdate: function (self) {
          marqueeTween.timeScale(self.direction === -1 ? -1 : 1);
        },
      });
    }
  }

  /* ---------- Count-up numbers ---------- */
  document.querySelectorAll(".count-up").forEach(function (el) {
    var target = parseFloat(el.dataset.target || "0");
    var suffix = el.dataset.suffix || "";
    if (reduceMotion) {
      el.textContent = target + suffix;
      return;
    }
    var obj = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: function () {
        gsap.to(obj, {
          val: target,
          duration: 1.4,
          ease: "power2.out",
          onUpdate: function () {
            el.textContent = Math.round(obj.val) + suffix;
          },
        });
      },
    });
  });

  /* About / Contact headline line reveals on scroll */
  document
    .querySelectorAll(".about-copy, #contact .container")
    .forEach(function (block) {
      revealLines(block);
    });

  /* About paragraphs + strengths fade (block-level, not line-level: 긴 본문은 문단 단위로 순차 등장) */
  if (!reduceMotion) {
    gsap.from(".about-text p", {
      y: 24,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      stagger: 0.15,
      scrollTrigger: { trigger: ".about-text", start: "top 82%" },
    });
    gsap.from(".about-strengths li", {
      y: 20,
      opacity: 0,
      duration: 0.7,
      ease: "power2.out",
      stagger: 0.1,
      scrollTrigger: { trigger: ".about-strengths", start: "top 85%" },
    });
    gsap.from(".about-stats > div", {
      y: 16,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      stagger: 0.1,
      scrollTrigger: { trigger: ".about-stats", start: "top 90%" },
    });
    /* About photo: 아주 약한 scale 효과 */
    gsap.fromTo(
      ".photo-frame img",
      { scale: 1.12 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".about",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  }

  /* Skills cards: 등장 + 3D tilt */
  if (!reduceMotion) {
    gsap.from(".skill-card", {
      y: 30,
      opacity: 0,
      duration: 0.7,
      ease: "power2.out",
      stagger: 0.08,
      scrollTrigger: { trigger: ".skills-grid", start: "top 85%" },
    });
  }
  document.querySelectorAll("[data-tilt]").forEach(function (card) {
    var strength = parseFloat(card.dataset.tiltStrength || "10");
    card.addEventListener("mousemove", function (e) {
      if (reduceMotion) return;
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(card, {
        rotateY: x * strength,
        rotateX: -y * strength,
        duration: 0.4,
        ease: "power2.out",
        transformPerspective: 600,
      });
    });
    card.addEventListener("mouseleave", function () {
      gsap.to(card, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.5,
        ease: "power2.out",
      });
    });
  });

  /* ---------- Projects: pin + scrub image scale + staggered meta reveal ---------- */
  var mm = gsap.matchMedia();

  var topNavEl = document.querySelector(".top-nav");

  mm.add(
    "(min-width: 861px) and (prefers-reduced-motion: no-preference)",
    function () {
      document.querySelectorAll(".project").forEach(function (project) {
        var media = project.querySelector(".project-media");
        var info = project.querySelectorAll(
          ".project-num, .project-info h3, .project-info > p, .project-meta, .project-links",
        );

        gsap.set(info, { y: 24, opacity: 0 });

        var tl = gsap.timeline({
          scrollTrigger: {
            trigger: project,
            /* 90px로 고정하면 실제 nav 높이와 달라 위쪽에 빈 여백이
               생기므로, nav 실제 높이를 그대로 사용해 딱 붙게 만든다 */
            start: function () {
              return "top top+=" + (topNavEl ? topNavEl.offsetHeight : 0);
            },
            end: "+=100%",
            scrub: true,
            pin: true,
            pinSpacing: true,
          },
        });

        tl.fromTo(media, { scale: 1 }, { scale: 1.08, ease: "none" }, 0).to(
          info,
          { y: 0, opacity: 1, ease: "power2.out", stagger: 0.12 },
          0.15,
        );
      });
    },
  );

  mm.add("(max-width: 860px), (prefers-reduced-motion: reduce)", function () {
    document.querySelectorAll(".project").forEach(function (project) {
      gsap.from(project.querySelectorAll(".project-media, .project-info > *"), {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.08,
        scrollTrigger: { trigger: project, start: "top 80%" },
      });
    });
  });

  /* ---------- Gallery: 등장 애니메이션 + 드래그 스크롤 + 휠 매핑 ---------- */
  if (!reduceMotion) {
    gsap.from(".gallery-item", {
      y: 24,
      opacity: 0,
      scale: 0.96,
      duration: 0.6,
      ease: "power2.out",
      stagger: 0.08,
      scrollTrigger: { trigger: ".gallery-track", start: "top 85%" },
    });
  }

  (function () {
    var track = document.getElementById("galleryTrack");
    var dragCue = document.getElementById("dragCue");
    if (!track) return;

    var isDown = false,
      startX = 0,
      startScroll = 0,
      moved = false;

    track.addEventListener("pointerdown", function (e) {
      isDown = true;
      moved = false;
      startX = e.clientX;
      startScroll = track.scrollLeft;
      track.classList.add("dragging");
    });
    window.addEventListener("pointermove", function (e) {
      if (!isDown) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startScroll - dx;
    });
    window.addEventListener("pointerup", function () {
      isDown = false;
      track.classList.remove("dragging");
    });
    /* 드래그였다면 클릭(라이트박스 오픈)을 막아 오작동 방지 */
    track.addEventListener(
      "click",
      function (e) {
        if (moved) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true,
    );

    /* 세로 휠 스크롤을 가로 이동으로 매핑 (데스크톱 배려) */
    track.addEventListener(
      "wheel",
      function (e) {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          track.scrollLeft += e.deltaY;
        }
      },
      { passive: false },
    );

    /* 처음 상호작용하면 DRAG 안내 문구 서서히 숨김 */
    track.addEventListener(
      "scroll",
      function () {
        if (dragCue) dragCue.style.opacity = "0";
      },
      { once: true },
    );
  })();

  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxCaption = document.getElementById("lightboxCaption");

  document.querySelectorAll(".gallery-item").forEach(function (item) {
    item.addEventListener("click", function () {
      lightboxCaption.textContent = item.dataset.caption || "";
      lightboxImg.src = item.dataset.full || "";
      lightboxImg.alt = item.dataset.caption || "";
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.documentElement.classList.add("no-scroll");
    });
  });

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("no-scroll");
  }
  document
    .getElementById("lightboxClose")
    .addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });

  /* ---------- Refresh on load ---------- */
  window.addEventListener("load", function () {
    initHorizontalSkills(); // 추가

    ScrollTrigger.refresh();
  });
})();
