document.addEventListener("DOMContentLoaded", () => {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const closeBtn = document.querySelector(".lightbox .close");
  const prevBtn = document.querySelector(".lightbox .prev");
  const nextBtn = document.querySelector(".lightbox .next");

  let currentGallery = [];
  let currentIndex = 0;

  // Return thumbnail URL for videos
  function getThumbnail(url) {
    if (url.endsWith(".mp4")) return url.replace(/\.mp4$/, ".jpg");
    return url;
  }

  // Setup galleries
  document.querySelectorAll(".gallery").forEach(gallery => {
    const items = Array.from(gallery.querySelectorAll("img"));

    items.forEach((img, index) => {
      const url = img.dataset.url;

      // Set thumbnail for video
      img.src = getThumbnail(url);

      // Wrap video thumbnails with play button
      if (url.endsWith(".mp4")) {
        const wrapper = document.createElement("div");
        wrapper.className = "video-wrapper";
        img.parentNode.replaceChild(wrapper, img);
        wrapper.appendChild(img);

        const playBtn = document.createElement("div");
        playBtn.className = "video-play-button";
        playBtn.innerHTML = "&#9658;"; // play icon
        wrapper.appendChild(playBtn);

        wrapper.addEventListener("click", () => {
          currentGallery = items;
          currentIndex = index;
          showItem();
          lightbox.classList.remove("hidden");
        });
      } else {
        img.addEventListener("click", () => {
          currentGallery = items;
          currentIndex = index;
          showItem();
          lightbox.classList.remove("hidden");
        });
      }
    });
  });

  // Show selected item in lightbox
  function showItem() {
    const item = currentGallery[currentIndex];
    if (!item) return;

    const src = item.dataset.url || item.src;
    const caption = item.closest("figure")?.querySelector("figcaption")?.innerText || "";
    lightboxCaption.textContent = caption;

    // Remove any previous video
    const existingVideo = lightbox.querySelector("video");
    if (existingVideo) {
      existingVideo.pause();
      existingVideo.src = "";
      existingVideo.remove();
    }

    if (src.endsWith(".mp4")) {
      lightboxImg.style.display = "none";
      const video = document.createElement("video");
      video.src = src;
      video.controls = true;
      video.autoplay = true;
      video.style.maxWidth = "90%";
      video.style.maxHeight = "80vh";
      lightbox.appendChild(video);
    } else {
      lightboxImg.src = src;
      lightboxImg.style.display = "block";
    }
  }

  function changeImage(delta) {
    if (currentGallery.length === 0) return;
    currentIndex = (currentIndex + delta + currentGallery.length) % currentGallery.length;
    showItem();
  }

  // Close lightbox & stop video
  function closeLightbox() {
    const video = lightbox.querySelector("video");
    if (video) {
      video.pause();
      video.src = "";
      video.remove();
    }
    lightbox.classList.add("hidden");
  }

  closeBtn.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", e => {
    if (lightbox.classList.contains("hidden")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") changeImage(-1);
    if (e.key === "ArrowRight") changeImage(1);
  });
});
