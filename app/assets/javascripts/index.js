var highlighted = new Array();

function clickListener(e) {
  var clickedElement = (window.event) ? window.event.srcElement : e.target
  if (clickedElement.id == 'export') {
    pdfExport()
    return;
  }
  if( clickedElement.parentElement.className == 'event' ) {
      clickedElement = clickedElement.parentElement;
  } else if( clickedElement.className != 'event' ) {
      return;
  }

  for(var j = 0; j < highlighted.length; j++) {
    if (highlighted[j] == clickedElement.id) {
      clickedElement.style.backgroundColor = '';
      highlighted.splice(j, 1);
      return;
    }
  }
  if (clickedElement.id) {
    clickedElement.style.backgroundColor = 'rgba( 150, 150, 150, 0.6666666 )';
    highlighted.push(clickedElement.id);
  }
  return;
}

document.onclick = clickListener;

function pdfExport() {
  window.location = 'announcements/export?ids=' + highlighted
}
