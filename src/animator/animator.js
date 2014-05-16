/**
 * @fileoverview Animates features in map.data over time.
 * After loading features into google.maps.Data, you can instantiate a
 * new Animator, passing in a reference to your map and various options.
 *
 * usage:  var animator = new Animator(map); animator.start();.
 *
 * @author jlivni@google.com (Josh Livni).
 */

/**
 * @constructor
 * @param {google.maps.Map} map features already loaded in map.data.
 * @param {?Object} options overriding defaults.
 */
function Animator(map, options) {
  this.map = map;

  /**
  * Number of steps for the animation (higher # is smoother).
  * TODO(jlivni): Optimize for max smoothness with requestAnimationFrame
  * if user hasn't specified discrete steps for their animation.
  * @type {number}
  */
  this.steps = 500; // granularity; change this based on # of features

  /**
  * The key of the property that contains the time (in ms since epoch).
  * @type {string}
  */
  this.timeProperty = 'time';

  /**
  * Seconds the animation should last.
  * @type {number}
  */
  this.duration = 30000; // ms the aninmation should last.

  /**
  * Number of steps in advance features should fade in (or out).
  * @type {number}
  */
  //TODO(jlivni): implement this.
  this.fadeSteps = 3;

  /**
  * Continuously replay the animation.
  * @type {boolean}
  */
  this.repeat = true;

  /**
  * Don't remove features if true.
  * @type {boolean}
  */
  //TODO(jlivni): implement this.
  this.additive = true;

  /**
  * Start time in UTC ms (initialized to minimum in dataset).
  * @type {number}
  */
  this.startTime = null;

  /**
  * End time in UTC ms (initialized to max in dataset).
  * @type {number}
  */
  this.endTime = null;

  /**
  * Array of features in the data.
  * @private
  * @type {Array}
  */
  this.features_ = [];

  /**
  * id of the div element the time and slider will be displayed in.
  * @constant
  * @type {string}
  */
  this.UI_DIV = 'data_animator_ui';

  // override defaults with user specified options.
  var keys = ['timeProperty', 'steps', 'duration', 'additive', 'repeat'];
  for (var key in options) {
    if (keys.indexOf(key) > -1) {
      this[key] = options[key];
    }
  }
  // set min/max time and copy features from maps.data to features array.
  var that = this;
  this.map.data.forEach(function(feature) {
    var timeProp = feature.getProperty(that.timeProperty);
    if (timeProp && parseInt(timeProp)) {
      var time = parseInt(feature.getProperty(that.timeProperty));
      if (that.startTime) {
        that.startTime = Math.min(that.startTime, time);
      } else {
        that.startTime = time;
      }
      that.endTime = Math.max(that.endTime, time);
      that.features_.push(feature);
    }
    // TODO(jlivni): Push to some kind of debug or errors array.
  });
  // sort features by time
  this.features_.sort(function(a, b) {
    var prop = that.timeProperty;
    if (a.getProperty(prop) > b.getProperty(prop)) {
      return 1;
    }
    if (a.getProperty(prop) < b.getProperty(prop)) {
      return -1;
    }
    return 0;
  });
  this.enableControls();
}

/**
 * Move a step forward in the animation.
 */
Animator.prototype.animate = function() {
  var animationProgress = (new Date().getTime() - this.animationStart) / this.duration;
  var currentTime = this.startTime + animationProgress * (this.endTime - this.startTime);

  // display currentTime in control
  // TODO(jlivni): Break out into method for updating details/slider.
  var d = new Date(0);
  d.setUTCMilliseconds(currentTime);
  document.getElementById(this.UI_DIV).innerHTML = d.toLocaleString();

  for (var i = this.index; i < this.features_.length; i++) {
    var feature = this.features_[i];
    var time = parseInt(feature.getProperty(this.timeProperty));
    this.currentTime = time;
    // if feature.time < currentTime, add to map.Data
    if (time < currentTime) {
      this.map.data.add(feature);
    } else {
      break;
    }
  }
  this.index = i;

  if (animationProgress < 1) {
    var that = this;
    window.requestAnimationFrame(function() {
      that.animate();
    });
  } else {
    if (this.repeat) {
      this.start();
    }
  }
}

/**
 * Stop the animation.
 */
Animator.prototype.stop = function() {
  window.clearTimeout(this.timeout);
};

/**
 * Remove everything from map.data and prepare for adding back in.
 */
Animator.prototype.start = function() {
  //TODO (accept some kind of index into the features, via slider)
  this.animationStart = new Date().getTime();
  this.index = 0;
  // remove all features from map.data
  var that = this;
  this.map.data.forEach(function(feature) {
    that.map.data.remove(feature);
  });
  this.animate();
};

/**
 * Add display controls to the map.
 */
// TODO(jlivni): add time slider.
Animator.prototype.enableControls = function() {
  var div = document.getElementById(this.UI_DIV);
  if (!div) {
    div = document.createElement('div');
    div.setAttribute('id', this.UI_DIV);
    document.body.appendChild(div);
    this.map.controls[google.maps.ControlPosition.RIGHT_TOP].push(div);
  }
};
