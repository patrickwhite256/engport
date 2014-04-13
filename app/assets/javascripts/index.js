var highlighted = new Array();

$( document ).ready( function() {
  $( 'span.date.date_format' ).each( function() {
   $(this).text( getMoment( $( this ).text() ) ); 
   $(this).removeClass('date_format');
 } );
  $('.export').attr('disabled', 'disabled' );
} );

function getMoment( time ) {
   var timestamp = parseInt( time ) + 14400;
   if( timestamp > 0 ) {
     return moment.unix( timestamp ).calendar();
   }
   return '';
}

function clickListener(e) {
  var clickedElement = (window.event) ? window.event.srcElement : e.target
  if (clickedElement.id == 'dl') {
    pdfDownload()
    return;
  } else if (clickedElement.id == 'fb') {
    pdfFacebook()
    return;
  } else if (clickedElement.id == 'tw') {
    pdfTwitter()
    return;
  }

  if ((clickedElement.className).indexOf( 'notes' ) < 0 && clickedElement.parentElement.className == 'event visible') {
    clickedElement = clickedElement.parentElement;
  } else if (clickedElement.className.indexOf('deselect_all') > 0 ) {
      $('.event').each( function() {
	  var announce = this;
	  $(announce).css('backgroundColor', '');
	  $(announce).css('color', '');
      });

      highlighted = [];
      $('.export').attr('disabled', 'disabled' );

      $(clickedElement).removeClass('deselect_all');
      $(clickedElement).addClass('select_all');
      $(clickedElement).text('Select all');

      return;
  } else if (clickedElement.className.indexOf( 'select_all') > 0 ) {
      $('.event').each( function() {
	var announce = this;

	$(announce).css('backgroundColor','rgba( 255, 50, 0, 0.3 )');
	$(announce).css('color','white');

	highlighted.push( $(announce).data('id'));
	$('.export').removeAttr( 'disabled' );
      } );

      $(clickedElement).removeClass('select_all');
      $(clickedElement).addClass('deselect_all');
      $(clickedElement).text('Deselect all');

      return;
  } else if (clickedElement.className != 'event visible') {
    return;
  }

  for (var j = 0; j < highlighted.length; j++) {
    if (highlighted[j] == $(clickedElement).data('id')) {
      clickedElement.style.backgroundColor = '';
      clickedElement.style.color = '';
      highlighted.splice(j, 1);

      if( highlighted.length > 0 ) {
	$('.export').removeAttr( 'disabled' );
      } else {
	$('.export').attr('disabled', 'disabled' );
      }
      return;
    }
  }
  if ($(clickedElement).data('id')) {
    clickedElement.style.backgroundColor = 'rgba( 255, 50, 0, 0.3 )';
    clickedElement.style.color = 'white';

    highlighted.push($(clickedElement).data('id'));
  }

  if( highlighted.length > 0 ) {
    $('.export').removeAttr( 'disabled' );
  } else {
    $('.export').attr('disabled', 'disabled' );
  }
  return;
}

document.onclick = clickListener;

function pdfFacebook() {
  var notes = '';
  highlighted.forEach( function( announce ) {
    notes += $('.event[data-id="'+announce+'"]').find('.notes').val() + ',,'; 
  } );
  window.location = 'announcements/export?ids=' + highlighted + '&method=fb'  
}

function pdfTwitter() {
  var notes = '';
  highlighted.forEach( function( announce ) {
    notes += $('.event[data-id="'+announce+'"]').find('.notes').val() + ',,'; 
  } );
  window.location = 'announcements/export?ids=' + highlighted + '&method=tw'  
}

function pdfDownload() {
  var notes = '';
  highlighted.forEach( function( announce ) {
    notes += $('.event[data-id="'+announce+'"]').find('.notes').val() + ',,'; 
  } );
  window.location = 'announcements/export?ids=' + highlighted + '&method=dl&notes=' + notes;
}
