document.addEventListener("DOMContentLoaded", () => {
  const buttons = Array.from(document.querySelectorAll(".tab-button"));
  const tabs = Array.from(document.querySelectorAll(".tab-content"));

  function clearAll() {
    buttons.forEach(b => { 
      b.classList.remove("active"); 
      b.setAttribute("aria-selected", "false"); 
    });
    tabs.forEach(t => { 
      t.style.display = "none"; 
      t.setAttribute("aria-hidden", "true"); 
    });
  }

  function showTab(id) {
    const panel = document.getElementById(id);
    if (!panel) return;
    clearAll();
    panel.style.display = "block";
    panel.setAttribute("aria-hidden", "false");
    const btn = buttons.find(b => b.dataset.tab === id);
    if (btn) {
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
    }
    history.replaceState(null, null, `#${id}`);
  }

  const hashTab = window.location.hash ? window.location.hash.substring(1) : null;
  const initialTab = hashTab && document.getElementById(hashTab) ? hashTab : buttons[0].dataset.tab;
  showTab(initialTab);

  buttons.forEach(btn => {
    btn.addEventListener("click", () => showTab(btn.dataset.tab));

    btn.addEventListener("keydown", (e) => {
      const idx = buttons.indexOf(btn);
      if (e.key === "ArrowRight") {
        e.preventDefault();
        buttons[(idx + 1) % buttons.length].focus();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        buttons[(idx - 1 + buttons.length) % buttons.length].focus();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        showTab(btn.dataset.tab);
      }
    });
  });
});
