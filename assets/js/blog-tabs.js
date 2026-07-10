document.addEventListener('DOMContentLoaded', () => {
  // ----- MAIN TABS -----
  const mainTabsContainer = document.querySelector('.filter-tabs');
  const mainTabs = mainTabsContainer.querySelectorAll('.filter-tab');
  const mainUnderline = mainTabsContainer.querySelector('.tab-underline');
  const filterContents = document.querySelectorAll('.filter-content');

  const moveMainUnderline = tab => {
    mainUnderline.style.width = `${tab.offsetWidth}px`;
    mainUnderline.style.transform = `translateX(${tab.offsetLeft}px)`;
  };

  const showMainFilter = filter => {
    filterContents.forEach(fc => {
      fc.classList.remove('active');
      fc.style.display = 'none';
    });

    const selected = document.getElementById(filter);
    if(selected) {
      selected.style.display = 'block';
      void selected.offsetWidth;
      selected.classList.add('active');

      // Reset sub-tabs
      selected.querySelectorAll('.tabs').forEach(container => {
        container.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        const defaultTab = container.querySelector('.tab-button.active') || container.querySelector('.tab-button');
        if(defaultTab) {
          defaultTab.classList.add('active');
          moveSubUnderline(container, defaultTab);
        }
      });
    }
  };

  mainTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      mainTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      moveMainUnderline(tab);
      showMainFilter(tab.dataset.filter);
    });
  });

  // Initialize main tab
  const activeMainTab = mainTabsContainer.querySelector('.filter-tab.active');
  if(activeMainTab) {
    moveMainUnderline(activeMainTab);
    showMainFilter(activeMainTab.dataset.filter);
  }

  // ----- SUB-TABS -----
  const moveSubUnderline = (container, tab) => {
    const underline = container.querySelector('.sub-tab-underline');
    if(!underline || !tab) return;
    const tabRect = tab.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const left = tabRect.left - containerRect.left;
    underline.style.width = `${tab.offsetWidth}px`;
    underline.style.transform = `translateX(${left}px)`;
  };

  document.querySelectorAll('.tabs').forEach(container => {
    const tabButtons = container.querySelectorAll('.tab-button');
    const dropdown = container.querySelector('.dropdown');
    const toggle = dropdown ? dropdown.querySelector('.dropdown-toggle') : null;
    const dropdownItems = dropdown ? dropdown.querySelectorAll('.dropdown-item') : [];

    // Inline tabs
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        if(btn === toggle) return;
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        moveSubUnderline(container, btn);

        const tabContents = container.parentNode.querySelectorAll('.tab-content');
        tabContents.forEach(tc => { tc.style.display = 'none'; tc.classList.remove('active'); });
        const content = document.getElementById(btn.dataset.tab);
        if(content) { content.style.display = 'block'; content.classList.add('active'); }

        if(dropdown) dropdown.classList.remove('open');
      });
    });

    // Toggle dropdown
    if(toggle) {
      toggle.addEventListener('click', e => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
      });
    }

    // Dropdown items
    dropdownItems.forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();

        toggle.textContent = item.textContent + ' ▾';
        tabButtons.forEach(b => b.classList.remove('active'));
        toggle.classList.add('active');
        moveSubUnderline(container, toggle);

        const tabContents = container.parentNode.querySelectorAll('.tab-content');
        tabContents.forEach(tc => { tc.style.display = 'none'; tc.classList.remove('active'); });
        const content = document.getElementById(item.dataset.tab);
        if(content) { content.style.display = 'block'; content.classList.add('active'); }

        dropdown.classList.remove('open');
      });
    });

    // Initialize underline
    const activeBtn = container.querySelector('.tab-button.active');
    if(activeBtn) moveSubUnderline(container, activeBtn);
  });

  // Close dropdowns on outside click
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
  });

  // ----- WINDOW RESIZE -----
  window.addEventListener('resize', () => {
    const activeMain = mainTabsContainer.querySelector('.filter-tab.active');
    if(activeMain) moveMainUnderline(activeMain);

    filterContents.forEach(fc => {
      if(fc.style.display !== 'none') {
        fc.querySelectorAll('.tabs').forEach(container => {
          const activeBtn = container.querySelector('.tab-button.active');
          if(activeBtn) moveSubUnderline(container, activeBtn);
        });
      }
    });
  });
  // ----- TAG CLICKS ON CARDS -----
  document.querySelectorAll('.blog_card__img-tag[data-filter-type]').forEach(tag => {
    tag.addEventListener('click', e => {
      e.preventDefault();
      const filterType = tag.dataset.filterType; // 'country' or 'type'
      const filterValue = tag.dataset.filterValue; // e.g. 'scotland' or 'foot'

      // 1. Switch the main tab to the right filter panel
      const targetMainTab = mainTabsContainer.querySelector(`.filter-tab[data-filter="${filterType}"]`);
      if (targetMainTab) {
        mainTabs.forEach(t => t.classList.remove('active'));
        targetMainTab.classList.add('active');
        moveMainUnderline(targetMainTab);
        showMainFilter(filterType);
      }

      // 2. Within that panel, activate the right sub-tab
      const panel = document.getElementById(filterType);
      if (!panel) return;

      // Check inline tab buttons first
      const inlineBtn = panel.querySelector(`.tab-button[data-tab="${filterValue}"]`);
      if (inlineBtn) {
        const container = inlineBtn.closest('.tabs');
        panel.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
        inlineBtn.classList.add('active');
        moveSubUnderline(container, inlineBtn);

        panel.querySelectorAll('.tab-content').forEach(tc => {
          tc.style.display = 'none';
          tc.classList.remove('active');
        });
        const content = document.getElementById(filterValue);
        if (content) { content.style.display = 'block'; content.classList.add('active'); }
        return;
      }

      // Otherwise it's in the dropdown
      const dropdownItem = panel.querySelector(`.dropdown-item[data-tab="${filterValue}"]`);
      if (dropdownItem) {
        const container = dropdownItem.closest('.tabs');
        const toggle = container.querySelector('.dropdown-toggle');

        panel.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
        if (toggle) {
          toggle.textContent = dropdownItem.textContent.trim() + ' ▾';
          toggle.classList.add('active');
          moveSubUnderline(container, toggle);
        }

        panel.querySelectorAll('.tab-content').forEach(tc => {
          tc.style.display = 'none';
          tc.classList.remove('active');
        });
        const content = document.getElementById(filterValue);
        if (content) { content.style.display = 'block'; content.classList.add('active'); }
      }
    });
  });
});
