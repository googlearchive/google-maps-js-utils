/**
 * @fileoverview Animator for point features in google.maps.data
 * usage:  var animator = new Animator(map.data); animator.start();.
 * @author jlivni@google.com (Josh Livni).
 */

/**
 * @constructor
 * @param {google.maps.Data} data with point features you want to animate.
 * @param {?Object} options overriding defaults.
 */
function Animator(data, options) {
  this.data = data;

  /**
  * Number of steps for the animation (higher # is smoother).
  * @type {number}
  */
  this.steps = 500; // granularity; change this based on # of features

  /**
  * Seconds the animation should last.
  * @type {number}
  */
  this.duration = 30; // seconds the aninmation should last.

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
  * @type {boolean}
  */
  this.startTime = null;

  /**
  * End time in UTC ms (initialized to max in dataset).
  * @type {boolean}
  */
  this.endTime = null;

  /**
  * Array of features in the data.
  * @type {Object}
  */
  this.features = [];

  /**
  * Overrides default values with user specified otions, copies the data to
  * the features array, and sets the default min/max times.
  */
  this.init = function() {
    // override defaults with provided options
    var keys = ['steps', 'duration', 'fadeSteps', 'additive', 'repeat'];
    for (var key in options) {
      if (keys.indexOf(key) > -1) {
        this[key] = options[key];
      }
    }
    // set min/max time and copy features from maps.data to features array.
    var that = this;
    this.data.forEach(function(feature) {
      var time = parseInt(feature.getProperty('time'));
      if (that.startTime) {
        that.startTime = Math.min(that.startTime, time);
      } else {
        that.startTime = time;
      }
      that.endTime = Math.max(that.endTime, time);
      that.features.push(feature);
    });
    // sort features by time
    this.features.sort(function(a, b) {
      if (a.getProperty('time') > b.getProperty('time'))
        return 1;
      if (a.getProperty('time') < b.getProperty('time'))
        return -1;
      return 0;
    });
  };
  this.init();
}

/**
 * Move a step forward in the animation.
 */
Animator.prototype.animate = function() {
  var totalTime = this.endTime - this.startTime;
  futureTime = Math.ceil(totalTime / this.steps) + this.currentTime;
  if (this.index >= this.features.length - 1) {
    // clear existing timeout.
    this.stop();
    if (this.repeat) {
      // restart animation.
      this.start();
    }
  }
  for (var i = this.index; i < this.features.length; i++) {
    var feature = this.features[i];
    var time = parseInt(feature.getProperty('time'));
    this.currentTime = time;
    if (time <= futureTime) {
      this.data.add(feature);
    } else {
      // TODO(jlivni): Break out into method for updating details/slider.
      var d = new Date(0);
      d.setUTCMilliseconds(time);
      document.getElementById('current-time').innerHTML = d.toLocaleString();
      break;
    }
  }
  this.index = i;
  var that = this;
  this.timeout = window.setTimeout(function() {
    that.animate();
  }, that.duration / that.steps * 1000);
};

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
  this.currentTime = this.startTime; //TODO (accept other startTime, via slider)
  this.index = 0;
  // remove all features from map.data
  var that = this;
  this.data.forEach(function(feature) {
    that.data.remove(feature);
  });
  this.animate();
};
