var sessionPage = document.getElementById("sessionPage");
var kgBox = document.getElementById("kgBox");
var repBox = document.getElementById("repBox");
var btnSubKg = document.getElementById("btnSubKg");
var btnAddKg = document.getElementById("btnAddKg");
var btnSubRep = document.getElementById("btnSubRep");
var btnAddRep = document.getElementById("btnAddRep");
var btnSave = document.getElementById("btnSave");
var btnClear = document.getElementById("btnClear");

var sessionPageScroller;
sessionPage.addEventListener("pagebeforeshow", function() {
	sessionPageScroller = sessionPage.querySelector(".ui-scroller");
	sessionPageScroller.scrollTop = 0;
    document.addEventListener("rotarydetent", rotarySessionEventHandler);
	
	
	btnSubKg.addEventListener("click", substractWeight);
	btnAddKg.addEventListener("click", addWeight);
	btnSubRep.addEventListener("click", substractRep);
	btnAddRep.addEventListener("click", addRep);
	btnSave.addEventListener("click", saveSet);	
	btnClear.addEventListener("click", clearSet);	
}) 

sessionPage.addEventListener("pagehide", function() {
	document.removeEventListener("rotarydetent", rotarySessionEventHandler);
	
	btnSubKg.removeEventListener("click", substractWeight);
	btnAddKg.removeEventListener("click", addWeight);
	btnSubRep.removeEventListener("click", substractRep);
	btnAddRep.removeEventListener("click", addRep);	
	btnSave.removeEventListener("click", saveSet);
	btnClear.removeEventListener("click", clearSet);
}) 

function animateButton(btn) {
	btn.style.transform = "scale(0.8)";
	btn.style.opacity = "0.8";
	setTimeout(function () {
		btn.style.transform = "scale(1)";
		btn.style.opacity = "";
	}, 120);
};

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

function addWeight() {
	animateButton(btnAddKg);
	
	var val = parseFloat(kgBox.value);
	if (isNaN(val)) {
		val = 0;
	}
	val = val + 2.5;
	kgBox.value = val;
}

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

function addRep() {
	animateButton(btnAddRep);
	
	var val = parseFloat(repBox.value);
	if (isNaN(val)) {
		val = 0;
	}
	val = val + 1;
	repBox.value = val;	
}

function saveSet() {
	var kg = parseFloat(kgBox.value);
	var reps = parseFloat(repBox.value);
	if (isNaN(kg) || isNaN(reps) || reps === 0) {
		return;
	}
	animateButton(btnSave);
	var currentSection = loadedSections[sectionChangerWidget.getActiveSectionIndex()];
	selectedSession.sets.push({weight: kg, rep: reps});
	currentSection.updated = true;
}

function clearSet() {
	animateButton(btnClear);
	kgBox.value = "0";
	repBox.value = "0";
}

// rotary event handler
function rotarySessionEventHandler(e) {
    if (sessionPageScroller) {
        if (e.detail.direction === "CW") { // Right direction
        	sessionPageScroller.scrollTop += SCROLL_STEP;
        } else if (e.detail.direction === "CCW") { // Left direction
        	sessionPageScroller.scrollTop -= SCROLL_STEP;
        }
    }
};