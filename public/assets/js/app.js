$(function() {
  var $flash = $('.flash');
  var $repeater = $('.repeater');
  if($flash) {
    setTimeout(function() {
      $flash.addClass('scale-out')
    }, 5000);
  }
  if($repeater) {
    $repeater.repeater({
      initEmpty: false,
      defaultValues: {
          'text-input': ''
      },
      show: function () {
          $(this).slideDown();
      },
      hide: function (deleteElement) {
          $(this).slideUp(deleteElement);
      },
      isFirstItemUndeletable: true
    });
  }
});
