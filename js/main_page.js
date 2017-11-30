var DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

var mainPage = document.getElementById("mainPage");
var sectionChangerEl = document.getElementById("sectionchanger");
var sectionsEl = document.getElementById("sections");
var title = document.getElementById("mainPageTitle");
var sectionChangerWidget;
var workouts;
var loadedSections;
var lastSectionIndex;
var paginationEl = document.getElementById("pagination");
var newCategorySearch = true;

/**
 * pagecreate event handler
 * Initializes section widget
 */
mainPage.addEventListener("pagecreate", function() {
	sectionChangerWidget = tau.widget.SectionChanger(sectionChangerEl);
	workouts = dbManager.getAllWorkouts();
	
	sectionsEl.innerHTML = "";
	
	// Creating first two sections (for today and yesterday)
	loadedSections = [];
	var today = new Date();
	var yesterday = new Date();
	yesterday.setDate(today.getDate() - 1);
	var tomorrow = new Date();
	tomorrow.setDate(today.getDate() + 1);
	var sectionToday = {date: today, workout: workouts[today.yyyymmdd()], updated: false}
	var sectionYesterday = {date: yesterday, workout: workouts[yesterday.yyyymmdd()], updated: false}
	var sectionTomorrow = {date: tomorrow, workout: workouts[tomorrow.yyyymmdd()], updated: false}
	// Adding new sections
	addNewSection(sectionTomorrow,"left");
	addNewSection(sectionToday,"left");
	addNewSection(sectionYesterday,"left");
	// Setting title for the current section
	title.innerHTML = generateSectionTitle(sectionToday);
	// Setting today section as active
	sectionChangerWidget.setActiveSection(1);
	// Initialize pagination
	initPagination();
})

/**
 * pagebeforeshow event handler
 * Adds sectionchange event listener
 */
var SCROLL_STEP = 50;// distance of moving scroll for each rotary event
var sectionScroller;
mainPage.addEventListener("pagebeforeshow", function() {
	sectionChangerEl.addEventListener("sectionchange", sectionChangeHandler, {
		circular: false,
		orientation: "horizontal",
		useBouncingEffect: true
	});
	
	// Update view in case section was updated by adding or removing exercises
	var currentSectionIdx = sectionChangerWidget.getActiveSectionIndex();
	if (loadedSections[currentSectionIdx].updated) {
		fillSectionDOM(loadedSections[currentSectionIdx]);
		loadedSections[currentSectionIdx].updated = true;
	}
	
    // Register rotary event in order to scroll with rotating bezel
	sectionScroller = loadedSections[currentSectionIdx].dom;
    document.addEventListener("rotarydetent", rotaryEventHandler);
	
});

/**
 * pagehide event handler
 * Destroys and removes event listeners
 */
mainPage.addEventListener( "pagehide", function() {
	sectionChangerEl.removeEventListener("sectionchange", sectionChangeHandler);
    document.removeEventListener("rotarydetent", rotaryEventHandler);
});

/**
 * sectionchange event handler
 * Updates section view
 */	
function sectionChangeHandler(e) {
	// Animate title change
	$(title).hide("drop", {direction: "up", duration: 200}, function () {
		title.innerHTML = generateSectionTitle(loadedSections[e.detail.active]);
		$(title).show("drop", {direction: "up", duration: 200});
	}); 
	
	// Update section scroller in on order to rotate new section with the bezel
	sectionScroller = loadedSections[e.detail.active].dom;
	
	// If section changed, animate pagination
	if (lastSectionIndex != null) {
		updatePagination();
	}
	
	// If there are no loaded section left of the current section, create a new section
	if (e.detail.active == 0) {
		setTimeout(function () {
			var newDate = loadedSections[sectionChangerWidget.getActiveSectionIndex()].date.addDays(-1);
			var newSection = {date: newDate, workout: workouts[newDate.yyyymmdd()], updated: false};
			addNewSection(newSection,"left");
		}, 200);
	}
	
	// If there are no loaded section right of the current section, create a new section
	if (e.detail.active == loadedSections.length-1) {
		setTimeout(function () {
			var newDate = loadedSections[sectionChangerWidget.getActiveSectionIndex()].date.addDays(1);
			var newSection = {date: newDate, workout: workouts[newDate.yyyymmdd()], updated: false};
			addNewSection(newSection,"right");
		}, 200);
	}
}

/**
 * Adds new section
 */	
function addNewSection(section, side) {
	// Create section dom, <section></section>
	section.dom = document.createElement("section");
	// Fill <section> element
	fillSectionDOM(section);
	// Add section to section list
	if (side === "left") {
		loadedSections.unshift(section);
		sectionsEl.insertBefore(section.dom, sectionsEl.childNodes[0]);
	} else if (side === "right") {
		loadedSections.push(section);
		sectionsEl.appendChild(section.dom);
	}
	sectionChangerWidget.refresh();
}

