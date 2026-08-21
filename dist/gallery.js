const galleryStorageKey = "seraphin-gallery";
const gallery = document.querySelector("#gallery");

function readGalleryState() {
  try {
    return JSON.parse(localStorage.getItem(galleryStorageKey)) || { removed: [], added: [] };
  } catch {
    return { removed: [], added: [] };
  }
}

function saveGalleryState(state) {
  localStorage.setItem(galleryStorageKey, JSON.stringify(state));
}

function addStoredPhotos(state) {
  state.added.forEach((photo) => {
    const link = document.createElement("a");
    link.href = photo.dataUrl;
    link.dataset.fancybox = "gallery";
    link.dataset.photo = photo.id;
    link.className = "gallery-item mb-4 block break-inside-avoid overflow-hidden";

    const image = document.createElement("img");
    image.src = photo.dataUrl;
    image.alt = photo.name;
    image.className = "block w-full h-auto transition duration-500 hover:scale-105";
    link.appendChild(image);
    gallery.appendChild(link);
  });
}

function renderGallery() {
  if (!gallery) {
    return;
  }

  const state = readGalleryState();
  gallery.querySelectorAll(".gallery-item").forEach((item) => {
    if (state.removed.includes(item.dataset.photo)) {
      item.remove();
    }
  });
  addStoredPhotos(state);
}

window.galleryManager = {
  readGalleryState,
  saveGalleryState,
  renderGallery,
};

renderGallery();
