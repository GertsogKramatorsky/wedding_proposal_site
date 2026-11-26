document.addEventListener("DOMContentLoaded", () => {
  const pages = [...document.querySelectorAll(".card")];
  if (!pages.length) return;
  let currentPage = 0;

  function showPage(index) {
    if (index < 0 || index >= pages.length) return;
    pages.forEach((page, i) => {
      const active = i === index;
      page.hidden = !active;
      page.setAttribute("aria-hidden", String(!active));
      page.classList.toggle("active", active);
    });
    currentPage = index;
    window.scrollTo({ top: 0, behavior: "smooth" });
    pages[index].querySelector("h1")?.focus({ preventScroll: true });
  }

  document.querySelectorAll(".next-button, .yes").forEach((button) => {
    button.addEventListener("click", () => showPage(currentPage + 1));
  });
  document.querySelector(".start-button")?.addEventListener("click", () => {
    const music = document.querySelector("#background-music");
    if (music) {
      music.play().catch((error) => {
        console.warn("Не вдалося запустити музику:", error);
      });
    }
    showPage(currentPage + 1);
  });
  document.querySelectorAll(".prev-button").forEach((button) => {
    button.addEventListener("click", () => showPage(currentPage - 1));
  });

  function showAnswerMessage(button, className, text) {
    const page = button.closest(".card");
    if (!page) return;
    page
      .querySelectorAll(".success-message, .decline-message")
      .forEach((message) => message.remove());
    const message = document.createElement("p");
    message.className = className;
    message.setAttribute("role", "status");
    message.textContent = text;
    page.append(message);
  }

  function launchFireworks(page) {
    page.querySelector(".fireworks-layer")?.remove();
    const layer = document.createElement("div");
    layer.className = "fireworks-layer";
    layer.setAttribute("aria-hidden", "true");
    const colors = ["#ff4f87", "#ffc857", "#8b5cf6", "#42c6a5", "#fff"];

    for (let i = 0; i < 90; i += 1) {
      const spark = document.createElement("span");
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 55;
      spark.className = "firework-spark";
      spark.style.setProperty("--dx", `${Math.cos(angle) * distance}vw`);
      spark.style.setProperty("--dy", `${Math.sin(angle) * distance}vh`);
      spark.style.setProperty("--spark-color", colors[i % colors.length]);
      spark.style.setProperty("--delay", `${Math.random() * 0.45}s`);
      layer.append(spark);
    }

    page.append(layer);
    window.setTimeout(() => layer.remove(), 2600);
  }

  document.querySelector(".super-yes")?.addEventListener("click", (event) => {
    const button = event.currentTarget;
    const page = button.closest(".card");
    if (!page) return;
    showAnswerMessage(
      button,
      "success-message",
      "УРАААА! Я найщасливіший чоловік на Землі! Ти не пожалкуєш 💍❤️",
    );
    launchFireworks(page);
  });

  document.querySelector(".super-no")?.addEventListener("click", (event) => {
    showAnswerMessage(
      event.currentTarget,
      "decline-message",
      "Це, мабуть, був місклік) А ну вийди і зайди як треба!",
    );
  });

  document.querySelectorAll(".impossible-no").forEach((button) => {
    const escape = (event) => {
      event.preventDefault();
      const rect = button.getBoundingClientRect();
      const gap = 12;
      const maxX = Math.max(gap, window.innerWidth - rect.width - gap);
      const maxY = Math.max(gap, window.innerHeight - rect.height - gap);
      const yesButton = button.classList.contains("impossible-no")
        ? button.closest(".card")?.querySelector(".yes")
        : null;
      const yesRect = yesButton?.getBoundingClientRect();
      const safeGap = 20;
      let left = gap;
      let top = gap;
      let foundSafeSpot = !yesRect;

      // Try random viewport positions until the button clears the fixed "Так" button.
      for (let attempt = 0; attempt < 60 && !foundSafeSpot; attempt += 1) {
        left = gap + Math.random() * (maxX - gap);
        top = gap + Math.random() * (maxY - gap);
        const separated =
          left + rect.width + safeGap <= yesRect.left ||
          left >= yesRect.right + safeGap ||
          top + rect.height + safeGap <= yesRect.top ||
          top >= yesRect.bottom + safeGap;
        if (separated) foundSafeSpot = true;
      }

      if (!foundSafeSpot) {
        // Keep it on the opposite side of the viewport if random placement fails.
        left = yesRect.left > window.innerWidth / 2 ? gap : maxX;
        top = yesRect.top > window.innerHeight / 2 ? gap : maxY;
      }
      // Keep the flex layout slot occupied so the adjacent "Так" never moves.
      if (!button.dataset.hasPlaceholder) {
        const placeholder = document.createElement("span");
        placeholder.className = "button-placeholder";
        placeholder.setAttribute("aria-hidden", "true");
        placeholder.style.width = `${rect.width}px`;
        placeholder.style.height = `${rect.height}px`;
        button.before(placeholder);
        button.dataset.hasPlaceholder = "true";
        button.style.width = `${rect.width}px`;
        button.style.height = `${rect.height}px`;
        button.style.minWidth = `${rect.width}px`;
        button.style.minHeight = `${rect.height}px`;
        button.style.margin = "0";
      }
      button.classList.add("escaping");
      button.style.left = `${left}px`;
      button.style.top = `${top}px`;
    };
    button.addEventListener("pointerenter", escape);
    button.addEventListener("pointerdown", escape);
  });

  showPage(0);
});
