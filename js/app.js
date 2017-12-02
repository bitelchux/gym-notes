/**
 * Tizen back key event handler
 * Saves data to local storage
 */
window.addEventListener( 'tizenhwkey', function( ev ) {
	if( ev.keyName === "back" ) {
		var page = document.getElementsByClassName( 'ui-page-active' )[0],
			pageid = page ? page.id : "";
		if( pageid === "mainPage" ) {
			try {
				dbManager.saveWorkouts(loadedSections, function() {
					tizen.application.getCurrentApplication().exit();
				})
			} catch (ignore) {
			}
		} else {
			window.history.back();
		}
	}
} );

/**
 * visibilitychange event handler
 * Saves data to local storage
 */
document.addEventListener("visibilitychange", function () {
	if (document["hidden"]){
		dbManager.saveWorkouts(loadedSections, function() {
			// Do nothing
		})		  
	} 
});