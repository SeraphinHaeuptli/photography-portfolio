const gallery = document.querySelector("#gallery");
const animationDuration = 330;

function getTargetRect(image) {
  const aspectRatio = image.naturalWidth / image.naturalHeight || 4 / 3;
  const maxWidth = window.innerWidth * 0.9;
  const maxHeight = window.innerHeight * 0.84;
  let width = maxWidth;
  let height = width / aspectRatio;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    top: (window.innerHeight - height) / 2,
    left: (window.innerWidth - width) / 2,
    width,
    height,
  };
}

function setRect(element, rect) {
  element.style.top = `${rect.top}px`;
  element.style.left = `${rect.left}px`;
  element.style.width = `${rect.width}px`;
  element.style.height = `${rect.height}px`;
}

function openLightbox(sourceImage) {
  const sourceRect = sourceImage.getBoundingClientRect();
  const overlay = document.createElement("div");
  overlay.className = "lightbox";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", sourceImage.alt);

  const image = sourceImage.cloneNode();
  image.className = "lightbox-image";
  image.removeAttribute("loading");
  setRect(image, sourceRect);

  const closeButton = document.createElement("button");
  closeButton.className = "lightbox-close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close image");
  closeButton.textContent = "\u00d7";

  overlay.append(image, closeButton);
  document.body.append(overlay);
  document.body.classList.add("lightbox-open");

  const targetRect = getTargetRect(image);
  closeButton.style.top = `${targetRect.top + 12}px`;
  closeButton.style.left = `${targetRect.left + targetRect.width - 52}px`;
  void image.offsetWidth;

  requestAnimationFrame(() => {
    overlay.classList.add("is-open");
    setRect(image, targetRect);
  });

  let isClosing = false;
  const handleKeydown = (event) => {
    if (event.key === "Escape") close();
  };
  const close = () => {
    if (isClosing) return;
    isClosing = true;
    document.removeEventListener("keydown", handleKeydown);
    overlay.classList.remove("is-open");
    setRect(image, sourceImage.getBoundingClientRect());
    closeButton.disabled = true;
    window.setTimeout(() => {
      overlay.remove();
      document.body.classList.remove("lightbox-open");
    }, animationDuration);
  };

  closeButton.addEventListener("click", close);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  document.addEventListener("keydown", handleKeydown);
}

async function loadGallery() {
  try {
    const response = await fetch("gallery.json");
    if (!response.ok) {
      throw new Error(`Gallery request failed: ${response.status}`);
    }

    const photos = await response.json();
    gallery.replaceChildren(
      ...photos.map((photo) => {
        const figure = document.createElement("figure");
        figure.className = "gallery-item";

        const image = document.createElement("img");
        image.src = `images/${photo.filename}`;
        image.alt = photo.alt;
        image.loading = "lazy";
        image.width = 1200;
        image.height = 900;
        image.addEventListener("click", () => openLightbox(image));

        const caption = document.createElement("figcaption");
        caption.textContent = photo.title;

        figure.append(image, caption);
        return figure;
      }),
    );
  } catch (error) {
    gallery.replaceChildren();
    const message = document.createElement("p");
    message.className = "gallery-error";
    message.textContent = "The gallery could not be loaded.";
    gallery.append(message);
    console.error(error);
  }
}

loadGallery();
