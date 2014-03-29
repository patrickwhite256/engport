$(function() {
  function search($el, id) {
    $el.typeahead2({
      min_length: 2,
      auto_active: false,
      alignment: "left",
      menu: '<ul class="typeahead2 dropdown-menu" id="'+ id +'"></ul>',
      source: function(typeahead, query) {
        $.ajax({
          url: '/announcements?q=' + query + '&auto_complete=true',
          global: false,
          success: function(data) {
            typeahead.process(data);
          }
        });
      },
      onselect: function(val) {
        window.location = "/announcements/" + val.id;
      }
    })
  };

  search($("#announcement-search-query"), 'announcement-search-typeahead2');
});

