const PIXABAY_KEY = '52415219-707698e12fcb871174c3b20bd';

const form = document.getElementById('search-form');
const results = document.getElementById('results');
const loader = document.getElementById('loader');
const loadMoreBtn = document.getElementById('load-more');

let lightbox;
let currentPage = 1;
let currentQuery = '';
const perPage = 20;

async function fetchImages(query, page = 1) {
  loader.style.display = 'block';
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: PIXABAY_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: perPage,
        page: page
      }
    });

    const data = response.data;

    if (!data.hits || data.hits.length === 0) {
      if (page === 1) {
        iziToast.error({
          message: 'No images found!',
          position: 'topRight'
        });
        results.innerHTML = '';
        loadMoreBtn.style.display = 'none';
      }
      return;
    }

    renderGallery(data.hits, page > 1);

    const totalLoaded = page * perPage;
    if (totalLoaded >= data.totalHits) {
      loadMoreBtn.style.display = 'none';
      iziToast.warning({
        message: "We're sorry, but you've reached the end of search results",
        position: "topRight"
      });
    } else {
      loadMoreBtn.style.display = 'block';
    }

  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: 'Something went wrong while fetching images!',
      position: 'topRight'
    });
    console.error(error);
  } finally {
    loader.style.display = 'none';
  }
}

function renderGallery(items, append = false) {
  if (!append) results.innerHTML = '';

  const fragment = document.createDocumentFragment();

  items.forEach(item => {
    const card = document.createElement('article');
    card.className = 'card';

    const link = document.createElement('a');
    link.href = item.largeImageURL;
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
    meta.textContent = `${item.likes} ♥ • ${item.views} views`;

    card.appendChild(meta);
    fragment.appendChild(card);
  });

  results.appendChild(fragment);

  if (lightbox) lightbox.refresh();
  lightbox = new SimpleLightbox('.gallery a', {
    captions: true,
    captionsData: 'alt',
    captionDelay: 250,
  });
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const query = e.target.elements.search.value.trim();
  if (!query) return;

  currentQuery = query;
  currentPage = 1;
  fetchImages(currentQuery, 1);
});

loadMoreBtn.addEventListener('click', async () => {
  currentPage++;
  await fetchImages(currentQuery, currentPage);

  // Yeni kartlar eklendikten sonra scroll işlemi
  const cards = document.querySelectorAll('.card');
  if (cards.length >= 2) {
    const secondLastCard = cards[cards.length - 2];
    const rect = secondLastCard.getBoundingClientRect();

    window.scrollBy({
      top: rect.height * 2,
      behavior: 'smooth'
    });
  }
});