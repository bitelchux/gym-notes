Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('-');
};

Date.prototype.addDays = function(days) {
	  var dat = new Date(this.valueOf());
	  dat.setDate(dat.getDate() + days);
	  return dat;
}

function DBManager() {
}

DBManager.prototype.getAllWorkouts = function() {
    var workouts = { };
    
    return workouts;
};

DBManager.prototype.getAllCategories = function() {
	return [ {id:10, name:"Abs", muscles: ["Obliquus externus abdominis","Rectus abdominis"]},
	         {id:8, name:"Arms", muscles: ["Biceps brachii","Brachialis","Triceps brachii"]},
	         {id:12, name:"Back", muscles: ["Latissimus dorsi","Trapezius"]},
	         {id:11,name:"Chest", muscles: ["Pectoralis major","Serratus anterior"]},
	         {id:9,name:"Legs", muscles: ["Biceps femoris","Gastrocnemius","Gluteus maximus","Quadriceps femoris","Soleus"]},
	         {id:13,name:"Shoulders", muscles: ["Anterior deltoid","Trapezius"]} ]
};

DBManager.prototype.getAllExercises = function(callback) {
	$.getJSON("fixtures/exercises.json", function(data) {
		callback(data);
	})
};

var dbManager = new DBManager();