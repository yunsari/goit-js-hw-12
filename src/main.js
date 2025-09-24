const PIXABAY_KEY = '52415219-707698e12fcb871174c3b20bd';

const form = document.getElementById('search-form');
const results = document.getElementById('results');
const loader = document.getElementById('loader');

let lightbox;

// Render Gallery
function renderGallery(items) {
  results.innerHTML = '';
  const fragment = document.createDocumentFragment();

  items.forEach(item => {
    if (!item.webformatURL) return;

    const card = document.createElement('article');
    card.className = 'card';

    const link = document.createElement('a');
    link.href = item.webformatURL;
    link.className = 'gallery-item';

    const img = document.createElement('img');
    img.src = item.webformatURL;
    img.alt = item.tags || 'Image';
    img.loading = 'lazy';
    img.style.cursor = 'pointer';

    link.appendChild(img);
    card.appendChild(link);

    const meta = document.createElement('div');
    meta.className = 'meta';

    const info = document.createElement('div');
    info.textContent = `${item.likes} ♥ • ${item.views} views`;

    const pixLink = document.createElement('a');
    pixLink.href = item.pageURL;
    pixLink.target = '_blank';
    pixLink.rel = 'noopener';
    pixLink.textContent = 'Pixabay';

    meta.appendChild(info);
    meta.appendChild(pixLink);
    card.appendChild(meta);

    fragment.appendChild(card);
  });

  results.appendChild(fragment);
  window.scrollTo({ top: results.offsetTop - 12, behavior: 'smooth' });

  if (lightbox) lightbox.destroy();
  lightbox = new SimpleLightbox('.gallery a', {
    captions: true,
    captionsData: 'alt',
    captionDelay: 250
  });
}

// Form Submit
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const query = e.target.elements.search.value.trim();
  if (!query) return;

  loader.style.display = 'block';

  fetch(`https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (!data.hits || data.hits.length === 0) {
        iziToast.error({
          message: 'Sorry, there are no images matching your search query. Please try again!',
          position: 'topRight'
        });
        results.innerHTML = '';
      } else {
        renderGallery(data.hits);
      }
    })
    .catch(error => {
      iziToast.error({
        title: 'Error',
        message: 'Something went wrong while fetching images!',
        position: 'topRight'
      });
      console.error('Fetch error:', error);
    })
    .finally(() => {
      loader.style.display = 'none';
    });
});