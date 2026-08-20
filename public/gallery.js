const gallery = document.querySelector("#gallery");

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