/**
 * Creates DOM for new section
 */	
function fillSectionDOM(section) {
	section.dom.innerHTML = "";
	if (section.workout == null) {
		// Workout is empty
		generateEmptySection(section);
	} else {
		// Workout is not empty
		generateFullSection(section);
	}
}

/**
 * Generates section title based on date
 */	
function generateSectionTitle(section) {
	// Date in form "DoW dd/mm"
	var titleStr = DAY_NAMES[section.date.getDay()] + " " + section.date.getDate() + "/" + (section.date.getMonth()+1);
	
	// If section is for yesterday, today, or tomorrow, change the title correspondiglly
	var today = new Date();
	var yesterday = new Date();
	yesterday.setDate(today.getDate() - 1);		
	var tomorrow = new Date();
	tomorrow.setDate(today.getDate() + 1);	
	
	if (today.yyyymmdd() === section.date.yyyymmdd()) {
		titleStr = "Today";
	} else if (yesterday.yyyymmdd() === section.date.yyyymmdd()) {
		titleStr = "Yesterday";
	} else if (tomorrow.yyyymmdd() === section.date.yyyymmdd()) {
		titleStr = "Tomorrow";
	}
	
	return titleStr;
}

/**
 * Generates empty section
 */	
function generateEmptySection(section) {
	
	// Div containing "Log Empty" message
	var divEmptyEl = document.createElement("div");
	divEmptyEl.setAttribute("class", "empty-log type-font");
	divEmptyEl.innerHTML = "Log Empty";
	
	// Div containing instruction message
	var divInstrEl = document.createElement("div");
	divInstrEl.setAttribute("class", "new-instructions hand-font");
	divInstrEl.innerHTML = 'Add exercises (<i class="fa fa-plus"></i>) or copy<br/>previous workout (<i class="fa fa-calendar"></i>)';
	
	// Button for adding new workout
	var btnAddEl = document.createElement("div");
	btnAddEl.setAttribute("class","circle-btn bottom-left appear-in");
	btnAddEl.innerHTML = '<i class="fa fa-plus text-yellow circle-btn-icon"></i>';
	// Event listener
	btnAddEl.addEventListener("click", function() {
		btnAddEl.style.transform = "scale(0.8)";
		btnAddEl.style.opacity = "0.8";
		setTimeout(function () {
			btnAddEl.style.transform = "scale(1)";
			btnAddEl.style.opacity = "";
			newCategorySearch = true;
			tau.changePage("exerciseCategoriesPage");
		}, 120);
	})
	
	// Button for copying previous workout
	var btnCopyEl = document.createElement("div");
	btnCopyEl.setAttribute("class","circle-btn bottom-right appear-in");
	btnCopyEl.innerHTML = '<i class="fa fa-calendar text-yellow circle-btn-icon"></i>';
	// Event listener
	btnCopyEl.addEventListener("click", function() {
		btnCopyEl.style.transform = "scale(0.8)";
		btnCopyEl.style.opacity = "0.8";
		setTimeout(function () {
			btnCopyEl.style.transform = "scale(1)";
			btnCopyEl.style.opacity = "";
		}, 120);
	})
	
	// Append new elements to section
	section.dom.appendChild(divEmptyEl);
	section.dom.appendChild(divInstrEl);
	section.dom.appendChild(btnAddEl);
	section.dom.appendChild(btnCopyEl);
}	

/**
 * Generates full section
 */	
