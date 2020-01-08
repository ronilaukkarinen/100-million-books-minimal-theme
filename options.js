var numberValidationAttempts = 0;
var submissionInProcess = false;

function save_options() {

	var speed_dials = [];
	var url = ""; title = "";
	
	$( '.ext-setting.speed-dial > div' ).each( function( k, v ) { 
		
		url = ( $( v ).find( 'input.speed-dial-url' ) ).val();
		title = ( $( v ).find( 'input.speed-dial-title' ) ).val();
		
		if( url && title ) {
			speed_dials.push( [ url, title ] );
		}
	});
  
	chrome.storage.local.set({
		amazon: true,
		save_to: $('input[name=save-to]:checked').val(),
		update_interval: $('input[name=update-every]:checked').val(),
		gold_topsites: speed_dials 
	}, function() {
		
		$( ".settings-saved-message" ).animate({
			opacity: 1
		}, 500, function() {
		  
			$( ".settings-saved-message" ).animate({
				opacity: 0
			}, 500, function() {

			});
		});
	});
}

function restore_options() {
	chrome.storage.local.get( { 'gold_topsites': [], 'amazon': true, 'save_to': 'goodreads', 'update_interval': 'seconds' }, function( items ) {
	  
		for( var l in items.gold_topsites ) {
			$( $( '.ext-setting.speed-dial > div' )[l] ).find( 'input.speed-dial-url' ).val( items.gold_topsites[l][0] );
			$( $( '.ext-setting.speed-dial > div' )[l] ).find( 'input.speed-dial-title' ).val( items.gold_topsites[l][1] );
		}
	  
		switch( items.save_to ) {
			case "goodreads":
				$('input[value=goodreads]').prop("checked", true);
				break;
			case "librarything":
				$('input[value=librarything]').prop("checked", true);
				break;
			case "neither":
				$('input[value=neither]').prop("checked", true);
				break;
		}
      
		switch( items.update_interval ) {
			case "seconds":
				$('input[value=seconds]').prop("checked", true);
				break;
			case "minutes":
				$('input[value=minutes]').prop("checked", true);
				break;
			case "hours":
				$('input[value=hours]').prop("checked", true);
				break;
			case "days":
				$('input[value=days]').prop("checked", true);
				break;
		}

	});
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);