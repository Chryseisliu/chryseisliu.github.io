(function() {
    const PHOTO_DATA_URL = 'data/photos.json';

    function createSafeFilename(collectionName) {
        return collectionName.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    function encodeAssetPath(parts) {
        return parts.map(part => encodeURIComponent(part)).join('/');
    }

    function imagePath(size, collectionName, photo) {
        return encodeAssetPath(['images', 'optimized', size, collectionName, photo]);
    }

    function originalImagePath(collectionName, photo) {
        return encodeAssetPath(['images', collectionName, photo]);
    }

    async function loadPhotoCollections() {
        const response = await fetch(PHOTO_DATA_URL);
        if (!response.ok) {
            throw new Error(`Could not load ${PHOTO_DATA_URL}`);
        }
        const collections = await response.json();
        window.photoCollections = collections;
        return collections;
    }

    function renderHomeCollections(collections) {
        const container = document.querySelector('.photo-collections');
        if (!container) return;

        container.textContent = '';

        Object.entries(collections).forEach(([collectionKey, collection]) => {
            const coverImage = collection.photos[0];
            const photoCount = collection.photos.length;
            const collectionItem = document.createElement('div');
            collectionItem.className = 'collection-item';
            collectionItem.dataset.collection = collectionKey;
            collectionItem.tabIndex = 0;
            collectionItem.setAttribute('role', 'link');

            const preview = document.createElement('div');
            preview.className = 'collection-preview';

            const image = document.createElement('img');
            image.src = imagePath('thumbs', collectionKey, coverImage);
            image.srcset = [
                `${imagePath('thumbs', collectionKey, coverImage)} 480w`,
                `${imagePath('medium', collectionKey, coverImage)} 1600w`
            ].join(', ');
            image.sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
            image.alt = collection.title;
            image.className = 'collection-image';
            image.loading = 'lazy';
            image.decoding = 'async';
            image.width = 480;
            image.height = 360;

            const overlay = document.createElement('div');
            overlay.className = 'collection-overlay';

            const title = document.createElement('h3');
            title.className = 'collection-title';
            title.textContent = collection.title;

            const count = document.createElement('p');
            count.className = 'collection-count';
            count.textContent = `${photoCount} photo${photoCount !== 1 ? 's' : ''}`;

            const view = document.createElement('span');
            view.className = 'view-collection';
            view.textContent = 'view collection ->';

            overlay.append(title, count, view);
            preview.append(image, overlay);
            collectionItem.append(preview);

            function openCollection() {
                window.location.href = `collection-${createSafeFilename(collectionKey)}.html`;
            }

            collectionItem.addEventListener('click', openCollection);
            collectionItem.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openCollection();
                }
            });

            container.appendChild(collectionItem);
        });
    }

    function renderCollectionPage(collections) {
        const gallery = document.querySelector('.collection-gallery[data-collection]');
        if (!gallery) return;

        const collectionName = gallery.dataset.collection;
        const collection = collections[collectionName];
        if (!collection) return;

        const title = document.querySelector('.collection-page-title');
        const count = document.querySelector('.collection-page-count');
        if (title) title.textContent = collection.title;
        if (count) {
            count.textContent = `${collection.photos.length} photo${collection.photos.length !== 1 ? 's' : ''}`;
        }

        gallery.textContent = '';

        collection.photos.forEach((photo, index) => {
            const item = document.createElement('div');
            item.className = 'photo-item';

            const image = document.createElement('img');
            image.src = imagePath('medium', collectionName, photo);
            image.srcset = [
                `${imagePath('thumbs', collectionName, photo)} 480w`,
                `${imagePath('medium', collectionName, photo)} 1600w`
            ].join(', ');
            image.sizes = '(max-width: 700px) 100vw, (max-width: 1200px) 50vw, 33vw';
            image.alt = collection.title;
            image.className = 'collection-photo';
            image.loading = index < 3 ? 'eager' : 'lazy';
            image.decoding = 'async';
            image.width = 1600;
            image.height = 1200;
            if (index === 0) image.fetchPriority = 'high';
            image.addEventListener('click', () => {
                window.open(originalImagePath(collectionName, photo), '_blank', 'noopener');
            });

            item.appendChild(image);
            gallery.appendChild(item);
        });
    }

    document.addEventListener('DOMContentLoaded', async function() {
        if (!document.querySelector('.photo-collections, .collection-gallery[data-collection]')) {
            return;
        }

        try {
            const collections = await loadPhotoCollections();
            renderHomeCollections(collections);
            renderCollectionPage(collections);
        } catch (error) {
            console.warn(error);
        }
    });
})();
