document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const homeBtn = document.getElementById('home-btn');
    const favoritesBtn = document.getElementById('favorites-btn');
    const filtersBtn = document.getElementById('filters-btn');
    const swipeView = document.getElementById('swipe-view');
    const favoritesView = document.getElementById('favorites-view');
    const filtersView = document.getElementById('filters-view');
    const cardContainer = document.querySelector('.card-container');
    const noMoreCards = document.querySelector('.no-more-cards');
    const likeBtn = document.getElementById('like-btn');
    const dislikeBtn = document.getElementById('dislike-btn');
    const favoritesContainer = document.querySelector('.favorites-container');
    const noFavorites = document.querySelector('.no-favorites');
    const filtersForm = document.getElementById('filters-form');
    const resetFiltersBtn = document.querySelector('.reset-filters-btn');
    const modal = document.getElementById('apartment-modal');
    const closeModal = document.querySelector('.close-modal');

    // App State
    let apartments = [];
    let currentIndex = 0;
    let activeCard = null;
    let startX = 0;
    let currentX = 0;
    let isSwiping = false;
    let currentImageIndex = 0;
    let filters = {
        minPrice: null,
        maxPrice: null,
        bedrooms: [],
        amenities: []
    };

    // Navigation
    homeBtn.addEventListener('click', () => {
        setActiveView(swipeView);
        setActiveNavButton(homeBtn);
    });

    favoritesBtn.addEventListener('click', () => {
        setActiveView(favoritesView);
        setActiveNavButton(favoritesBtn);
        loadFavorites();
    });

    filtersBtn.addEventListener('click', () => {
        setActiveView(filtersView);
        setActiveNavButton(filtersBtn);
    });

    function setActiveView(view) {
        [swipeView, favoritesView, filtersView].forEach(v => {
            v.classList.remove('active');
        });
        view.classList.add('active');
    }

    function setActiveNavButton(button) {
        [homeBtn, favoritesBtn, filtersBtn].forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
    }

    // Fetch Apartments
    async function fetchApartments() {
        try {
            const response = await fetch('/apartments');
            apartments = await response.json();
            renderCards();
        } catch (error) {
            console.error('Error fetching apartments:', error);
        }
    }

    // Apply Filters
    function applyFilters() {
        const minPrice = document.getElementById('min-price').value;
        const maxPrice = document.getElementById('max-price').value;
        const bedroomCheckboxes = document.querySelectorAll('input[name="bedrooms"]:checked');
        const amenityCheckboxes = document.querySelectorAll('input[name="amenities"]:checked');

        filters.minPrice = minPrice ? parseInt(minPrice) : null;
        filters.maxPrice = maxPrice ? parseInt(maxPrice) : null;
        filters.bedrooms = Array.from(bedroomCheckboxes).map(cb => cb.value);
        filters.amenities = Array.from(amenityCheckboxes).map(cb => cb.value);

        // Reset and re-render cards
        currentIndex = 0;
        renderCards();

        // Go back to swipe view
        setActiveView(swipeView);
        setActiveNavButton(homeBtn);
    }

    // Reset Filters
    function resetFilters() {
        document.getElementById('min-price').value = '';
        document.getElementById('max-price').value = '';
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });

        filters = {
            minPrice: null,
            maxPrice: null,
            bedrooms: [],
            amenities: []
        };

        // Reset and re-render cards
        currentIndex = 0;
        renderCards();
    }

    // Filter Apartments
    function getFilteredApartments() {
        return apartments.filter(apt => {
            // Price filter
            if (filters.minPrice && apt.price < filters.minPrice) return false;
            if (filters.maxPrice && apt.price > filters.maxPrice) return false;

            // Bedroom filter
            if (filters.bedrooms.length > 0) {
                const bedroomMatch = filters.bedrooms.some(bed => {
                    if (bed === '0' && apt.bedrooms === 0) return true;
                    if (bed === '1' && apt.bedrooms === 1) return true;
                    if (bed === '2' && apt.bedrooms === 2) return true;
                    if (bed === '3+' && apt.bedrooms >= 3) return true;
                    return false;
                });
                if (!bedroomMatch) return false;
            }

            // Amenities filter
            if (filters.amenities.length > 0) {
                const amenityMatch = filters.amenities.every(amenity => 
                    apt.amenities.includes(amenity)
                );
                if (!amenityMatch) return false;
            }

            return true;
        });
    }

    // Render Cards
    function renderCards() {
        // Clear existing cards
        cardContainer.querySelectorAll('.apartment-card').forEach(card => {
            card.remove();
        });

        const filteredApartments = getFilteredApartments();
        
        if (filteredApartments.length === 0 || currentIndex >= filteredApartments.length) {
            noMoreCards.classList.remove('hidden');
            return;
        }

        noMoreCards.classList.add('hidden');

        // Create cards for the next few apartments
        const cardsToRender = Math.min(3, filteredApartments.length - currentIndex);
        
        for (let i = 0; i < cardsToRender; i++) {
            const apartment = filteredApartments[currentIndex + i];
            const card = createCard(apartment, i === 0);
            cardContainer.appendChild(card);
            
            if (i === 0) {
                activeCard = card;
                setupCardSwipe(card);
            }
        }
    }

    // Create Card
    function createCard(apartment, isActive) {
        const card = document.createElement('div');
        card.className = `apartment-card ${isActive ? 'active' : ''}`;
        card.dataset.id = apartment.id;

        // Create swipe overlay
        const overlay = document.createElement('div');
        overlay.className = 'swipe-overlay';
        card.appendChild(overlay);

        // Create image container
        const imageContainer = document.createElement('div');
        imageContainer.className = 'card-image-container';
        
        // Add first image
        const img = document.createElement('img');
        img.src = `/static/images/${apartment.images[0]}`;
        img.alt = apartment.title;
        img.onerror = function() {
            this.src = 'https://via.placeholder.com/400x300?text=No+Image+Available';
        };
        imageContainer.appendChild(img);

        // Add image counter if there are multiple images
        if (apartment.images.length > 1) {
            const counter = document.createElement('div');
            counter.className = 'image-counter';
            counter.textContent = `1/${apartment.images.length}`;
            imageContainer.appendChild(counter);
        }

        card.appendChild(imageContainer);

        // Create info section
        const info = document.createElement('div');
        info.className = 'card-info';

        // Title
        const title = document.createElement('h2');
        title.textContent = apartment.title;
        info.appendChild(title);

        // Price
        const price = document.createElement('div');
        price.className = 'card-price';
        price.textContent = `$${apartment.price}/month`;
        info.appendChild(price);

        // Details
        const details = document.createElement('div');
        details.className = 'card-details';
        
        const bedrooms = document.createElement('span');
        bedrooms.textContent = apartment.bedrooms === 0 ? 'Studio' : `${apartment.bedrooms} BR`;
        
        const bathrooms = document.createElement('span');
        bathrooms.textContent = `${apartment.bathrooms} Bath`;
        
        const sqft = document.createElement('span');
        sqft.textContent = `${apartment.sqft} sqft`;
        
        details.appendChild(bedrooms);
        details.appendChild(bathrooms);
        details.appendChild(sqft);
        info.appendChild(details);

        // Address
        const address = document.createElement('div');
        address.className = 'card-address';
        address.textContent = apartment.address;
        info.appendChild(address);

        // Description
        const description = document.createElement('div');
        description.className = 'card-description';
        description.textContent = apartment.description;
        info.appendChild(description);

        // View more link
        const viewMore = document.createElement('a');
        viewMore.className = 'view-more';
        viewMore.textContent = 'View Details';
        viewMore.addEventListener('click', (e) => {
            e.stopPropagation();
            openModal(apartment);
        });
        info.appendChild(viewMore);

        card.appendChild(info);

        // Setup image navigation
        setupImageNavigation(card, apartment);

        return card;
    }

    // Setup Image Navigation
    function setupImageNavigation(card, apartment) {
        if (apartment.images.length <= 1) return;

        const imageContainer = card.querySelector('.card-image-container');
        const img = imageContainer.querySelector('img');
        const counter = imageContainer.querySelector('.image-counter');
        
        let currentImgIndex = 0;

        // Left area click - previous image
        const leftArea = document.createElement('div');
        leftArea.style.position = 'absolute';
        leftArea.style.top = '0';
        leftArea.style.left = '0';
        leftArea.style.width = '30%';
        leftArea.style.height = '100%';
        leftArea.style.zIndex = '1';
        leftArea.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!isSwiping) {
                currentImgIndex = (currentImgIndex - 1 + apartment.images.length) % apartment.images.length;
                img.src = `/static/images/${apartment.images[currentImgIndex]}`;
                counter.textContent = `${currentImgIndex + 1}/${apartment.images.length}`;
            }
        });
        imageContainer.appendChild(leftArea);

        // Right area click - next image
        const rightArea = document.createElement('div');
        rightArea.style.position = 'absolute';
        rightArea.style.top = '0';
        rightArea.style.right = '0';
        rightArea.style.width = '30%';
        rightArea.style.height = '100%';
        rightArea.style.zIndex = '1';
        rightArea.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!isSwiping) {
                currentImgIndex = (currentImgIndex + 1) % apartment.images.length;
                img.src = `/static/images/${apartment.images[currentImgIndex]}`;
                counter.textContent = `${currentImgIndex + 1}/${apartment.images.length}`;
            }
        });
        imageContainer.appendChild(rightArea);
    }

    // Setup Card Swipe
    function setupCardSwipe(card) {
        card.addEventListener('touchstart', handleTouchStart, { passive: true });
        card.addEventListener('touchmove', handleTouchMove, { passive: true });
        card.addEventListener('touchend', handleTouchEnd);
        
        card.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    function handleTouchStart(e) {
        startX = e.touches[0].clientX;
        isSwiping = false;
    }

    function handleTouchMove(e) {
        if (startX === 0) return;
        
        currentX = e.touches[0].clientX;
        const diffX = currentX - startX;
        
        if (Math.abs(diffX) > 10) {
            isSwiping = true;
            
            // Move the card
            this.style.transform = `translateX(${diffX}px) rotate(${diffX * 0.05}deg)`;
            
            // Show overlay
            const overlay = this.querySelector('.swipe-overlay');
            if (diffX > 50) {
                overlay.classList.add('like');
                overlay.classList.remove('dislike');
                overlay.textContent = 'LIKE';
                overlay.style.opacity = Math.min(diffX / 100, 1);
            } else if (diffX < -50) {
                overlay.classList.add('dislike');
                overlay.classList.remove('like');
                overlay.textContent = 'NOPE';
                overlay.style.opacity = Math.min(Math.abs(diffX) / 100, 1);
            } else {
                overlay.classList.remove('like', 'dislike');
                overlay.style.opacity = 0;
            }
        }
    }

    function handleTouchEnd(e) {
        if (!isSwiping) return;
        
        const diffX = currentX - startX;
        const overlay = this.querySelector('.swipe-overlay');
        
        if (diffX > 100) {
            // Swipe right - like
            this.classList.add('swipe-right');
            likeApartment(this.dataset.id);
        } else if (diffX < -100) {
            // Swipe left - dislike
            this.classList.add('swipe-left');
            dislikeApartment(this.dataset.id);
        } else {
            // Reset position
            this.style.transform = '';
            overlay.style.opacity = 0;
            overlay.classList.remove('like', 'dislike');
        }
        
        startX = 0;
        currentX = 0;
    }

    function handleMouseDown(e) {
        startX = e.clientX;
        isSwiping = false;
        this.style.transition = 'none';
    }

    function handleMouseMove(e) {
        if (startX === 0 || !activeCard) return;
        
        currentX = e.clientX;
        const diffX = currentX - startX;
        
        if (Math.abs(diffX) > 10) {
            isSwiping = true;
            
            // Move the card
            activeCard.style.transform = `translateX(${diffX}px) rotate(${diffX * 0.05}deg)`;
            
            // Show overlay
            const overlay = activeCard.querySelector('.swipe-overlay');
            if (diffX > 50) {
                overlay.classList.add('like');
                overlay.classList.remove('dislike');
                overlay.textContent = 'LIKE';
                overlay.style.opacity = Math.min(diffX / 100, 1);
            } else if (diffX < -50) {
                overlay.classList.add('dislike');
                overlay.classList.remove('like');
                overlay.textContent = 'NOPE';
                overlay.style.opacity = Math.min(Math.abs(diffX) / 100, 1);
            } else {
                overlay.classList.remove('like', 'dislike');
                overlay.style.opacity = 0;
            }
        }
    }

    function handleMouseUp(e) {
        if (!isSwiping || !activeCard) {
            startX = 0;
            currentX = 0;
            return;
        }
        
        const diffX = currentX - startX;
        const overlay = activeCard.querySelector('.swipe-overlay');
        activeCard.style.transition = 'transform 0.3s';
        
        if (diffX > 100) {
            // Swipe right - like
            activeCard.classList.add('swipe-right');
            likeApartment(activeCard.dataset.id);
        } else if (diffX < -100) {
            // Swipe left - dislike
            activeCard.classList.add('swipe-left');
            dislikeApartment(activeCard.dataset.id);
        } else {
            // Reset position
            activeCard.style.transform = '';
            overlay.style.opacity = 0;
            overlay.classList.remove('like', 'dislike');
        }
        
        startX = 0;
        currentX = 0;
    }

    // Like/Dislike Actions
    likeBtn.addEventListener('click', () => {
        if (!activeCard) return;
        
        activeCard.classList.add('swipe-right');
        likeApartment(activeCard.dataset.id);
    });

    dislikeBtn.addEventListener('click', () => {
        if (!activeCard) return;
        
        activeCard.classList.add('swipe-left');
        dislikeApartment(activeCard.dataset.id);
    });

    async function likeApartment(id) {
        try {
            await fetch(`/like/${id}`, { method: 'POST' });
            nextCard();
        } catch (error) {
            console.error('Error liking apartment:', error);
        }
    }

    async function dislikeApartment(id) {
        try {
            await fetch(`/dislike/${id}`, { method: 'POST' });
            nextCard();
        } catch (error) {
            console.error('Error disliking apartment:', error);
        }
    }

    function nextCard() {
        setTimeout(() => {
            currentIndex++;
            renderCards();
        }, 300);
    }

    // Load Favorites
    async function loadFavorites() {
        try {
            const response = await fetch('/preferences');
            const data = await response.json();
            
            favoritesContainer.innerHTML = '';
            
            if (data.liked.length === 0) {
                noFavorites.classList.remove('hidden');
                return;
            }
            
            noFavorites.classList.add('hidden');
            
            data.liked.forEach(apartment => {
                const card = createFavoriteCard(apartment);
                favoritesContainer.appendChild(card);
            });
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    }

    function createFavoriteCard(apartment) {
        const card = document.createElement('div');
        card.className = 'favorite-card';
        card.dataset.id = apartment.id;
        
        // Image
        const imageDiv = document.createElement('div');
        imageDiv.className = 'favorite-image';
        
        const img = document.createElement('img');
        img.src = `/static/images/${apartment.images[0]}`;
        img.alt = apartment.title;
        img.onerror = function() {
            this.src = 'https://via.placeholder.com/400x200?text=No+Image+Available';
        };
        
        imageDiv.appendChild(img);
        card.appendChild(imageDiv);
        
        // Info
        const info = document.createElement('div');
        info.className = 'favorite-info';
        
        const title = document.createElement('h3');
        title.textContent = apartment.title;
        info.appendChild(title);
        
        const price = document.createElement('div');
        price.className = 'favorite-price';
        price.textContent = `$${apartment.price}/month`;
        info.appendChild(price);
        
        const details = document.createElement('div');
        details.className = 'favorite-details';
        
        const bedrooms = document.createElement('span');
        bedrooms.textContent = apartment.bedrooms === 0 ? 'Studio' : `${apartment.bedrooms} BR`;
        
        const bathrooms = document.createElement('span');
        bathrooms.textContent = `${apartment.bathrooms} Bath`;
        
        const sqft = document.createElement('span');
        sqft.textContent = `${apartment.sqft} sqft`;
        
        details.appendChild(bedrooms);
        details.appendChild(bathrooms);
        details.appendChild(sqft);
        info.appendChild(details);
        
        const address = document.createElement('div');
        address.className = 'favorite-address';
        address.textContent = apartment.address;
        info.appendChild(address);
        
        card.appendChild(info);
        
        // Click to view details
        card.addEventListener('click', () => {
            openModal(apartment);
        });
        
        return card;
    }

    // Modal
    function openModal(apartment) {
        const modalBody = modal.querySelector('.modal-body');
        modalBody.innerHTML = '';
        
        // Images
        const imageContainer = document.createElement('div');
        imageContainer.className = 'modal-image-container';
        
        const img = document.createElement('img');
        img.src = `/static/images/${apartment.images[0]}`;
        img.alt = apartment.title;
        img.onerror = function() {
            this.src = 'https://via.placeholder.com/600x400?text=No+Image+Available';
        };
        imageContainer.appendChild(img);
        
        // Image navigation dots
        if (apartment.images.length > 1) {
            const imageNav = document.createElement('div');
            imageNav.className = 'modal-image-nav';
            
            apartment.images.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.className = `image-dot ${index === 0 ? 'active' : ''}`;
                dot.addEventListener('click', () => {
                    // Update image
                    img.src = `/static/images/${apartment.images[index]}`;
                    
                    // Update active dot
                    imageNav.querySelectorAll('.image-dot').forEach((d, i) => {
                        d.classList.toggle('active', i === index);
                    });
                });
                imageNav.appendChild(dot);
            });
            
            imageContainer.appendChild(imageNav);
        }
        
        modalBody.appendChild(imageContainer);
        
        // Details
        const details = document.createElement('div');
        details.className = 'modal-details';
        
        const title = document.createElement('h2');
        title.textContent = apartment.title;
        details.appendChild(title);
        
        const price = document.createElement('div');
        price.className = 'modal-price';
        price.textContent = `$${apartment.price}/month`;
        details.appendChild(price);
        
        const specs = document.createElement('div');
        specs.className = 'modal-specs';
        
        const bedrooms = document.createElement('span');
        bedrooms.textContent = apartment.bedrooms === 0 ? 'Studio' : `${apartment.bedrooms} BR`;
        
        const bathrooms = document.createElement('span');
        bathrooms.textContent = `${apartment.bathrooms} Bath`;
        
        const sqft = document.createElement('span');
        sqft.textContent = `${apartment.sqft} sqft`;
        
        specs.appendChild(bedrooms);
        specs.appendChild(bathrooms);
        specs.appendChild(sqft);
        details.appendChild(specs);
        
        const address = document.createElement('div');
        address.className = 'modal-address';
        address.textContent = apartment.address;
        details.appendChild(address);
        
        const description = document.createElement('div');
        description.className = 'modal-description';
        description.textContent = apartment.description;
        details.appendChild(description);
        
        // Amenities
        const amenitiesSection = document.createElement('div');
        amenitiesSection.className = 'modal-amenities';
        
        const amenitiesTitle = document.createElement('h3');
        amenitiesTitle.textContent = 'Amenities';
        amenitiesSection.appendChild(amenitiesTitle);
        
        const amenitiesList = document.createElement('div');
        amenitiesList.className = 'amenities-list';
        
        apartment.amenities.forEach(amenity => {
            const tag = document.createElement('div');
            tag.className = 'amenity-tag';
            tag.textContent = amenity;
            amenitiesList.appendChild(tag);
        });
        
        amenitiesSection.appendChild(amenitiesList);
        details.appendChild(amenitiesSection);
        
        // Actions
        const actions = document.createElement('div');
        actions.className = 'modal-actions';
        
        const dislikeBtn = document.createElement('button');
        dislikeBtn.className = 'modal-dislike';
        dislikeBtn.innerHTML = '<i class="fas fa-times"></i> Not Interested';
        dislikeBtn.addEventListener('click', () => {
            dislikeApartment(apartment.id);
            modal.style.display = 'none';
            
            // If we're in the favorites view, refresh the list
            if (favoritesView.classList.contains('active')) {
                loadFavorites();
            }
        });
        
        const likeBtn = document.createElement('button');
        likeBtn.className = 'modal-like';
        likeBtn.innerHTML = '<i class="fas fa-heart"></i> Interested';
        likeBtn.addEventListener('click', () => {
            likeApartment(apartment.id);
            modal.style.display = 'none';
            
            // If we're in the favorites view, refresh the list
            if (favoritesView.classList.contains('active')) {
                loadFavorites();
            }
        });
        
        actions.appendChild(dislikeBtn);
        actions.appendChild(likeBtn);
        details.appendChild(actions);
        
        modalBody.appendChild(details);
        
        modal.style.display = 'block';
    }

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Filters Form
    filtersForm.addEventListener('submit', (e) => {
        e.preventDefault();
        applyFilters();
    });

    resetFiltersBtn.addEventListener('click', resetFilters);

    // Initialize
    fetchApartments();
});