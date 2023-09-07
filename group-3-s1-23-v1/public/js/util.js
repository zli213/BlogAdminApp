// Grab elements
const selectElement = (selector) => {
    const element = document.querySelector(selector);
    if(element) return element;
    throw new Error(`Something went wrong! Make sure that ${selector} exists/is typed correctly.`);  
};

// Notification JS
$(document).ready(function() {
    $('.bell-icon').on('click', function() {
        $('.notification-dropdown').toggleClass('hidden');
    });

    $(document).on('click', function(event) {
        if (!$(event.target).closest('.notification-container').length) {
            $('.notification-dropdown').addClass('hidden');
        }
    });
});
