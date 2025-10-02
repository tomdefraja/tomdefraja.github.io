document.addEventListener("DOMContentLoaded", () => {
  // --- Tabs functionality ---
  const tabs = document.querySelectorAll(".tab-button");
  const panels = document.querySelectorAll(".tab-content");

  if (tabs.length > 0 && panels.length > 0) {
    const activateTab = tab => {
      // hide all panels
      panels.forEach(p => (p.style.display = "none"));
      // remove active class from all tabs
      tabs.forEach(t => t.classList.remove("active"));
      // show the selected panel
      const panel = document.getElementById(tab.dataset.tab);
      if (panel) panel.style.display = "block";
      tab.classList.add("active");
    };

    // add click listeners
    tabs.forEach(tab => {
      tab.addEventListener("click", () => activateTab(tab));
    });

    // activate the first tab by default
    activateTab(tabs[0]);
  }

  // --- Lightbox functionality ---
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = lightbox.querySelector("#lightbox-img");
  const caption = lightbox.querySelector("#lightbox-caption");

  document.querySelectorAll(".gallery").forEach(gallery => {
    const imgs = Array.from(gallery.querySelectorAll("img"));
    let currentIndex = 0;

    const showImage = i => {
      const img = imgs[i];
      lightboxImg.src = img.src;
      caption.textContent = img.nextElementSibling?.textContent || "";
    };

    const openLightbox = idx => {
      currentIndex = idx;
      showImage(currentIndex);
      lightbox.classList.remove("hidden");
    };

    imgs.forEach((img, idx) => {
      img.addEventListener("click", () => openLightbox(idx));
    });

    // Lightbox controls
    lightbox.querySelector(".close").addEventListener("click", () => {
      lightbox.classList.add("hidden");
    });

    // Click outside image closes lightbox
    lightbox.addEventListener("click", e => {
      if (e.target === lightbox) lightbox.classList.add("hidden");
    });

    lightbox.querySelector(".next").addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % imgs.length;
      showImage(currentIndex);
    });

    lightbox.querySelector(".prev").addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + imgs.length) % imgs.length;
      showImage(currentIndex);
    });

    // Swipe support for mobile
    let startX = 0;
    lightboxImg.addEventListener("touchstart", e => {
      startX = e.touches[0].clientX;
    });

    lightboxImg.addEventListener("touchend", e => {
      const endX = e.changedTouches[0].clientX;
      if (endX - startX > 50) {
        currentIndex = (currentIndex - 1 + imgs.length) % imgs.length;
        showImage(currentIndex);
      } else if (startX - endX > 50) {
        currentIndex = (currentIndex + 1) % imgs.length;
        showImage(currentIndex);
      }
    });
  });
});
