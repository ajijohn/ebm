/**
 * Created by ajijohn on 8/18/16.
 * TB Implemented
 */
$(document).ready(function() {
    $('[data-toggle=offcanvas]').click(function() {
        $('.row-offcanvas').toggleClass('active');
    });


    //Date range picker
    $('.input-daterange-datepicker').daterangepicker({
        buttonClasses: ['btn', 'btn-sm'],
        applyClass: 'btn-default',
        cancelClass: 'btn-primary'
    });
});