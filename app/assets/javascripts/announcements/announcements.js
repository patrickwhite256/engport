$( document ).ready( function() {
  search($("#announcement-search-query"), 'announcement-search-typeahead2');
  wookie();

  $( '#meetings li a' ).click( function() {
    $( '.active' ).removeClass( 'active' );
    $( this ).parent().addClass( 'active' );
    fetch_meeting_announcements();
  } );

  $('#announcement-search-query').change(function(){
    if ($(this).val() === "") {
      fetch_meeting_announcements();
    }
  });
});



function wookie() {
  $( '.event.visible' ).wookmark( {
    align: 'center',
    autoResize: true,
    container: $('#wookmark_container'),
    direction: 'left',
    ignoreInactiveItems: true,
    itemWidth: 300,
    fillEmptySpace: true,
    flexibleWidth: true,
    offset: 20,
    resizeDelay: 20
  });
}

function fetch_meeting_announcements() {
  $.ajax({
    url: '/announcements/meeting_announcements?meeting=' + $('.active').first().attr('id'),
    success: function(data) {
      $('.event').css('display','none');
      $('.event').removeClass('visible');

      for (var i = 0; i < data.ids.length; i++) {
        $(".event[data-id='" + data.ids[i] +"']").css('display','block');
        $(".event[data-id='" + data.ids[i] +"']").addClass('visible');
      }
      wookie();
    }
  });
}

function search($el, id) {
  $el.typeahead2({
    min_length: 0,
    auto_active: false,
    alignment: "left",
    menu: '<ul class="typeahead2 dropdown-menu" id="'+ id +'"></ul>',
    source: function(typeahead, query) {
      $.ajax({
        url: '/announcements?q=' + query + '&meeting=' + $('.active').first().attr('id') + '&auto_complete=true',
        global: false,
        success: function(data) {
          typeahead.process(data);
          $('.event').css('display','none');
          $('.event').removeClass('visible');

          for (var i = 0; i < data.length; i++) {
            $(".event[data-id='" + data[i].id +"']").css('display','block');
            $(".event[data-id='" + data[i].id +"']").addClass('visible');
          }
          wookie();
        }
      });
    },
    onselect: function(val) {
      window.location = "/announcements/" + val.id;
    }
  })
};

