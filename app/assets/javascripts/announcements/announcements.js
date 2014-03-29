$( document ).ready( function() {
    $( '.event' ).wookmark( {
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
    } );
} );