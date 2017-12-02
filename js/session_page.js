var sessionPage = document.getElementById("sessionPage");
var kgBox = document.getElementById("kgBox");
var repBox = document.getElementById("repBox");
var btnSubKg = document.getElementById("btnSubKg");
var btnAddKg = document.getElementById("btnAddKg");
var btnSubRep = document.getElementById("btnSubRep");
var btnAddRep = document.getElementById("btnAddRep");
var btnSave = document.getElementById("btnSave");
var btnClear = document.getElementById("btnClear");
var setTable = document.getElementById("setTable");
var sessionCard = document.getElementById("sessionCard");

/**
 * pagebeforeshow event listener
 * Adds event listener for all of the buttons
 * Adds scrolling with the bezel
 * Fills set table
 */
var sessionPageScroller;
sessionPage.addEventListener("pagebeforeshow", function() {
	// Add rotary event listener for scrolling
	sessionPageScroller = sessionPage.querySelector(".ui-scroller");
	sessionPageScroller.scrollTop = 0;
    document.addEventListener("rotarydetent", rotarySessionEventHandler);
	
    // Clear set table
    setTable.innerHTML = "";
    for (var i = 0; i < selectedSession.sets.length; i++) {
    	(function(i) {	
    		// Create <tr> element for each set
    		var trEl = createRowElement(selectedSession.sets[i])
    		setTable.appendChild(trEl);
    	})(i);
    }
    // If number of sets is greater than 0, show card which contains set table
    if (selectedSession.sets.length > 0) {
    	$(sessionCard).show();
    }
    
    // Add event listener for all of the buttons
	btnSubKg.addEventListener("click", substractWeight);
	btnAddKg.addEventListener("click", addWeight);
	btnSubRep.addEventListener("click", substractRep);
	btnAddRep.addEventListener("click", addRep);
	btnSave.addEventListener("click", saveSet);	
	btnClear.addEventListener("click", clearSet);	
}) 

/**
 * pagehide event listener
 * Removes all event listener
 */
sessionPage.addEventListener("pagehide", function() {
	document.removeEventListener("rotarydetent", rotarySessionEventHandler);
	btnSubKg.removeEventListener("click", substractWeight);
	btnAddKg.removeEventListener("click", addWeight);
	btnSubRep.removeEventListener("click", substractRep);
	btnAddRep.removeEventListener("click", addRep);	
	btnSave.removeEventListener("click", saveSet);
	btnClear.removeEventListener("click", clearSet);
})

/**
 * Animates buttons when clicked
 * @param btn
 */
function animateButton(btn) {
	btn.style.transform = "scale(0.8)";
	btn.style.opacity = "0.8";
	setTimeout(function () {
		btn.style.transform = "scale(1)";
		btn.style.opacity = "";
	}, 120);
};

/**
 * Click event handler for btnSubKg
 * Substracts 2.5 kg from the current value in kgBox
 */
function substractWeight() {
	animateButton(btnSubKg);
	var val = parseFloat(kgBox.value);
	if (isNaN(val)) {
		val = 0;
	}
	val = val - 2.5;
	if (val < 0) {
		val = 0;
	}
	kgBox.value = val;
}

/**
 * Click event handler for btnAddKg
 * Adds 2.5 kg to the current value in kgBox
 */
function addWeight() {
	animateButton(btnAddKg);
	
	var val = parseFloat(kgBox.value);
	if (isNaN(val)) {
		val = 0;
	}
	val = val + 2.5;
	kgBox.value = val;
}

/**
 * Click event handler for btnSubRep
 * Substracts 1 rep from the current value in repBox
 */
function substractRep() {
	animateButton(btnSubRep);
	
	var val = parseFloat(repBox.value);
	if (isNaN(val)) {
		val = 0;
	}
	val = val - 1;
	if (val < 0) {
		val = 0;
	}
	repBox.value = val;
}

/**
 * Click event handler for btnAddRep
 * Adds 1 rep to the current value in repBox
 */
function addRep() {
	animateButton(btnAddRep);
	
	var val = parseFloat(repBox.value);
	if (isNaN(val)) {
		val = 0;
	}
	val = val + 1;
	repBox.value = val;	
}

/**
 * Click event handler for btnSave
 * Adds new set to the current workout session
 */
function saveSet() {
	var kg = parseFloat(kgBox.value);
	var reps = parseFloat(repBox.value);
	// Number of reps cannot be 0
	if (isNaN(kg) || isNaN(reps) || reps === 0) {
		return;
	}
	animateButton(btnSave);
	
	// Add new set to session's array
	var currentSection = loadedSections[sectionChangerWidget.getActiveSectionIndex()];
	var set = {weight: kg, rep: reps};
	selectedSession.sets.push(set);
	
	// Create <tr> element for the set and add it to the set table
	var trEl = createRowElement(set)
	setTable.appendChild(trEl);
	// Make session card visible
	$(sessionCard).show();
	
	// Update the flag so main page has to refresh the view
	currentSection.updated = true;
}


/**
 * Click event handler for btnClear
 * Sets input values for kgBox and repBox to 0
 */
function clearSet() {
	animateButton(btnClear);
	kgBox.value = "0";
	repBox.value = "0";
}

/**
 * Rotary event handler
 * Scrolls current page
 * @param e
 */
function rotarySessionEventHandler(e) {
    if (sessionPageScroller) {
        if (e.detail.direction === "CW") { // Right direction
        	sessionPageScroller.scrollTop += SCROLL_STEP;
        } else if (e.detail.direction === "CCW") { // Left direction
        	sessionPageScroller.scrollTop -= SCROLL_STEP;
        }
    }
};

/**
 * Creates <tr> element for a given set
 * @param set
 * @returns
 */
function createRowElement(set) {
	// Create <tr> element
	var trSet = document.createElement("tr");
	// Create <td> element with weight information
	var tdKg = document.createElement("td");
	tdKg.innerHTML = set.weight + ' kg';
	// Create <td> element with repetition information
	var tdRep = document.createElement("td");
	tdRep.innerHTML = set.rep + ' rep';
	// Create <td> element with remove icon
	var tdTrash = document.createElement("td");
	tdTrash.setAttribute("class", "text-red");
	tdTrash.innerHTML = '<i class="fa fa-trash"></i>';
	// Append <td> elements to <tr> element
	trSet.appendChild(tdKg);
	trSet.appendChild(tdRep);
	trSet.appendChild(tdTrash);
	
	// Add click event listener for the <td> element with remove icon
	tdTrash.addEventListener("click", function(e) {
		// Animate fade out
		$(trSet).hide("fade",function(){
			// Get index of the selected set
			var index = selectedSession.sets.indexOf(set);
			// Remove set from the session's array
			selectedSession.sets.splice(index, 1);
			// Update the flag so main page has to refresh the view
			loadedSections[sectionChangerWidget.getActiveSectionIndex()].updated = true;
			// Remove <tr> element
			$(trSet).remove();
			// If there are no more sets in the current session, hide session card
			if (selectedSession.sets.length === 0) {
				$(sessionCard).hide();
			}
		})
		
	})
	
	return trSet;
}




