document.addEventListener("DOMContentLoaded", () => {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const closeBtn = document.querySelector(".lightbox .close");
  const prevBtn = document.querySelector(".lightbox .prev");
  const nextBtn = document.querySelector(".lightbox .next");

  let currentGallery = [];
  let currentIndex = 0;

  // Helper: find the closest active tab content for a photo
  function getActiveTabPhotos(el) {
    const tabContent = el.closest(".tab-content, #all");
    if (!tabContent) return [];
    return Array.from(tabContent.querySelectorAll(".photo_container"));
  }

  function showImage() {
    const el = currentGallery[currentIndex];
    if (!el) return;
    lightboxImg.src = el.dataset.src;
    lightboxCaption.innerHTML = el.querySelector("h1")?.innerHTML || "";
  }

  function changeImage(delta) {
    if (currentGallery.length === 0) return;
    currentIndex = (currentIndex + delta + currentGallery.length) % currentGallery.length;
    showImage();
  }

  // Click handler for each photo container
  document.querySelectorAll(".photo_container").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();

      // Set gallery to only the photos in this photo's active tab content
      currentGallery = getActiveTabPhotos(el);
      currentIndex = currentGallery.indexOf(el);

      showImage();
      lightbox.classList.remove("hidden");
    });
  });

  closeBtn.addEventListener("click", () => lightbox.classList.add("hidden"));
  prevBtn.addEventListener("click", () => changeImage(-1));
  nextBtn.addEventListener("click", () => changeImage(1));

  // Close when clicking outside the image
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.classList.add("hidden");
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (lightbox.classList.contains("hidden")) return;
    if (e.key === "Escape") lightbox.classList.add("hidden");
    if (e.key === "ArrowLeft") changeImage(-1);
    if (e.key === "ArrowRight") changeImage(1);
  });
});
