/*******************spinner**************************/
window.addEventListener('load', function () {
    setTimeout(function () {
        document.getElementById('loading-spinner').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
    }, 1000);
});
/*******************spinner**************************/
/******************navlink start***************************/
document.querySelectorAll('.category-link').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        const category = this.dataset.category;
        sessionStorage.setItem('selectedCategory', category);
        window.location.href = this.href;
    });
});
/***************************navlink end**************************/


/*****************************product start****************************/
$(document).ready(function () {
    const category = sessionStorage.getItem('selectedCategory');
    if (category) {
        fetchCategoryData(category);
    }

    function fetchCategoryData(category) {
        $.ajax({
            url: 'https://mocki.io/v1/6536f116-e4ea-431a-abdc-555f11e9b19d',
            method: 'GET',
            success: function (data) {
                const filteredData = data.filter(item => item.category.toLowerCase() === category.toLowerCase());
                displayProducts(filteredData);
            },
            error: function (error) {
                console.log("Error fetching data:", error);
            }
        });
    }

    function displayProducts(products) {
        const productContainer = $('#product-cards');
        productContainer.empty();
        products.forEach(product => {
            const productCard = `
                <div class="col-xxl-2 col-lg-3 col-md-4 col-sm-6 d-flex justify-content-center" style="padding: 0; padding: 0;">
                    <div class="card main-card product-card mt-5 my-5 mt-lg-0" data-product='${JSON.stringify(product)}' style="width:min-content;border:none;margin: 0;">
                        <div class="card-body text-center">
                            <img src="${product.main_image}" alt="${product.name}" width="200px" style="object-fit: contain;" height="200px">
                            <h5 class="mt-2 text-truncate" style="max-width: 200px;">${product.name}</h5>
                            <h3 class="mt-2 text-truncate">₹${product.price}</h3>
                            <div class="d-flex justify-content-center">
                                <button class="btn mx-1">View</button>
                                <button class="btn"><i class="fas fa-heart"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            productContainer.append(productCard);
        });


        $('.product-card').on('click', function () {
            const productData = $(this).data('product');
            sessionStorage.setItem('productDetails', JSON.stringify(productData));
            window.location.href = 'product-details.html';
        });
    }
});
/****************************product end******************************/


/*************************product details start**********************/
$(document).ready(function () {
    
    const productDetails = JSON.parse(sessionStorage.getItem('productDetails'));

    function showToast(message) {
        const toast = $('#toast');
        $('.toast-body').text(message);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }

    if (productDetails) {
        $('#product-main-image').attr('src', productDetails.main_image);
        $('#product-name').text(productDetails.name);
        $('#product-price').text(`₹${productDetails.price}`);
        $('#product-description').text(productDetails.description);
        $('#product-rating').text(productDetails.rating);
        $('#product-stars').text(productDetails.stars);
      

        // Display additional images
        productDetails.additional_images.forEach(image => {
            $('#product-additional-images').append(`<img src="${image}" alt="${productDetails.name}" class="img-thumbnail additional-image">`);
        });

        // Change main image on mouseover
        $(document).on('mouseover', '.additional-image', function () {
            var newSrc = $(this).attr('src');
            $('#product-main-image').attr('src', newSrc);
        });
    } else {
        console.error("Product details are not found in sessionStorage.");
        $('#product-details').html('<p>Product details not available.</p>');
    }

     
    $('.btn i.fa-heart').on('click', function () {
        const likedProducts = JSON.parse(localStorage.getItem('likedProducts')) || [];
        const productExists = likedProducts.some(item => item.id === productDetails.id);

        if (!productExists) {
            likedProducts.push(productDetails);
            localStorage.setItem('likedProducts', JSON.stringify(likedProducts));
            showToast('Product added to your likes!');
        } else {
            showToast('Product already in your likes!');
        }
    });

    $('.btn-add-to-cart').on('click', function () {
        console.log("Add to cart clicked");  
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const productExists = cart.some(item => item.id === productDetails.id);
    
        if (!productExists) {
            cart.push({ ...productDetails, quantity: 1 });
            localStorage.setItem('cart', JSON.stringify(cart));
            displayCartItems();
            showToast('Your item has been added to the cart!');
        } else {
            showToast('Product already in cart!');
        }
    });
    

    function displayCartItems() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartContainer = $('#cart-items');
        cartContainer.empty();

        let totalPrice = 0;

        cart.forEach(item => {
            const price = parseFloat(item.price.replace(/,/g, ''));
            const quantity = item.quantity || 1;

            if (!isNaN(price) && !isNaN(quantity)) {
                totalPrice += price * quantity;
            } else {
                console.error("Invalid price or quantity:", price, quantity);
            }

            cartContainer.append(`
                <div class="cart-item d-flex align-items-center mb-3">
                    <img src="${item.main_image}" alt="${item.name}" class="img-thumbnail" width="80">
                    <div class="ms-3 flex-grow-1">
                        <h6 class="mb-1 text-truncate" style="max-width: 70px;">${item.name}</h6>
                        <span class="text-muted">₹${price.toLocaleString()}</span> <!-- Format price with commas -->
                    </div>
                    <div class="quantity-selector d-flex align-items-center ms-3">
                        <button class="btn btn-sm btn-quantity-change" data-id="${item.id}" data-change="-1">-</button>
                        <input type="text" class="form-control form-control-sm mx-2 quantity-input" id="quantity-${item.id}" value="${quantity}" readonly>
                        <button class="btn btn-sm btn-quantity-change" data-id="${item.id}" data-change="1">+</button>
                    </div>
                    <button class="btn btn-danger btn-sm ms-3 btn-remove" data-id="${item.id}">Remove</button>
                </div>
            `);
        });

        $('#cart-total').html(`Total: ₹${totalPrice.toLocaleString()}`);

        $('.btn-quantity-change').off('click').on('click', function () {
            const itemId = $(this).data('id');
            const change = parseInt($(this).data('change'), 10);
            changeQuantity(itemId, change);
        });

        $('.btn-remove').off('click').on('click', function () {
            const itemId = $(this).data('id');
            removeFromCart(itemId);
        });
    }

    function changeQuantity(itemId, change) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.map(item => {
            if (item.id === itemId) {
                item.quantity = Math.max(1, Math.min(7, item.quantity + change));
                console.log("Quantity updated");
            }
            return item;
        });
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
    }

    function removeFromCart(itemId) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.filter(item => item.id !== itemId);
        localStorage.setItem('cart', JSON.stringify(cart));
        displayCartItems();
    }
  

    displayCartItems();

   

});
/*************************product details ends**********************/

/*********************related product start************************/
$(document).ready(function () {
    function initializeReviews(productId) {
         
        const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
        const productReviews = reviews.filter(review => review.productId === productId);
    
         
        const reviewsContainer = $('#product-reviews');
        reviewsContainer.empty(); 
        if (productReviews.length > 0) {
            productReviews.forEach(review => {
                reviewsContainer.append(`
                    <div class="review-item">
                        <h5>${review.title}</h5>
                        <p>${review.content}</p>
                        <small>Rating: ${review.rating}</small>
                    </div>
                `);
            });
        } else {
            reviewsContainer.html('<p>No reviews yet.</p>');
        }
    }
    
    function fetchRelatedProducts() {
        $.ajax({
            url: 'https://mocki.io/v1/6536f116-e4ea-431a-abdc-555f11e9b19d',
            method: 'GET',
            success: function (data) {
                console.log('Related products data:', data);

                const productDetails = JSON.parse(sessionStorage.getItem('productDetails'));
                if (!productDetails || !productDetails.id) {
                    console.error("Product details not found or missing ID.");
                    return;
                }

                const relatedProducts = data.filter(product => product.id !== productDetails.id);
                console.log('Filtered related products:', relatedProducts);

                $('#related-products').empty();
                relatedProducts.forEach(product => {
                    $('#related-products').append(`
                        <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                            <div class="card product-card" data-product='${JSON.stringify(product)}'>
                                <img src="${product.main_image}" class="card-img-top" alt="${product.name}" width="200px" height="200px">
                                <div class="card-body">
                                    <h5 class="text-truncate">${product.name}</h5>
                                    <p class="card-text text-truncate" style="max-width: 200px;">₹${product.price}</p>
                                    <p class="card-text text-truncate text-warning h4">${product.stars}</p>
                                    <button class="btn">View Details</button>
                                </div>
                            </div>
                        </div>
                    `);
                });

                $('.product-card').on('click', function () {
                    const productData = $(this).data('product');
                    sessionStorage.setItem('productDetails', JSON.stringify(productData));
                    window.location.href = 'product-details.html';
                });
            },
            error: function (error) {
                console.error('Error fetching related products:', error);
            }
        });
    }

    fetchRelatedProducts();
});
/*********************related product ends************************/


/*************************like start **********************/
$(document).ready(function () {
    let likedProducts = JSON.parse(localStorage.getItem('likedProducts')) || [];

    if (likedProducts.length > 0) {
        likedProducts.forEach(product => {
            $('#liked-products-container').append(`
                <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                    <div class="card  main-card product-card" data-product='${JSON.stringify(product)}'>
                        <img src="${product.main_image}" class="card-img-top" alt="${product.name}" width="200px" height="200px">
                        <div class="card-body">
                            <h5 class="text-truncate">${product.name}</h5>
                            <p class="card-text">₹${product.price}</p>
                            <p class="card-text text-warning h4">${product.stars}</p>                           
                            <button class="btn btn-remove-from-likes btn-danger mt-2">Remove</button>
                        </div>
                    </div>
                </div>
            `);
        });

         
        $('.btn-add-to-cart').on('click', function () {
            const productId = $(this).closest('.product-card').data('product').id;
            const productData = likedProducts.find(product => product.id === productId);
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const productExists = cart.some(item => item.id === productData.id);

            if (!productExists) {
                cart.push({ ...productData, quantity: 1 });
                localStorage.setItem('cart', JSON.stringify(cart));
                showToast('Your item has been added to the cart!');
            } else {
                showToast('Product already in cart!');
            }
        });

        
        $('.btn-remove-from-likes').on('click', function () {
            const productId = $(this).closest('.product-card').data('product').id;
            likedProducts = likedProducts.filter(product => product.id !== productId);
            localStorage.setItem('likedProducts', JSON.stringify(likedProducts));
            $(this).closest('.col-lg-3').remove();
            showToast('Product removed from your likes!');
        });

         
        $('.product-card').on('click', function () {
            const productData = $(this).data('product');
            console.log("Product data to store:", productData); 
            sessionStorage.setItem('productDetails', JSON.stringify(productData));
            window.location.href = 'product-details.html';
        });

    } else {
         
        $('#liked-products-container').html('<p>You have no liked products yet.</p>');
    }
});

/*************************like end**********************/


/***********************signin-login start*********************/
// Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const showSignup = document.getElementById('showSignup');
const showLogin = document.getElementById('showLogin');
const modalTitle = document.getElementById('authModalLabel');

// Show Signup Form
showSignup.addEventListener('click', function () {
    loginForm.classList.add('d-none');
    signupForm.classList.remove('d-none');
    modalTitle.textContent = 'Sign Up';
});

// Show Login Form
showLogin.addEventListener('click', function () {
    signupForm.classList.add('d-none');
    loginForm.classList.remove('d-none');
    modalTitle.textContent = 'Login';
});
/*****************************signin-login end**************************/



/***************************Add reveiws  start************************************/
$(document).ready(function () {
    function fetchProductDetails() {
        $.ajax({
            url: 'https://mocki.io/v1/6536f116-e4ea-431a-abdc-555f11e9b19d',
            method: 'GET',
            success: function (response) {
                console.log('API Response:', response);

                const productDetails = JSON.parse(sessionStorage.getItem('productDetails'));

                if (!productDetails || !productDetails.id) {
                    console.error('Product details not found in sessionStorage');
                    return;
                }

                const productId = productDetails.id;
                $('#product-id').val(productId);
                console.log('Product ID set:', productId);

                initializeReviews(productId);
            },
            error: function (error) {
                console.error('Error fetching product details:', error);
            }
        });
    }

    function initializeReviews(productId) {
        function displayReviews(currentProductId) {
            console.log('Displaying reviews for product ID:', currentProductId);

            const reviewContainer = $('#review-list');
            reviewContainer.empty();

            const galleryContainer = $('#gallery-images');
            galleryContainer.empty();

            const reviews = JSON.parse(localStorage.getItem('productReviews_' + currentProductId)) || [];
            console.log('Fetched reviews:', reviews);

            if (reviews.length === 0) {
                reviewContainer.append('<p>No reviews available.</p>');
            } else {
                let allImages = [];
                reviews.forEach((review, index) => {
                     
                    const imageGallery = review.images.map(image => `
                        <img src="${image}" alt="Review Image" class="img-thumbnail mb-2 review-image" style="width: 100px; cursor: pointer;">
                    `).join('');

                    reviewContainer.append(`
                        <div class="col-lg-3 col-md-4 col-sm-6 mb-4" data-index="${index}">
                            <div class="card p-3 border rounded">
                                <!-- Image Gallery Section -->
                                <div class="mb-3">
                                    ${imageGallery}
                                </div>
                                <div class="card-body">
                                    <strong>${review.name}</strong>
                                    <p class="mb-1">${review.text}</p>
                                    <small class="text-muted">Reviewed on ${review.date}</small>
                                    <button class="btn btn-danger btn-sm float-end delete-review">Delete</button>
                                </div>
                            </div>
                        </div>
                    `);
 
                    allImages = allImages.concat(review.images);
                });
 
                const allImagesGallery = allImages.map(image => `                     
                        <img src="${image}" alt="Review Image" class="img-thumbnail gallery-image mx-1" style="width: 100px; cursor: pointer;height: 100px;">
                    
                `).join('');
                galleryContainer.html(allImagesGallery);
            }
 
            $('.review-image, .gallery-image').off('click').on('click', function () {
                const src = $(this).attr('src');
                $('#modal-image').attr('src', src);
                $('#imageModal').modal('show');
            });
 
            $('.delete-review').off('click').on('click', function () {
                const index = $(this).closest('.col-lg-3').data('index');
                deleteReview(index, currentProductId);
            });
        }

        $('#add-review-form').off('submit').on('submit', function (event) {
            event.preventDefault();

            const name = $('#reviewer-name').val();
            const text = $('#review-text').val();
            const date = new Date().toLocaleDateString();
            const imageInput = $('#review-images')[0];
            const images = Array.from(imageInput.files).map(file => URL.createObjectURL(file));

            const newReview = { name, text, date, images };

            let reviews = JSON.parse(localStorage.getItem('productReviews_' + productId)) || [];
            reviews.push(newReview);

            localStorage.setItem('productReviews_' + productId, JSON.stringify(reviews));
            console.log('Saved reviews:', reviews);
            displayReviews(productId);
            $('#addReviewModal').modal('hide');
        });

        function deleteReview(index, productId) {
            let reviews = JSON.parse(localStorage.getItem('productReviews_' + productId)) || [];
            reviews.splice(index, 1);
            localStorage.setItem('productReviews_' + productId, JSON.stringify(reviews));
            displayReviews(productId);
        }

        displayReviews(productId);
    }

    fetchProductDetails();
});
/***************************Add reveiws ends************************************/
