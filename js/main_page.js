$(document).ready(function() {

	var DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	
	var mainPage = document.getElementById("mainPage");
	var sectionChangerEl = document.getElementById("sectionchanger");
	var sectionsEl = document.getElementById("sections");
	var title = document.getElementById("mainPageTitle");
	var sectionChangerWidget;
	var dbManager = new DBManager();
	var workouts;
	var loadedSections = [];
	var lastSectionIndex;
	var paginationEl = document.getElementById("pagination");
	
	/**
	 * pagebeforeshow event handler
	 * Do preparatory works and adds event listeners
	 */
	mainPage.addEventListener("pagebeforeshow", function name() {
		
		sectionChangerWidget = tau.widget.SectionChanger(sectionChangerEl);
		sectionChangerEl.addEventListener("sectionchange", sectionChangeHandler, {
			circular: false,
			orientation: "horizontal",
			useBouncingEffect: true
		});
		workouts = dbManager.getAllWorkouts(); 
		
		sectionsEl.innerHTML = "";
		
		// Creating first two sections (for today and yesterday)
		var today = new Date();
		var yesterday = new Date();
		yesterday.setDate(today.getDate() - 1);
		var tomorrow = new Date();
		tomorrow.setDate(today.getDate() + 1);
		var sectionToday = {date: today, workout: workouts[today.yyyymmdd()]}
		var sectionYesterday = {date: yesterday, workout: workouts[yesterday.yyyymmdd()]}
		var sectionTomorrow = {date: tomorrow, workout: workouts[tomorrow.yyyymmdd()]}
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
		
	});
	
	/**
	 * pagehide event handler
	 * Destroys and removes event listeners
	 */
	mainPage.addEventListener( "pagehide", function() {
		sectionChangerWidget.destroy();
		sectionChangerEl.removeEventListener("sectionchange", sectionChangeHandler);
	});
	
	/**
	 * sectionchange event handler
	 * Updates section view
	 */	
	function sectionChangeHandler(e) {
		$(title).hide("drop", {direction: "up", duration: 200}, function () {
			title.innerHTML = generateSectionTitle(loadedSections[e.detail.active]);
			$(title).show("drop", {direction: "up", duration: 200});
		}); 
		
		if (lastSectionIndex != null) {
			updatePagination();
		}
		
		// If there are no loaded section left of the current section, create a new section
		if (e.detail.active == 0) {
			setTimeout(function () {
				var newDate = new Date();
				newDate.setDate(loadedSections[sectionChangerWidget.getActiveSectionIndex()].date.getDate() - 1);
				var newSection = {date: newDate, workout: workouts[newDate.yyyymmdd()]};
				addNewSection(newSection,"left");
			}, 200);
		}
		
		// If there are no loaded section right of the current section, create a new section
		if (e.detail.active == loadedSections.length-1) {
			setTimeout(function () {
				var newDate = new Date();
				newDate.setDate(loadedSections[sectionChangerWidget.getActiveSectionIndex()].date.getDate() + 1);
				var newSection = {date: newDate, workout: workouts[newDate.yyyymmdd()]};
				addNewSection(newSection,"right");
			}, 200);
		}
	}
	
	/**
	 * Adds new section
	 */	
	function addNewSection(section, side) {
		section.dom = createSectionDOM(section);
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
	function createSectionDOM(section) {
		var sectionEl;
		
		if (section.workout == null) {
			sectionEl = generateEmptySection();
		} else {
			sectionEl = document.createElement("section");
			sectionEl.innerHTML = '<span>Log Empty</span><div>Log Empty</div><div>Log Empty</div><div>Log Empty</div><div>Log Empty</div><div>Log Empty</div><div>Log Empty</div><div>Log Empty</div><div>Log Empty</div><div>Log Empty</div><div>Log Empty</div>';
		}
		return sectionEl;
	}
	
	/**
	 * Generates section title based on date
	 */	
	function generateSectionTitle(section) {
		var titleStr = DAY_NAMES[section.date.getDay()] + " " + section.date.getDate() + "/" + (section.date.getMonth()+1);
		
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
	function generateEmptySection() {
		var sectionEl = document.createElement("section");
		
		// Div containing "Log Empty" message
		var divEmptyEl = document.createElement("div");
		divEmptyEl.setAttribute("class", "empty-log");
		divEmptyEl.innerHTML = "Log Empty";
		
		// Div containing instruction message
		var divInstrEl = document.createElement("div");
		divInstrEl.setAttribute("class", "new-instructions");
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
		sectionEl.appendChild(divEmptyEl);
		sectionEl.appendChild(divInstrEl);
		sectionEl.appendChild(btnAddEl);
		sectionEl.appendChild(btnCopyEl);
		
		return sectionEl;
	}	
	
	/**
	 * Initializes pagination bullets at the bottom of the screen
	 */
	function initPagination() {
		lastSectionIndex = sectionChangerWidget.getActiveSectionIndex();
	
		paginationEl.innerHTML = "";
	
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
	
});
