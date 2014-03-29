/* =============================================================
 * bootstrap-typeahead.js v2.0.0
 * http://twitter.github.com/bootstrap/javascript.html#typeahead
 * =============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */

!function( $ ){

  "use strict"

  var Typeahead2 = function ( element, options ) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.typeahead2.defaults, options)
    this.matcher = this.options.matcher || this.matcher
    this.sorter = this.options.sorter || this.sorter
    this.highlighter = this.options.highlighter || this.highlighter
    this.$menu = $(this.options.menu).appendTo('body')
    this.source = this.options.source
    this.onselect = this.options.onselect
    this.strings = true
    this.shown = false
    this.has_categories = this.options.has_categories
    this.min_length = this.options.min_length
    this.auto_active = this.options.auto_active
    this.alignment = this.options.alignment
    this.placeholder = this.options.hidden_property_placeholder
    this.listen()

    this.$element.attr('autocomplete', 'off');

    this.hiddenel = null

    if (this.options.hidden_property && !this.placeholder) {
      var fname = this.$element.attr('name') || this.$element.attr('data-name')
      this.$element.removeAttr('name')
      this.$element.attr('data-name', fname)
      this.hiddenel = $('<input type="hidden" />')
      this.hiddenel.attr('name', fname)
      this.hiddenel.val(this.$element.val())
      if (this.$element.attr('data-value')) this.$element.val(this.$element.attr('data-value'))
      /* Here we see if the next element is the same as the one we were going to create */
      /* This is to deal with it being called on something that's already been processed not accumulating hidden elements */
      var nelem = this.$element.next()
      if (nelem) {
        if (this.hiddenel.attr("type") == nelem.attr("type") && this.hiddenel.attr("name") == nelem.attr("name")) {
          nelem.remove()
        }
      }
      this.$element.after(this.hiddenel)
      if (this.hiddenel) {
        var thehidden = this.hiddenel;
        this.$element.change(function(){
          if($(this).val() != '') {
            $(this).val($(this).attr('data-value'));
          } else {
            thehidden.val('');
          }
        });
      }
    } else if (this.options.hidden_property && this.placeholder) {
      var fname = this.$element.attr('name') || this.$element.attr('data-name')
      // this.$element.removeAttr('name')
      this.$element.attr('name', this.placeholder)
      this.$element.attr('data-name', fname)
      this.hiddenel = $('<input type="hidden" />')
      this.hiddenel.attr('name', fname)
      this.hiddenel.val(this.$element.val())
      if (this.$element.attr('data-value')) this.$element.val(this.$element.attr('data-value'))
      /* Here we see if the next element is the same as the one we were going to create */
      /* This is to deal with it being called on something that's already been processed not accumulating hidden elements */
      var nelem = this.$element.next()
      if (nelem) {
        if (this.hiddenel.attr("type") == nelem.attr("type") && this.hiddenel.attr("name") == nelem.attr("name")) {
          nelem.remove()
        }
      }
      this.$element.after(this.hiddenel)
      if (this.hiddenel) {
        this.$element.on("keyup", "", this.hiddenel, function(e) {
          e.data.val("");
        })
      }
    }

  }

  Typeahead2.prototype = {

    constructor: Typeahead2

  , select: function () {
      var val = JSON.parse(this.$menu.find('.active').attr('data-value'))
        , text, htext

      if (!this.strings) text = val[this.options.property]
      else text = val

      this.$element.val(text)

      if (this.hiddenel && !this.placeholder) {
        this.$element.attr('data-value', text);

        if (!this.strings) htext = val[this.options.hidden_property]
        else htext = val
        this.hiddenel.val(htext)
      } else if (this.hiddenel && this.placeholder) {
        this.$element.attr('value', text);

        if (!this.strings) htext = val.to_param
        else htext = val

        this.hiddenel.val(htext);


      }

      if (typeof this.onselect == "function")
          this.onselect(val)



      return this.hide()
    }

  , show: function () {
      var pos = $.extend({}, this.$element.offset(), {
        height: this.$element[0].offsetHeight
      })

      if (this.alignment == "right") {
        this.$menu.css({
          top: pos.top + pos.height
        , right: ($(window).width() - (pos.left + this.$element.outerWidth()))
        , left: "auto"
        , "border-radius": 0
        })
      } else {
        this.$menu.css({
          top: pos.top + pos.height
        , left: pos.left
        })
      }

      this.$menu.show()
      this.shown = true
      return this
    }

  , hide: function () {
      this.$menu.hide()
      this.shown = false
      return this
    }

  , lookup: function (event) {
      var that = this
        , items
        , q
        , value

      this.query = this.$element.val()

      if (this.query.length <= this.min_length) {
        this.hide();
        return;
      } else {
        this.show()
      }

      if (typeof this.source == "function") {
        value = this.source(this, this.query)
        if (value) this.process(value)
      } else {
        this.process(this.source)
      }
    }

  , process: function (results) {
      var that = this
        , items
        , q

      if ((results.length && typeof results[0] != "string") || typeof results === "object")
          this.strings = false

      this.query = this.$element.val()

      if (!this.query) {
        return this.shown ? this.hide() : this
      }

      if (typeof results === "object" && this.has_categories) {
        var dropdown = $("<div>");
        $.each(results, function(i,v) {
          if (v.length > 0) {
            items = that.sorter(v);
            dropdown.html(dropdown.html() +
              $("<div>")
              .html("<div class='search-autocomplete-category'>"+i+"</div>")
              .append(that.render(items))
              .html()
            )
          }
        })
        if (this.auto_active)
          $('li:first',dropdown).addClass('active');

        if (dropdown.children().length > 0 && this.query.length > this.min_length) {
          this.$menu.html(dropdown.html());
          this.show()
        } else {
          this.hide()
        }
        return
      }

      items = $.grep(results, function (item) {
        if (!that.strings)
          item = item[that.options.property]
        if (that.matcher(item)) return item
      })

      items = this.sorter(items)

      if (!items.length) {
        return this.shown ? this.hide() : this
      }

      return this.render(items.slice(0, this.options.items)).show()
    }

  , matcher: function (item) {
      return ~item.toLowerCase().indexOf(this.query.toLowerCase()) || (typeof this.source === 'function')
    }

  , sorter: function (items) {
      var beginswith = []
        , caseSensitive = []
        , caseInsensitive = []
        , item
        , sortby

      while (item = items.shift()) {
        if (this.strings) sortby = item
        else sortby = item[this.options.property]

        if (!sortby.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item)
        else if (~sortby.indexOf(this.query)) caseSensitive.push(item)
        else caseInsensitive.push(item)
      }

      return beginswith.concat(caseSensitive, caseInsensitive)
    }

  , highlighter: function (item) {
      return item.replace(new RegExp('(' + this.query + ')', 'ig'), function ($1, match) {
        return '<strong>' + match + '</strong>'
      })
    }

  , render: function (items) {
      var that = this

      items = $(items).map(function (i, item) {
        i = $(that.options.item).attr('data-value', JSON.stringify(item))
        if (!that.strings)
            item = item[that.options.property]
        i.find('a').html(that.highlighter(item))
        return i[0]
      })

      if (this.has_categories)
        return items

      items.first().addClass('active')
      this.$menu.html(items)
      return this
    }

  , next: function (event) {
      var active = this.$menu.find('.active').removeClass('active')
        , next = active.next()

      while (!next.is("li") && next.length) {
        next = next.next()
      }
      if (!next.length) {
        next = $(this.$menu.find('li')[0])
      }

      next.addClass('active')
    }

  , prev: function (event) {
      var active = this.$menu.find('.active').removeClass('active')
        , prev = active.prev()

      while (!prev.is("li") && prev.length) {
        prev = prev.prev()
      }
      if (!prev.length) {
        prev = this.$menu.find('li').last()
      }

      prev.addClass('active')
    }

  , listen: function () {
      this.$element
        .on('blur',     $.proxy(this.blur, this))
        .on('keypress', $.proxy(this.keypress, this))
        .on('keyup',    $.proxy(this.keyup, this))

      if ($.browser.webkit || $.browser.msie) {
        this.$element.on('keydown', $.proxy(this.keypress, this))
      }

      this.$menu
        .on('click', $.proxy(this.click, this))
        .on('mouseenter', 'li', $.proxy(this.mouseenter, this))
    }

  , keyup: function (e) {
      switch(e.keyCode) {
        case 40: // down arrow
        case 38: // up arrow
          e.stopPropagation()
          e.preventDefault()
          break

        case 9: // tab
        case 13: // enter
          if (this.$menu.find('li.active').length > 0) {
            e.stopPropagation()
            e.preventDefault()
          }
          if (!this.shown) return
          this.select()
          break

        case 27: // escape
          e.stopPropagation()
          e.preventDefault()
          this.hide()
          break

        default:
          e.stopPropagation()
          e.preventDefault()
          this.lookup()
      }

  }

  , keypress: function (e) {
      e.stopPropagation()
      if (!this.shown) return

      switch(e.keyCode) {
        case 9: // tab
        case 13: // enter
        case 27: // escape
          if (this.$menu.find('li.active').length > 0) {
            e.stopPropagation()
            e.preventDefault()
          }
          break

        case 38: // up arrow
          e.stopPropagation()
          e.preventDefault()
          this.prev()
          break

        case 40: // down arrow
          e.stopPropagation()
          e.preventDefault()
          this.next()
          break
      }
    }

  , blur: function (e) {
      var that = this
      e.stopPropagation()
      e.preventDefault()
      setTimeout(function () { that.hide() }, 150)
    }

  , click: function (e) {
      e.stopPropagation()
      e.preventDefault()
      this.select()
    }

  , mouseenter: function (e) {
      this.$menu.find('.active').removeClass('active')
      $(e.currentTarget).addClass('active')
    }

  }


  /* TYPEAHEAD PLUGIN DEFINITION
   * =========================== */

  $.fn.typeahead2 = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('typeahead2')
        , options = typeof option == 'object' && option
      if (!data) $this.data('typeahead2', (data = new Typeahead2(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.typeahead2.defaults = {
    source: []
  , items: 8
  , menu: '<ul class="typeahead2 dropdown-menu"></ul>'
  , item: '<li><a href="#"></a></li>'
  , onselect: null
  , property: 'value'
  , hidden_property: null
  , hidden_property_placeholder: null
  , has_categories: null
  , min_length: 1
  , auto_active: true
  , alignment: "left"
  }

  $.fn.typeahead2.Constructor = Typeahead2


 /* TYPEAHEAD DATA-API
  * ================== */

  $(function () {
    $('body').on('focus.typeahead2.data-api', '[data-provide="typeahead2"]', function (e) {
      var $this = $(this)
      if ($this.data('typeahead2')) return
      e.preventDefault()
      $this.typeahead2($this.data())
    })
  })

}( window.jQuery );
