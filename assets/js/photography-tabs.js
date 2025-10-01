document.addEventListener("DOMContentLoaded", () => {
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
        // swipe right
        currentIndex = (currentIndex - 1 + imgs.length) % imgs.length;
        showImage(currentIndex);
      } else if (startX - endX > 50) {
        // swipe left
        currentIndex = (currentIndex + 1) % imgs.length;
        showImage(currentIndex);
      }
    });
  });
});
