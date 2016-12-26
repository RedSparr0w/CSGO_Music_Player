// Init App
var myApp = new Framework7({
    modalTitle: 'Framework7',
    // Enable Material theme
    material: true,
});

// Expose Internal DOM library
var $$ = Dom7;

// Add main view
var mainView = myApp.addView('.view-main', {
});
// Add another view, which is in right panel
var rightView = myApp.addView('.view-right', {
});

// Show/hide preloader for remote ajax loaded pages
// Probably should be removed on a production/local app
var hide_indicator;
$$(document).on('ajaxStart', function (e) {
    if (e.detail.xhr.requestUrl.indexOf('autocomplete-languages.json') >= 0) {
        // Don't show preloader for autocomplete demo requests
        return;
    }
    myApp.showIndicator();
    hide_indicator = setTimeout(function(){
      myApp.hideIndicator();
    },3000);
    
});
$$(document).on('ajaxComplete', function (e) {
    if (e.detail.xhr.requestUrl.indexOf('autocomplete-languages.json') >= 0) {
        // Don't show preloader for autocomplete demo requests
        return;
    }
    clearTimeout(hide_indicator);
    myApp.hideIndicator();
});

/* ===== Color themes ===== */
$$('.color-theme').click(function () {
    var classList = $$('body')[0].classList;
    for (var i = 0; i < classList.length; i++) {
        if (classList[i].indexOf('theme') === 0) classList.remove(classList[i]);
    }
    classList.add('theme-' + $$(this).attr('data-theme'));
    updateSetting('theme_color',$$(this).attr('data-theme'));
});
$$('.layout-theme').click(function () {
    var classList = $$('body')[0].classList;
    for (var i = 0; i < classList.length; i++) {
        if (classList[i].indexOf('layout-') === 0) classList.remove(classList[i]);
    }
    classList.add('layout-' + $$(this).attr('data-theme'));
    updateSetting('theme',$$(this).attr('data-theme'));
});

/* ===== Change statusbar bg when panel opened/closed ===== */
$$('.panel-left').on('open', function () {
    $$('.statusbar-overlay').addClass('with-panel-left');
});
$$('.panel-right').on('open', function () {
    $$('.statusbar-overlay').addClass('with-panel-right');
});
$$('.panel-left, .panel-right').on('close', function () {
    $$('.statusbar-overlay').removeClass('with-panel-left with-panel-right');
});