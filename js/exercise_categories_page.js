var categories = [];
var exerciseCategoriesPage = document.getElementById("exerciseCategoriesPage");
var elScroller;
var listHelper;
var currentCategory;
var categoryExercises = [];
var newCategoryExerciseSearch = true;

exerciseCategoriesPage.addEventListener("pagecreate", function() {
	categories = dbManager.getAllCategories();
	addCategoriesToListView();
})

exerciseCategoriesPage.addEventListener("pagebeforeshow", function() {
	var list;

	elScroller = exerciseCategoriesPage.querySelector(".ui-scroller");
	if (elScroller) {
		list = elScroller.querySelector(".ui-listview");
	}

	if (elScroller && list) {
		listHelper = tau.helper.SnapListMarqueeStyle.create(list, {
			marqueeDelay: 500,
			marqueeStyle: "endToEnd"
		});

		var snapListWidget = tau.widget.SnapListview(list);
		if (newCategorySearch) {
			elScroller.scrollTop = 0;
			snapListWidget.scrollToPosition(0);
			newCategorySearch = false;
		}

		elScroller.setAttribute("tizen-circular-scrollbar", "");
	}	
})

exerciseCategoriesPage.addEventListener( "pagebeforehide", function() {
	if (listHelper) {
		listHelper.destroy();
		listHelper = null;
		if(elScroller) {
			elScroller.removeAttribute("tizen-circular-scrollbar");
		}
	}
});

function addCategoriesToListView() {
	var listView = document.getElementById("categoryListView");
	listView.innerHTML = "";
	for (var i = 0; i < categories.length; i++) {
		listView.appendChild(createCategoryLiElement(categories[i]));
	}
}

function createCategoryLiElement(category) {
	var li = document.createElement("li");
	li.setAttribute("class","li-has-multiline li-has-thumb-left");
	
	var spanMuscles = document.createElement("span");
	spanMuscles.setAttribute("class","ui-li-sub-text li-text-sub hand-font text-yellow ui-marquee ui-marquee-gradient");
	spanMuscles.innerHTML = category["muscles"].join(", ") + ", etc.";
	
	var spanName = document.createElement("span");
	spanName.setAttribute("class", "type-font text-90");
	spanName.innerHTML = category["name"];
	
	var imgIcon = document.createElement("img");
	imgIcon.src = "images/" + category["name"].toLowerCase() + ".png";
	
	li.appendChild(spanName);
	li.appendChild(spanMuscles);
	li.appendChild(imgIcon);
	
	li.addEventListener("click", function() {
		currentCategory = category;
		categoryExercises = [];
		dbManager.getAllExercises(function(data) {
			for (var i = 0; i < data.length; i++) {
				if (data[i]["category"] === currentCategory["id"]) {
					categoryExercises.push(data[i]);
				}
			}
			newCategoryExerciseSearch = true;
			tau.changePage("exerciseListPage");
		});
	})
	return li;
}
