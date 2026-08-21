const galleryStorageKey = "seraphin-gallery";
const defaultPhotos = ["aug.jpg", "berg.jpg", "büsch.jpg", "cat.jpg", "chile.jpg", "lüchtturm.jpg", "mond.jpg", "sakura.jpg"];
const photoList = document.querySelector("#photo-list");
const fileInput = document.querySelector("#photo-input");
const status = document.querySelector("#admin-status");

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

function showStatus(message) {
  status.textContent = message;
  window.setTimeout(() => {
    status.textContent = "";
  }, 3000);
}

function createPhotoRow(photo, isAdded, state) {
  const row = document.createElement("li");
  row.className = "flex items-center gap-4 border-b border-neutral-200 py-4 dark:border-neutral-800";

  const image = document.createElement("img");
  image.src = isAdded ? photo.dataUrl : `assets/${photo}`;
  image.alt = isAdded ? photo.name : photo;
  image.className = "h-20 w-20 rounded object-cover";

  const name = document.createElement("span");
  name.className = "min-w-0 flex-1 truncate";
  name.textContent = isAdded ? photo.name : photo;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "rounded bg-black px-3 py-2 text-sm text-white dark:bg-white dark:text-black";
  button.textContent = "Remove";
  button.addEventListener("click", () => {
    if (isAdded) {
      state.added = state.added.filter((item) => item.id !== photo.id);
    } else if (!state.removed.includes(photo)) {
      state.removed.push(photo);
    }
    saveGalleryState(state);
    renderPhotoList();
    showStatus("Photo removed from the portfolio.");
  });

  row.append(image, name, button);
  return row;
}

function renderPhotoList() {
  const state = readGalleryState();
  photoList.replaceChildren();

  defaultPhotos
    .filter((photo) => !state.removed.includes(photo))
    .forEach((photo) => photoList.appendChild(createPhotoRow(photo, false, state)));
  state.added.forEach((photo) => photoList.appendChild(createPhotoRow(photo, true, state)));
}

fileInput.addEventListener("change", () => {
  const files = [...fileInput.files].filter((file) => file.type.startsWith("image/"));
  if (!files.length) {
    return;
  }

  const state = readGalleryState();
  let pending = files.length;
  files.forEach((file) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      state.added.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        dataUrl: reader.result,
      });
      pending -= 1;
      if (pending === 0) {
        saveGalleryState(state);
        renderPhotoList();
        fileInput.value = "";
        showStatus(`${files.length} photo${files.length === 1 ? "" : "s"} added.`);
      }
    });
    reader.readAsDataURL(file);
  });
});

document.querySelector("#restore-photos").addEventListener("click", () => {
  localStorage.removeItem(galleryStorageKey);
  renderPhotoList();
  showStatus("All portfolio photos restored.");
});

renderPhotoList();
