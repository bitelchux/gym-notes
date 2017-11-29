var exerciseListPage = document.getElementById("exerciseListPage");
var elScroller;
var listHelper;


exerciseListPage.addEventListener("pagebeforeshow", function() {
	
	var listView = document.getElementById("exerciseListView");
	listView.innerHTML = "";
	for (var i = 0; i < categoryExercises.length; i++) {
		listView.appendChild(createExerciseLiElement(categoryExercises[i]));	
	}

	var list;

	elScroller = exerciseListPage.querySelector(".ui-scroller");
	if (elScroller) {
		list = elScroller.querySelector(".ui-listview");
	}

	if (elScroller && list) {
		listHelper = tau.helper.SnapListMarqueeStyle.create(list, {
			marqueeDelay: 500,
			marqueeStyle: "endToEnd"
		});

		var snapListWidget = tau.widget.SnapListview(list);
		if (newCategoryExerciseSearch) {
			elScroller.scrollTop = 0;
			snapListWidget.scrollToPosition(0);
			newCategoryExerciseSearch = false;
		}

		elScroller.setAttribute("tizen-circular-scrollbar", "");
	}	
	
})

exerciseListPage.addEventListener( "pagebeforehide", function() {
	if (listHelper) {
		listHelper.destroy();
		listHelper = null;
		if(elScroller) {
			elScroller.removeAttribute("tizen-circular-scrollbar");
		}
	}
});

function createExerciseLiElement(exercise) {
	var li = document.createElement("li");
	li.setAttribute("class", "li-has-multiline");
	  
	var nameDiv = document.createElement("div");
	nameDiv.setAttribute("class", "ui-marquee ui-marquee-gradient type-font text-90");
	nameDiv.innerHTML = exercise["name"];
	  
	var addRemoveDiv = document.createElement("div");
	var exerciseInCurrentWorkoutIdx = exerciseInCurrentWorkout(exercise);
	if (exerciseInCurrentWorkoutIdx >= 0) {
		addRemoveDiv.setAttribute("class", "li-text-sub ui-li-sub-text text-red hand-font");
		addRemoveDiv.innerHTML = '<i class="fa fa-trash"></i> Remove';
	} else {
		addRemoveDiv.setAttribute("class", "li-text-sub ui-li-sub-text text-yellow hand-font");
		addRemoveDiv.innerHTML = '<i class="fa fa-plus"></i> Add';
	}
	  
	li.appendChild(nameDiv);
	li.appendChild(addRemoveDiv);
	
	li.addEventListener("click", function() {
		var currentSection = loadedSections[sectionChangerWidget.getActiveSectionIndex()];
		
		var addRemoveDiv = this.querySelector(".li-text-sub"); 
		var exerciseInCurrentWorkoutIdx = exerciseInCurrentWorkout(exercise);
		if (exerciseInCurrentWorkoutIdx >= 0) {
			currentSection.workout.exercises.splice(exerciseInCurrentWorkoutIdx,1);
			if (currentSection.workout.exercises.length === 0) {
				currentSection.workout = null;
			}
			addRemoveDiv.setAttribute("class", "li-text-sub ui-li-sub-text text-yellow hand-font");
			addRemoveDiv.innerHTML = '<i class="fa fa-plus"></i> Add';
		} else {
			if (currentSection.workout == null) {
				currentSection.workout = { exercises: [exercise] };
			} else {
				currentSection.workout.exercises.push(exercise);
			}
			addRemoveDiv.setAttribute("class", "li-text-sub ui-li-sub-text text-red hand-font");
			addRemoveDiv.innerHTML = '<i class="fa fa-trash"></i> Remove'; 
		}
		currentSection.updated = true;
	})
	
	return li;
}

function exerciseInCurrentWorkout(exercise) {
	var currentSection = loadedSections[sectionChangerWidget.getActiveSectionIndex()];
	if (currentSection.workout == null) {
		return -1;
	}
	var found = -1;
	for(var i = 0; i < currentSection.workout.exercises.length; i++) {
	    if (currentSection.workout.exercises[i].id === exercise.id) {
	        found = i;
	        break;
	    }
	}
	return found;
}



