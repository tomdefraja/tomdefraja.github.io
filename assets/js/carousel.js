document.addEventListener("DOMContentLoaded", () => {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const closeBtn = document.querySelector(".lightbox .close");
  const prevBtn = document.querySelector(".lightbox .prev");
  const nextBtn = document.querySelector(".lightbox .next");

  let currentGallery = [];
  let currentIndex = 0;

  // For each gallery, set up its own click handling
  document.querySelectorAll(".gallery").forEach(gallery => {
    const images = Array.from(gallery.querySelectorAll("img"));

    images.forEach((img, index) => {
      img.addEventListener("click", () => {
        currentGallery = images;   // only this gallery’s images
        currentIndex = index;
        showImage();
        lightbox.classList.remove("hidden");
      });
    });
  });

  function showImage() {
    const img = currentGallery[currentIndex];
    if (!img) return;
    lightboxImg.src = img.src;
    const caption = img.closest("figure")?.querySelector("figcaption")?.innerText || "";
    lightboxCaption.textContent = caption;
  }

  function changeImage(delta) {
    if (currentGallery.length === 0) return;
    currentIndex = (currentIndex + delta + currentGallery.length) % currentGallery.length;
    showImage();
  }

  closeBtn.addEventListener("click", () => lightbox.classList.add("hidden"));
  prevBtn.addEventListener("click", () => changeImage(-1));
  nextBtn.addEventListener("click", () => changeImage(1));
// Close when clicking outside the image
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      lightbox.classList.add("hidden");
    }
  });
  // ESC to close
  document.addEventListener("keydown", (e) => {
    if (lightbox.classList.contains("hidden")) return;
    if (e.key === "Escape") lightbox.classList.add("hidden");
    if (e.key === "ArrowLeft") changeImage(-1);
    if (e.key === "ArrowRight") changeImage(1);
  });
});
