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
    const collectionItems = document.querySelectorAll('.collection-item');
    const galleryModal = document.getElementById('galleryModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const galleryGrid = document.getElementById('galleryGrid');
    const closeModal = document.getElementById('closeModal');

    // Photo collections data
    const photoCollections = {
        'nature-wildlife': {
            title: 'Nature & Wildlife',
            photos: [
                'IMG_1259.JPG', 'IMG_1260.JPG', 'IMG_1263.JPG', 'IMG_1264.JPG', 'IMG_1266.JPG', 
                'IMG_1267.JPG', 'IMG_1274.JPG', 'IMG_1275.JPG', 'IMG_1276.JPG', 'IMG_1277.JPG',
                'IMG_1278.JPG', 'IMG_1279.JPG', 'IMG_1280.JPG', 'IMG_1281.JPG', 'IMG_1282.JPG',
                'IMG_1283.JPG', 'IMG_1284.JPG', 'IMG_1285.JPG', 'IMG_1286.JPG', 'IMG_1287.JPG',
                'IMG_1288.JPG', 'IMG_1289.JPG'
            ]
        },
        'portraits-people': {
            title: 'Portraits & People',
            photos: [
                'IMG_1290.JPG', 'IMG_1291.JPG', 'IMG_1292.JPG', 'IMG_1293.JPG', 'IMG_1294.JPG',
                'IMG_1295.JPG', 'IMG_1296.JPG', 'IMG_1297.JPG', 'IMG_1298.JPG', 'IMG_1299.JPG',
                'IMG_1300.JPG', 'IMG_1301.JPG', 'IMG_1302.JPG', 'IMG_1304.JPG', 'IMG_1305.JPG',
                'IMG_1306.JPG', 'IMG_1307.JPG', 'IMG_1308.JPG', 'IMG_1309.JPG', 'IMG_1310.JPG',
                'IMG_1311.JPG', 'IMG_1312.JPG', 'IMG_1313.JPG', 'IMG_1314.JPG', 'IMG_1315.JPG',
                'IMG_1316.JPG', 'IMG_1317.JPG', 'IMG_1318.JPG'
            ]
        },
        'landscapes': {
            title: 'Landscapes',
            photos: [
                'IMG_1320.JPG', 'IMG_1321.JPG', 'IMG_1322.JPG', 'IMG_1323.JPG', 'IMG_1324.JPG',
                'IMG_1325.JPG', 'IMG_1326.JPG', 'IMG_1327.JPG', 'IMG_1328.JPG', 'IMG_1329.JPG',
                'IMG_1330.JPG', 'IMG_1331.JPG', 'IMG_1332.JPG', 'IMG_1333.JPG', 'IMG_1334.JPG',
                'IMG_1335.JPG', 'IMG_1336.JPG', 'IMG_1337.JPG', 'IMG_1338.JPG', 'IMG_1339.JPG',
                'IMG_1340.JPG', 'IMG_1341.JPG', 'IMG_1342.JPG', 'IMG_1343.JPG', 'IMG_1344.JPG',
                'IMG_1345.JPG', 'IMG_1346.JPG', 'IMG_1347.JPG', 'IMG_1348.JPG'
            ]
        },
        'street-macro': {
            title: 'Street & Macro',
            photos: [
                'IMG_1350.JPG', 'IMG_1351.JPG', 'IMG_1352.JPG', 'IMG_1353.JPG', 'IMG_1354.JPG',
                'IMG_1355.JPG', 'IMG_1356.JPG', 'IMG_1357.JPG', 'IMG_1358.JPG', 'IMG_1359.JPG',
                'IMG_1360.JPG', 'IMG_1361.JPG', 'IMG_1362.JPG', 'IMG_1363.JPG', 'IMG_1364.JPG',
                'IMG_1365.JPG', 'IMG_1366.JPG', 'IMG_1367.JPG', 'IMG_1368.JPG', 'IMG_1369.JPG',
                'IMG_1370.JPG', 'IMG_1371.JPG', 'IMG_1372.JPG', 'IMG_1373.JPG', 'IMG_1374.JPG',
                'IMG_1375.JPG', 'IMG_1376.JPG', 'IMG_1377.JPG', 'IMG_1378.JPG', 'IMG_1379.JPG',
                'IMG_1380.JPG', 'IMG_1381.JPG', 'IMG_1382.JPG', 'IMG_1383.JPG', 'IMG_1384.JPG',
                'IMG_1385.JPG', 'IMG_1386.JPG', 'IMG_1387.JPG', 'IMG_1388.JPG', 'IMG_1389.JPG'
            ]
        },
        'abstract-artistic': {
            title: 'Abstract & Artistic',
            photos: [
                'IMG_1390.JPG', 'IMG_1391.JPG', 'IMG_1392.JPG', 'IMG_1393.JPG', 'IMG_1394.JPG',
                'IMG_1395.JPG', 'IMG_1396.JPG', 'IMG_1397.JPG', 'IMG_1398.JPG', 'IMG_1399.JPG',
                'IMG_1400.JPG', 'IMG_1401.JPG', 'IMG_1402.JPG', 'IMG_1403.JPG', 'IMG_1404.JPG',
                'IMG_1405.JPG', 'IMG_1406.JPG', 'IMG_1407.JPG', 'IMG_1408.JPG', 'IMG_1409.JPG',
                'IMG_1410.JPG', 'IMG_1411.JPG', 'IMG_1412.JPG', 'IMG_1413.JPG', 'IMG_1414.JPG',
                'IMG_1415.JPG', 'IMG_1416.JPG', 'IMG_1417.JPG', 'IMG_1418.JPG', 'IMG_1419.JPG',
                'IMG_1420.JPG', 'IMG_1421.JPG', 'IMG_1422.JPG', 'IMG_1423.JPG', 'IMG_1424.JPG',
                'STB_1273.JPG', 'STA_1272.JPG'
            ]
        }
    };

    // Open gallery modal
    function openGallery(collectionName) {
        const collection = photoCollections[collectionName];
        if (!collection) return;

        modalTitle.textContent = collection.title;
        galleryGrid.innerHTML = '';

        // Load images
        collection.photos.forEach(photo => {
            const img = document.createElement('img');
            img.src = `images/${collectionName}/${photo}`;
            img.alt = photo;
            img.className = 'gallery-image';
            img.loading = 'lazy';
            
            // Add click event for full-size view
            img.addEventListener('click', () => {
                window.open(img.src, '_blank');
            });
            
            galleryGrid.appendChild(img);
        });

        // Show modal
        galleryModal.classList.add('active');
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Close gallery modal
    function closeGallery() {
        galleryModal.classList.remove('active');
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Add event listeners
    collectionItems.forEach(item => {
        item.addEventListener('click', () => {
            const collectionName = item.dataset.collection;
            openGallery(collectionName);
        });
    });

    closeModal.addEventListener('click', closeGallery);
    modalOverlay.addEventListener('click', closeGallery);

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && galleryModal.classList.contains('active')) {
            closeGallery();
        }
    });
}); 