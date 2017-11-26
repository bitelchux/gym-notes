Date.prototype.yyyymmdd = function() {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join('-');
};

function DBManager() {
}

DBManager.prototype.getAllWorkouts = function() {
    var workouts = { '2017-11-24' : { exercises: [] },
    				 '2017-11-22' : { exercises: [] },
    				 '2017-11-19' : { exercises: [] },
    				 '2017-11-15' : { exercises: [] } };
    
    return workouts;
};

