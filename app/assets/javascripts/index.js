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
      clickedElement.style.color = '';
      highlighted.splice(j, 1);
      return;
    }
  }
  if (clickedElement.id) {
    clickedElement.style.backgroundColor = 'rgba( 255, 50, 0, 0.3 )';
    clickedElement.style.color = 'white';
    highlighted.push(clickedElement.id);
  }
  return;
}

document.onclick = clickListener;

function pdfExport() {
  window.location = 'announcements/export?ids=' + highlighted
}
