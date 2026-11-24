/* ==========================================================================
   THE HOLLOWMERE ARCHIVE — Living World & Interactive Behaviour
   Zero external dependencies. Ready for £0 static hosting.
   ========================================================================== */

(function () {
  "use strict";

  // ------------------------------------------------------------------------
  // 1. Lighting Theme Toggle (Hearthlight <-> Parchment)
  // ------------------------------------------------------------------------
  const htmlEl = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const themeLabel = document.getElementById("themeLabel");

  function setTheme(theme) {
    htmlEl.setAttribute("data-theme", theme);
    themeLabel.textContent = theme === "parchment" ? "Parchment" : "Hearthlight";
    try {
      localStorage.setItem("hollowmere_theme", theme);
    } catch (_) {}
  }

  try {
    const savedTheme = localStorage.getItem("hollowmere_theme");
    if (savedTheme === "parchment" || savedTheme === "hearth") {
      setTheme(savedTheme);
    }
  } catch (_) {}

  themeToggle.addEventListener("click", () => {
    const next = htmlEl.getAttribute("data-theme") === "parchment" ? "hearth" : "parchment";
    setTheme(next);
  });

  // ------------------------------------------------------------------------
  // 2. Scroll-Driven Living World (Lantern Rail, Warming Hearth & Fireflies)
  // ------------------------------------------------------------------------
  const railFill = document.getElementById("railFill");
  const railSpark = document.getElementById("railSpark");
  const fireflyLayer = document.getElementById("fireflyLayer");
  const ledgerSection = document.getElementById("ledger");
  const ledgerDock = document.getElementById("ledgerDock");

  // Spawn 8 subtle, slow-drifting golden firefly motes
  if (fireflyLayer) {
    const motes = [
      { x: 12, y: 24, s: 6, dur: 15, delay: 0, dx: 26, dy: -65, op: 0.45 },
      { x: 84, y: 18, s: 5, dur: 18, delay: 2, dx: -22, dy: -55, op: 0.40 },
      { x: 24, y: 62, s: 7, dur: 16, delay: 4, dx: 30, dy: -80, op: 0.50 },
      { x: 76, y: 54, s: 5, dur: 19, delay: 1, dx: -18, dy: -60, op: 0.38 },
      { x: 46, y: 78, s: 6, dur: 14, delay: 3, dx: 20, dy: -75, op: 0.44 },
      { x: 91, y: 72, s: 6, dur: 17, delay: 5, dx: -25, dy: -70, op: 0.42 },
      { x: 8,  y: 82, s: 5, dur: 20, delay: 2.5, dx: 28, dy: -60, op: 0.36 },
      { x: 60, y: 32, s: 4, dur: 15, delay: 6, dx: -16, dy: -50, op: 0.35 }
    ];
    motes.forEach((m) => {
      const el = document.createElement("span");
      el.className = "firefly";
      el.style.left = m.x + "%";
      el.style.top = m.y + "%";
      el.style.width = m.s + "px";
      el.style.height = m.s + "px";
      el.style.setProperty("--dur", m.dur + "s");
      el.style.setProperty("--delay", m.delay + "s");
      el.style.setProperty("--dx", m.dx + "px");
      el.style.setProperty("--dy", m.dy + "px");
      el.style.setProperty("--max-op", String(m.op));
      fireflyLayer.appendChild(el);
    });
  }

  let scrollTicking = false;
  let ledgerInView = false;

  function updateScrollWorld() {
    const doc = document.documentElement;
    const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    const pct = progress * 100;

    // Move right-edge Lantern Thread spark
    if (railFill && railSpark) {
      railFill.style.height = pct.toFixed(2) + "%";
      railSpark.style.top = pct.toFixed(2) + "%";
    }

    // Noticeably warm and bloom the background hearthlight as you descend from cold to warm
    const glowIntensity = 0.06 + progress * 0.24;
    const glowY = 8 + progress * 64;
    doc.style.setProperty("--scroll-glow", glowIntensity.toFixed(3));
    doc.style.setProperty("--scroll-y", glowY.toFixed(1) + "%");

    scrollTicking = false;
  }

  window.addEventListener("scroll", () => {
    if (!scrollTicking) {
      requestAnimationFrame(updateScrollWorld);
      scrollTicking = true;
    }
  }, { passive: true });
  updateScrollWorld();

  // Scroll-triggered reveals
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll("[data-reveal]").forEach((el) => revealObserver.observe(el));

  // Hide floating dock smoothly when Sir Gideon's Ledger section is already on screen
  if (ledgerSection) {
    const ledgerObserver = new IntersectionObserver((entries) => {
      ledgerInView = entries[0].isIntersecting;
      syncDockVisibility();
    }, { threshold: 0.2 });
    ledgerObserver.observe(ledgerSection);
  }

  // ------------------------------------------------------------------------
  // 3. Interactive Thermal Mug Experience (Direct Tap, Pour & Brass Slider)
  // ------------------------------------------------------------------------
  const tabFront = document.getElementById("tabFront");
  const tabBack = document.getElementById("tabBack");
  const mugViewport = document.getElementById("mugViewport");
  const mugColdImg = document.getElementById("mugColdImg");
  const mugHotImg = document.getElementById("mugHotImg");
  const mugHotMask = document.getElementById("mugHotMask");
  const mugHeatLine = document.getElementById("mugHeatLine");
  const mugTapHint = document.getElementById("mugTapHint");
  const mugStatePill = document.getElementById("mugStatePill");
  const warmthSlider = document.getElementById("warmthSlider");
  const brassTrackFill = document.getElementById("brassTrackFill");
  const pourBtn = document.getElementById("pourBtn");
  const pourBtnText = document.getElementById("pourBtnText");

  const MUG_SIDES = {
    front: {
      cold: "assets/images/mug-front-cold.jpg",
      hot: "assets/images/mug-front-hot.jpg",
      coldAlt: "Cold matte black Hollowmere thermal mug front with faint brass lantern",
      hotAlt: "Hot steaming Hollowmere thermal mug front revealing the snow footpath and old mole sayings"
    },
    back: {
      cold: "assets/images/mug-back-cold.jpg",
      hot: "assets/images/mug-back-hot.jpg",
      coldAlt: "Cold matte black Hollowmere thermal mug back with a tiny golden sliver of light",
      hotAlt: "Hot steaming Hollowmere thermal mug back revealing the round wooden burrow door"
    }
  };

  let currentWarmth = 0;
  let animFrame = null;
  let hasAutoWokenMug = false;

  function applyWarmth(val) {
    currentWarmth = Math.max(0, Math.min(100, val));
    const rounded = Math.round(currentWarmth);
    warmthSlider.value = String(rounded);
    mugHotMask.style.setProperty("--warmth", currentWarmth + "%");
    if (mugHeatLine) {
      mugHeatLine.style.setProperty("--warmth", currentWarmth + "%");
      mugHeatLine.classList.toggle("is-active", currentWarmth > 2 && currentWarmth < 98);
    }
    if (brassTrackFill) {
      brassTrackFill.style.width = currentWarmth + "%";
    }

    if (currentWarmth <= 4) {
      mugStatePill.textContent = "Cold Frost · 0%";
      pourBtnText.textContent = "Pour Hot Tea";
    } else if (currentWarmth < 95) {
      mugStatePill.textContent = `Heat Rising · ${rounded}%`;
      pourBtnText.textContent = "Pour Hot Tea";
    } else {
      mugStatePill.textContent = "Steaming · Revealed";
      pourBtnText.textContent = "Let Mug Cool";
    }
  }

  function animateWarmthTo(target, duration = 1650) {
    if (animFrame) cancelAnimationFrame(animFrame);
    const startVal = currentWarmth;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      applyWarmth(startVal + (target - startVal) * eased);
      if (t < 1) {
        animFrame = requestAnimationFrame(step);
      } else {
        animFrame = null;
      }
    }
    animFrame = requestAnimationFrame(step);
  }

  function setMugSide(side) {
    const cfg = MUG_SIDES[side];
    if (!cfg) return;
    mugColdImg.src = cfg.cold;
    mugColdImg.alt = cfg.coldAlt;
    mugHotImg.src = cfg.hot;
    mugHotImg.alt = cfg.hotAlt;

    const isFront = side === "front";
    tabFront.classList.toggle("is-active", isFront);
    tabFront.setAttribute("aria-selected", String(isFront));
    tabBack.classList.toggle("is-active", !isFront);
    tabBack.setAttribute("aria-selected", String(!isFront));
  }

  function hideTapHint() {
    if (mugTapHint) mugTapHint.classList.add("is-hidden");
  }

  tabFront.addEventListener("click", () => setMugSide("front"));
  tabBack.addEventListener("click", () => setMugSide("back"));

  warmthSlider.addEventListener("input", (e) => {
    hideTapHint();
    if (animFrame) {
      cancelAnimationFrame(animFrame);
      animFrame = null;
    }
    applyWarmth(Number(e.target.value));
  });

  function triggerPourToggle() {
    hideTapHint();
    const target = currentWarmth >= 92 ? 0 : 100;
    animateWarmthTo(target);
  }

  pourBtn.addEventListener("click", triggerPourToggle);
  mugViewport.addEventListener("click", triggerPourToggle);
  mugViewport.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      triggerPourToggle();
    }
  });

  // Auto-wake subtle 22% warmth teaser when visitor first scrolls to the mug!
  const mugObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !hasAutoWokenMug && currentWarmth === 0) {
      hasAutoWokenMug = true;
      setTimeout(() => {
        if (currentWarmth === 0) animateWarmthTo(22, 1200);
      }, 320);
      mugObserver.disconnect();
    }
  }, { threshold: 0.45 });
  mugObserver.observe(mugViewport);

  applyWarmth(0);

  // ------------------------------------------------------------------------
  // 4. Instant Reward: 3D Opening Book + Expandable Prologue Reader
  // ------------------------------------------------------------------------
  const book3dStage = document.getElementById("book3dStage");
  const togglePrologueBtn = document.getElementById("togglePrologueBtn");
  const closePrologueBtn = document.getElementById("closePrologueBtn");
  const prologueDrawer = document.getElementById("prologueDrawer");

  function setPrologueOpen(open) {
    if (book3dStage) {
      book3dStage.classList.toggle("is-open", open);
    }
    togglePrologueBtn.setAttribute("aria-expanded", String(open));
    togglePrologueBtn.textContent = open ? "Close the Book" : "Read the Prologue Here";

    if (open) {
      // Let the 3D cover visibly swing open first, then unfurl the full readable spread
      setTimeout(() => {
        prologueDrawer.hidden = false;
        prologueDrawer.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 360);
    } else {
      prologueDrawer.hidden = true;
    }
  }

  togglePrologueBtn.addEventListener("click", () => {
    setPrologueOpen(prologueDrawer.hidden);
  });

  if (book3dStage) {
    book3dStage.addEventListener("click", () => {
      setPrologueOpen(prologueDrawer.hidden);
    });
    book3dStage.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setPrologueOpen(prologueDrawer.hidden);
      }
    });
  }

  closePrologueBtn.addEventListener("click", () => {
    setPrologueOpen(false);
    document.getElementById("the-book").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // ------------------------------------------------------------------------
  // 5. Keepsake Lore Data & Inspection Modal
  // ------------------------------------------------------------------------
  const PRODUCT_LORE = {
    vault: {
      id: "vault",
      label: "The Lorekeeper’s Vault (Digital, £6.99)",
      title: "The Lorekeeper’s Vault",
      price: "£6.99 (Pay What You Want above £5)",
      badge: "Digital · Launching with Game",
      badgeClass: "badge-digital",
      img: "assets/images/vault-v2.jpg",
      quote: "“He understands that words are more than sounds; they are the song of the soul.”",
      desc: "A zero-shipping digital keepsake hosted on itch.io, designed for readers and Burrow Kings players anywhere in the world. Delivered instantly as one tidy archive.",
      specs: [
        "<strong>Illustrated eBook:</strong> Full 13-chapter ePub (Kindle/e-readers) + 300 DPI illustrated PDF.",
        "<strong>Ambient Soundtrack EP:</strong> Three cosy tavern & autumn hearth tracks from Burrow Kings.",
        "<strong>4K Art & Wallpapers:</strong> Desktop (16:9) & phone lockscreen (9:16) lantern art."
      ]
    },
    bookmark: {
      id: "bookmark",
      label: "Key & Lantern Bookmark (Est. £8.99)",
      title: "Hollowmere Key & Lantern Bookmark",
      price: "Estimated £8.99 · Coming Soon",
      badge: "Coming Soon · Register Interest",
      badgeClass: "badge-coming",
      img: "assets/images/bookmark.jpg",
      quote: "“Every lantern casts a shadow, and every shadow knows its lantern.”",
      desc: "Every physical detail is pulled straight from the story: heavy cream cotton cardstock, the critter-scaled lantern beside the round wooden burrow door, an earthy forest-green ribbon echoing Elrick’s first patch on the King’s cloak, and a weathered door key echoing the travellers’ keys Brannoch forged into the crown.",
      specs: [
        "<strong>Paper Stock:</strong> 400gsm textured cream cotton card with double sepia ink border.",
        "<strong>Book-Safe Key:</strong> Lead-free antique-bronze plated alloy sealed with clear archival lacquer—cannot rust and will never mark cream pages.",
        "<strong>Ribbon:</strong> Soft woven forest-green cotton through an antique-brass eyelet."
      ]
    },
    stickers: {
      id: "stickers",
      label: "Critters Sticker Pack (Est. £5.50)",
      title: "Critters of Hollowmere Sticker Pack",
      price: "Estimated £5.50 · Coming Soon",
      badge: "Coming Soon · Register Interest",
      badgeClass: "badge-coming",
      img: "assets/images/stickers.jpg",
      quote: "“Where two walk, a journey.”",
      desc: "Five weatherproof matte die-cut vinyl stickers cut directly from the official sepia book illustrations—every critter properly dressed, never bare—nestled inside a frosted glassine pouch and kraft sleeve tied with forest-green twine.",
      specs: [
        "<strong>5 Included Designs:</strong> Elrick in his knitted scarf, Thaddeus in his Thinking Chair, Ewart Stonewhisker with his Hall broom, Gideon’s Two Teacups, and the Hollowmere Lantern Crest.",
        "<strong>Finish:</strong> Thick matte UV-laminated vinyl (waterproof, scratch-resistant, zero cheap plastic glare).",
        "<strong>Typography:</strong> Set in EB Garamond on heavyweight cream-kraft packaging."
      ]
    },
    map: {
      id: "map",
      label: "Hollowmere Parchment Map Print (Est. £14.99)",
      title: "Hollowmere Parchment World Map",
      price: "Estimated £14.99 · In Cartography",
      badge: "In Cartography · Coming Soon",
      badgeClass: "badge-cartography",
      img: "assets/images/vault-v2.jpg",
      quote: "“Old roots grow round what will not move.”",
      desc: "The canonical map of Hollowmere, Gnawreach, Stillwood, and the Whispering Mere—currently receiving a fresh update under the Rat King’s direction before print proofs open.",
      specs: [
        "<strong>Format:</strong> A3 Fine Art Giclée Print on heavyweight 240gsm textured archival paper.",
        "<strong>Packaging:</strong> Rolled safely in a reinforced kraft postal tube.",
        "<strong>Status:</strong> Register your interest in Sir Gideon’s Ledger to see the updated map reveal first."
      ]
    }
  };

  const modal = document.getElementById("loreModal");
  const modalClose = document.getElementById("modalClose");
  const modalImg = document.getElementById("modalImg");
  const modalBadge = document.getElementById("modalBadge");
  const modalTitle = document.getElementById("modalTitle");
  const modalPrice = document.getElementById("modalPrice");
  const modalQuote = document.getElementById("modalQuote");
  const modalDesc = document.getElementById("modalDesc");
  const modalSpecs = document.getElementById("modalSpecs");
  const modalInterestBtn = document.getElementById("modalInterestBtn");
  let activeModalId = null;

  function openModal(productId) {
    const item = PRODUCT_LORE[productId];
    if (!item) return;
    activeModalId = productId;
    modalImg.src = item.img;
    modalImg.alt = item.title;
    modalBadge.textContent = item.badge;
    modalBadge.className = "badge " + item.badgeClass;
    modalTitle.textContent = item.title;
    modalPrice.textContent = item.price;
    modalQuote.textContent = item.quote;
    modalDesc.textContent = item.desc;
    modalSpecs.innerHTML = item.specs.map((s) => `<li>${s}</li>`).join("");

    syncModalInterestButton();
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modalClose.focus();
  }

  function closeModal() {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    activeModalId = null;
  }

  document.querySelectorAll("[data-open-modal]").forEach((btn) => {
    btn.addEventListener("click", () => openModal(btn.getAttribute("data-open-modal")));
  });

  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  // ------------------------------------------------------------------------
  // 6. Sir Gideon's Ledger (Demand Tracker + Floating Bottom Dock)
  // ------------------------------------------------------------------------
  const navLedgerCount = document.getElementById("navLedgerCount");
  const selectedList = document.getElementById("selectedList");
  const ledgerForm = document.getElementById("ledgerForm");
  const formStatus = document.getElementById("formStatus");
  const dockSummary = document.getElementById("dockSummary");

  let ledgerItems = new Map();

  try {
    const stored = JSON.parse(localStorage.getItem("hollowmere_gideon_ledger") || "[]");
    stored.forEach(([id, label]) => ledgerItems.set(id, label));
  } catch (_) {}

  function saveLedger() {
    try {
      localStorage.setItem("hollowmere_gideon_ledger", JSON.stringify(Array.from(ledgerItems.entries())));
    } catch (_) {}
  }

  function syncDockVisibility() {
    if (!ledgerDock) return;
    const shouldShow = ledgerItems.size > 0 && !ledgerInView;
    ledgerDock.hidden = !shouldShow;
  }

  function syncModalInterestButton() {
    if (!activeModalId) return;
    const isSaved = ledgerItems.has(activeModalId);
    modalInterestBtn.textContent = isSaved ? "✓ Noted in Sir Gideon’s Ledger" : "I’d Love This — Note in Ledger";
    modalInterestBtn.classList.toggle("btn-interest", isSaved);
    modalInterestBtn.classList.toggle("is-saved", isSaved);
    modalInterestBtn.classList.toggle("btn-primary", !isSaved);
  }

  function renderLedger(popBadge = false) {
    const count = ledgerItems.size;
    navLedgerCount.textContent = String(count);

    if (popBadge) {
      navLedgerCount.classList.remove("is-pop");
      void navLedgerCount.offsetWidth;
      navLedgerCount.classList.add("is-pop");
    }

    if (dockSummary) {
      dockSummary.textContent = `${count} ${count === 1 ? "keepsake" : "keepsakes"} in Sir Gideon’s Ledger`;
    }
    syncDockVisibility();

    document.querySelectorAll("[data-interest]").forEach((btn) => {
      const id = btn.getAttribute("data-interest");
      const saved = ledgerItems.has(id);
      btn.classList.toggle("is-saved", saved);
      if (!btn.dataset.originalText) {
        btn.dataset.originalText = btn.textContent.trim();
      }
      btn.textContent = saved ? "✓ Noted in Ledger" : btn.dataset.originalText;
    });

    syncModalInterestButton();

    if (count === 0) {
      selectedList.innerHTML = `<li class="empty-note">Nothing marked yet—tap “I’d Love This” on any keepsake above.</li>`;
      return;
    }

    selectedList.innerHTML = "";
    ledgerItems.forEach((label, id) => {
      const li = document.createElement("li");
      li.className = "selected-chip";
      li.innerHTML = `<span>${label}</span><button type="button" aria-label="Remove ${label}">&times;</button>`;
      li.querySelector("button").addEventListener("click", () => {
        ledgerItems.delete(id);
        saveLedger();
        renderLedger(false);
      });
      selectedList.appendChild(li);
    });
  }

  function toggleInterest(id, label) {
    if (ledgerItems.has(id)) {
      ledgerItems.delete(id);
    } else {
      ledgerItems.set(id, label);
    }
    saveLedger();
    renderLedger(true);
  }

  document.querySelectorAll("[data-interest]").forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleInterest(btn.getAttribute("data-interest"), btn.getAttribute("data-label"));
    });
  });

  modalInterestBtn.addEventListener("click", () => {
    if (!activeModalId) return;
    const item = PRODUCT_LORE[activeModalId];
    toggleInterest(item.id, item.label);
  });

  ledgerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById("visitorEmail");
    const nameInput = document.getElementById("visitorName");
    const noteInput = document.getElementById("visitorNote");
    const submitBtn = ledgerForm.querySelector('button[type="submit"]');
    const email = emailInput.value.trim();

    if (!email || !email.includes("@")) {
      formStatus.textContent = "Please add a valid email address so Sir Gideon knows where to send word.";
      emailInput.focus();
      return;
    }

    const name = nameInput.value.trim() || "A weary traveller";
    const note = noteInput ? noteInput.value.trim() : "";
    const count = ledgerItems.size;
    const keepsakeList = count > 0
      ? Array.from(ledgerItems.values()).join(" | ")
      : "General Hollowmere launch updates";

    submitBtn.disabled = true;
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = "Inking Ledger…";
    formStatus.textContent = "Sending your entry to Sir Gideon behind the counter…";

    try {
      const res = await fetch("https://formsubmit.co/ajax/jmatts94@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          Name: name,
          Email: email,
          Keepsakes_Marked: keepsakeList,
          Keepsake_Count: String(count),
          Traveller_Note: note || "(none)",
          _subject: "Sir Gideon's Ledger — New Hollowmere Archive Entry",
          _template: "table",
          _captcha: "false"
        })
      });

      if (!res.ok) throw new Error("HTTP " + res.status);

      const itemsMsg = count > 0
        ? `your interest in ${count} ${count === 1 ? "keepsake" : "keepsakes"}`
        : "your name";
      formStatus.textContent = `Thank you, ${name}. Sir Gideon has inked ${itemsMsg} into the ledger behind the counter.`;
      ledgerForm.reset();
    } catch (_) {
      formStatus.textContent = "The lantern flickered while sending—please try once more in a moment, or email jmatts94@gmail.com.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });

  renderLedger(false);
})();
