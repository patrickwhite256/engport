var active_ids = [];

$( document ).ready( function() {

  search($("#announcement-search-query"), 'announcement-search-typeahead2');
  wookie();
  fetch_meeting_announcements();

  $( '.meeting_link' ).click( function() {
    $( '.active' ).removeClass( 'active' );
    $( this ).parent().addClass( 'active' );

    if( $( this ).parent().attr('id') === 'meeting_all' ) {
	fetch_all_announcements();
    } else {
	fetch_meeting_announcements();
    }
  } );

  $('#announcement-search-query').keyup(function(){
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

function fetch_all_announcements() {
  $.ajax({
    url: '/announcements/meeting_announcements?meeting=all',
    success: function(data) {
      render_announcements(data);
    }
  });
}

function fetch_meeting_announcements() {
  $.ajax({
    url: '/announcements/meeting_announcements?meeting=' + $('.active').first().attr('id'),
    success: function(data) {
      render_announcements(data);
    }
  });
}

function render_announcements(data) {

  ids = []
  for (var i = 0; i <  data.length; i++) {
    ids.push(data[i].id)
  }
  if (ids.sort().join(',') !== active_ids.sort().join(',')) {
    $('.event').fadeOut(200);
    $('.event').removeClass('visible');
    for (var i = 0; i < ids.length; i++) {
      $(".event[data-id='" + ids[i] +"']").fadeIn();
      $(".event[data-id='" + ids[i] +"']").addClass('visible');
    }
    wookie();
    active_ids = ids;
  }
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
          render_announcements(data);
        }
      });
    },
    onselect: function(val) {
      window.location = "/announcements/" + val.id;
    }
  })
};

