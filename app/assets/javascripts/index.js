var highlighted = new Array();

function clickListener(e) {
  var clickedElement = (window.event) ? window.event.srcElement : e.target
  if (clickedElement.id == 'export') {
    pdfExport()
    return;
  } else if (clickedElement.tagName != 'DIV') {
    clickedElement = clickedElement.parentNode
  }

  for(var j = 0; j < highlighted.length; j++) {
    if (highlighted[j] == clickedElement.id) {
      clickedElement.style.backgroundColor = '';
      highlighted.splice(j, 1);
      return;
    }
  }
  if (clickedElement.id) {
    clickedElement.style.backgroundColor = 'gray';
    highlighted.push(clickedElement.id);
  }
  return;
}

document.onclick = clickListener;

function pdfExport() {
  window.location = 'announcements/export?ids=' + highlighted
}