function generateFullSection(section) {
	for (var i = 0; i < section.workout.sessions.length; i++) {
		
		// Create exercise card element
		var divExerciseCard = document.createElement("div");
		divExerciseCard.setAttribute("class", "exercise-card");
		
		// Create title div
		var divCardTitle = document.createElement("div");
		divCardTitle.setAttribute("class", "type-font exercise-card-title text-yellow");
		divCardTitle.innerHTML = section.workout.sessions[i].exercise.name;
		
		// Create horizontal line separating title and logged sets
		var hr = document.createElement("hr");
		hr.setAttribute("class", "styled");
		
		// Create div containing trainings sets
		var divCardSets = document.createElement("div");
		divCardSets.setAttribute("class", "type-font exercise-card-reps hand-font");
		
		if (section.workout.sessions[i].sets.length === 0) {
			divCardSets.innerHTML = "No logged sets.<br/>Tap to edit...";
		} else {
			var tableSets = document.createElement("table")
			tableSets.setAttribute("class","set-table");
			for (var j = 0; j < section.workout.sessions[i].sets.length; j++) {
				var trSet = document.createElement("tr");
				var tdSet = document.createElement("td");
				tdSet.setAttribute("class", "text-yellow");
				tdSet.innerHTML = 'Set ' + (j+1) + '.';
				var tdKg = document.createElement("td");
				tdKg.innerHTML = section.workout.sessions[i].sets[j].weight + ' kg';
				var tdRep = document.createElement("td");
				tdRep.innerHTML = section.workout.sessions[i].sets[j].rep + ' rep';
				trSet.appendChild(tdSet);
				trSet.appendChild(tdKg);
				trSet.appendChild(tdRep);
				tableSets.appendChild(trSet);
			}
			divCardSets.appendChild(tableSets);
		}
		
//		// X icon in lower right cornet
//		var divDeleteCard = document.createElement("div");
//		divDeleteCard.setAttribute("class", "exercise-card-remove");
//		divDeleteCard.innerHTML = '<i class="fa fa-times"></i>';
		
		// Append elements to card
		divExerciseCard.appendChild(divCardTitle);
		divExerciseCard.appendChild(hr);
		divExerciseCard.appendChild(divCardSets);
//		divExerciseCard.appendChild(divDeleteCard);
		
		// Add event listener
		divExerciseCard.addEventListener("click", function() {
			var card = this;
			card.style.transform = "scale(0.8)";
			card.style.opacity = "0.8";
			setTimeout(function () {
				card.style.transform = "scale(1)";
				card.style.opacity = "";
				console.log("card clicked");
			}, 120);
		})
		
		// Append to section DOM
		section.dom.appendChild(divExerciseCard);
	}
}

/**
 * Initializes pagination bullets at the bottom of the screen
 */
function initPagination() {
	lastSectionIndex = sectionChangerWidget.getActiveSectionIndex();

	paginationEl.innerHTML = "";
	
	// Pagination element consists of a list of bullets
	var newBullet = document.createElement("span");
	newBullet.setAttribute("class","swiper-pagination-bullet swiper-pagination-bullet-active-prev-prev");
	paginationEl.appendChild(newBullet);

	var newBullet = document.createElement("span");
	newBullet.setAttribute("class","swiper-pagination-bullet swiper-pagination-bullet-active-prev");
	paginationEl.appendChild(newBullet);

	var newBullet = document.createElement("span");
	newBullet.setAttribute("class","swiper-pagination-bullet swiper-pagination-bullet-active");
	paginationEl.appendChild(newBullet);

	var newBullet = document.createElement("span");
	newBullet.setAttribute("class","swiper-pagination-bullet swiper-pagination-bullet-active-next");
	paginationEl.appendChild(newBullet);

	var newBullet = document.createElement("span");
	newBullet.setAttribute("class","swiper-pagination-bullet swiper-pagination-bullet-active-next-next");
	paginationEl.appendChild(newBullet);
}

/**
 * Update pagination bullets 
 */
function updatePagination() {
	var newActiveSectionIndex = sectionChangerWidget.getActiveSectionIndex();
	if (newActiveSectionIndex <= lastSectionIndex) {
		// Back swipe
		var newBullet = document.createElement("span");
		newBullet.setAttribute("class","swiper-pagination-bullet swiper-pagination-bullet-active-prev-prev");
	 	paginationEl.insertBefore(newBullet, paginationEl.childNodes[0]);

		var bullets = $(paginationEl).children();
	 	$(bullets[bullets.length-1]).hide(0).remove();

	 	setTimeout(function(){
		 	bullets[1].className = bullets[1].className.substring(0, bullets[1].className.lastIndexOf("-"));
		 	bullets[2].className = bullets[2].className.substring(0, bullets[2].className.lastIndexOf("-"));
			bullets[3].className += "-next";
			bullets[4].className += "-next";
		}, 100);
	} else {
		// Forward swipe
		var newBullet = document.createElement("span");
		newBullet.setAttribute("class","swiper-pagination-bullet swiper-pagination-bullet-active-next-next");
	 	paginationEl.appendChild(newBullet);
	  
		var bullets = $(paginationEl).children();
		$(bullets[0]).hide(0).remove();

		setTimeout(function(){
			 	bullets[1].className += "-prev";
			 	bullets[2].className += "-prev";
				bullets[3].className = bullets[3].className.substring(0, bullets[3].className.lastIndexOf("-"));
				bullets[4].className = bullets[4].className.substring(0, bullets[4].className.lastIndexOf("-"));
		}, 100);
	}

	lastSectionIndex = newActiveSectionIndex;
}

/**
 * Rotary event handler
 * Scrolls current section DOM
 */
var rotaryEventHandler = function(e) {
    if (sectionScroller) {
        if (e.detail.direction === "CW") { // Right direction
        	sectionScroller.scrollTop += SCROLL_STEP;
        } else if (e.detail.direction === "CCW") { // Left direction
        	sectionScroller.scrollTop -= SCROLL_STEP;
        }
    }
};
