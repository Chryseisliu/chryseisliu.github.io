// Simple navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');

    // Smooth scroll for navigation links
    function smoothScroll(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        
        if (targetId.startsWith('#')) {
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
        
        // Update active nav link
        navLinks.forEach(link => link.classList.remove('active'));
        this.classList.add('active');
    }

    // Add click event to all navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', smoothScroll);
    });

    // Update active nav link on scroll
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove active class from all nav links
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Add active class to current section's nav link
                const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }

    // Handle scroll events
    window.addEventListener('scroll', updateActiveNavLink);

    // Initial call to set active nav link
    updateActiveNavLink();

    // Photography Gallery Functionality
    // Photo collections data - based on actual folder structure with original case
    const photoCollections = {
        'African Swallowtail (Papilio dardanus)': {
            title: 'African Swallowtail (Papilio dardanus)',
            photos: ['111.JPG', 'IMG_1310.JPG', 'IMG_1312.JPG']
        },
        'Berliner Dom': {
            title: 'Berliner Dom',
            photos: ['IMG_1259.JPG', 'IMG_1260.JPG']
        },
        'Common Birdwing (Troides helena)': {
            title: 'Common Birdwing (Troides helena)',
            photos: ['IMG_1308.JPG', 'IMG_1309.JPG']
        },
        'fallen petals adrift on the creek': {
            title: 'fallen petals adrift on the creek',
            photos: ['STA_1272.JPG', 'STB_1273.JPG']
        },
        'female Great Eggfly (Hypolimnas bolina)': {
            title: 'female Great Eggfly (Hypolimnas bolina)',
            photos: ['IMG_1344.JPG', 'IMG_1346.JPG']
        },
        'Green Anole (Anolis carolinensis)': {
            title: 'Green Anole (Anolis carolinensis)',
            photos: ['IMG_1317.JPG']
        },
        'hong kong': {
            title: 'hong kong',
            photos: ['IMG_1404.JPG', 'IMG_1405.JPG', 'IMG_1407.JPG', 'IMG_1414.JPG', 'IMG_1415.JPG', 'IMG_1416.JPG', 'IMG_1417.JPG', 'IMG_1418.JPG', 'IMG_1419.JPG', 'IMG_1420.JPG', 'IMG_1421.JPG', 'IMG_1422.JPG', 'IMG_1423.JPG', 'IMG_1424.JPG']
        },
        'Malachite butterfly (Siproeta stelenes)': {
            title: 'Malachite butterfly (Siproeta stelenes)',
            photos: ['IMG_1285.JPG', 'IMG_1292.JPG', 'IMG_1361.JPG', 'IMG_1365.JPG']
        },
        'mirrored, fragmented green': {
            title: 'mirrored, fragmented green',
            photos: ['IMG_1400.JPG', 'IMG_1401.JPG', 'IMG_1402.JPG']
        },
        'Morpho peleides': {
            title: 'Morpho peleides',
            photos: ['IMG_11.JPG', 'IMG_1283.JPG', 'IMG_1284.JPG', 'IMG_1300.JPG', 'IMG_1301.JPG', 'IMG_1306.JPG', 'IMG_1307.JPG', 'IMG_1319.JPG', 'IMG_1323.JPG', 'IMG_1324.JPG', 'IMG_1325.JPG', 'IMG_1362.JPG']
        },
        'Paper Kite': {
            title: 'Paper Kite',
            photos: ['IMG_1276.JPG', 'IMG_1277.JPG', 'IMG_1280.JPG', 'IMG_1281.JPG', 'IMG_1315.JPG', 'IMG_1316.JPG', 'IMG_1370.JPG', 'IMG_1371.JPG', 'IMG_1372.JPG', 'IMG_1373.JPG', 'IMG_1378.JPG']
        },
        'Peleides Blue Morpho': {
            title: 'Peleides Blue Morpho',
            photos: ['IMG_1302.JPG', 'IMG_1305.JPG']
        },
        'Postman butterfly (Heliconius melpomene)': {
            title: 'Postman butterfly (Heliconius melpomene)',
            photos: ['IMG_1295.JPG', 'IMG_1296.JPG']
        },
        'Red Lacewing butterfly (Cethosia biblis)': {
            title: 'Red Lacewing butterfly (Cethosia biblis)',
            photos: ['IMG_1377.JPG']
        },
        'Red Lacewing(Cethosia biblis)': {
            title: 'Red Lacewing(Cethosia biblis)',
            photos: ['IMG_1.JPG', 'IMG_1288.JPG', 'IMG_1289.JPG', 'IMG_1293.JPG']
        },
        'Red Postman(Heliconius erato)': {
            title: 'Red Postman(Heliconius erato)',
            photos: ['IMG_1314.JPG']
        },
        'spring': {
            title: 'spring',
            photos: ['IMG_1318.JPG', 'IMG_1366.JPG', 'IMG_1368.JPG', 'IMG_1369.JPG', 'IMG_1374.JPG', 'IMG_1376.JPG', 'IMG_1379.JPG', 'IMG_1380.JPG', 'IMG_1381.JPG']
        },
        'Tabebuia Rosea': {
            title: 'Tabebuia Rosea',
            photos: ['IMG_1263.JPG', 'IMG_1264.JPG', 'IMG_1266.JPG', 'IMG_1267.JPG', 'IMG_1274.JPG', 'IMG_1275.JPG', 'IMG_1278.JPG', 'IMG_1300.JPG', 'IMG_1320.JPG', 'IMG_1321.JPG', 'IMG_1322.JPG', 'IMG_1327.JPG', 'IMG_1328.JPG', 'IMG_1329.JPG', 'IMG_1330.JPG', 'IMG_1331.JPG', 'IMG_1332.JPG', 'IMG_1333.JPG', 'IMG_1334.JPG', 'IMG_1341.JPG', 'IMG_1342.JPG', 'IMG_1343.JPG', 'IMG_1347.JPG', 'IMG_1348.JPG', 'IMG_1349.JPG', 'IMG_1359.JPG', 'IMG_1360.JPG', 'IMG_1364.JPG', 'STA_1271.JPG']
        },
        'The Clipper (Parthenos sylvia)': {
            title: 'The Clipper (Parthenos sylvia)',
            photos: ['IMG_1279.JPG']
        },
        'Tiger Longwing (Heliconius hecale)': {
            title: 'Tiger Longwing (Heliconius hecale)',
            photos: ['IMG_1287.JPG']
        },
        'Zebra Finch': {
            title: 'Zebra Finch',
            photos: ['IMG_1290.JPG', 'IMG_1291.JPG', 'IMG_1299.JPG', 'IMG_1355.JPG', 'IMG_1356.JPG', 'IMG_1357.JPG', 'IMG_1358.JPG']
        }
    };

    // Helper function to create URL-safe filenames
    function createSafeFilename(collectionName) {
        return collectionName.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    }

    // Generate collections dynamically
    function generatePhotoCollections() {
        const photoCollectionsContainer = document.querySelector('.photo-collections');
        if (!photoCollectionsContainer) return;

        // Clear existing content
        photoCollectionsContainer.innerHTML = '';

        // Generate collection items
        Object.keys(photoCollections).forEach(collectionKey => {
            const collection = photoCollections[collectionKey];
            const collectionItem = document.createElement('div');
            collectionItem.className = 'collection-item';
            collectionItem.setAttribute('data-collection', collectionKey);

            const coverImage = collection.photos[0]; // First image as cover
            const photoCount = collection.photos.length;
            const safeFilename = createSafeFilename(collectionKey);

            collectionItem.innerHTML = `
                <div class="collection-preview">
                    <img src="images/${encodeURIComponent(collectionKey)}/${encodeURIComponent(coverImage)}" alt="${collection.title}" class="collection-image">
                    <div class="collection-overlay">
                        <h3 class="collection-title">${collection.title}</h3>
                        <p class="collection-count">${photoCount} photo${photoCount !== 1 ? 's' : ''}</p>
                        <span class="view-collection">view collection →</span>
                    </div>
                </div>
            `;

            // Add click event to navigate to collection page
            collectionItem.addEventListener('click', () => {
                window.location.href = `collection-${safeFilename}.html`;
            });

            photoCollectionsContainer.appendChild(collectionItem);
        });
    }

    // Initialize photo collections
    generatePhotoCollections();

    // Make photoCollections available globally for collection pages
    window.photoCollections = photoCollections;
}); 