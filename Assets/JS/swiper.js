var swiper = new Swiper('.swiper-container', {
    slidesPerView: 1,
    spaceBetween: 10,
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    breakpoints: {
        1024: {
            slidesPerView: 5,
            spaceBetween: 20,
        },
        600: {
            slidesPerView: 3,
            spaceBetween: 20,
        },
        480: {
            slidesPerView: 1,
            spaceBetween: 20,
        }
    }
});
