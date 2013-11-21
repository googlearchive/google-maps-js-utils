/**
 * Copyright 2013 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** 
 * A single data point to be clustered.
 * @param {!google.maps.LatLng} latLng
 * @param {!google.maps.MarkerOptions} options
 * @implements {ClusterItem}
 * @constructor
 */
function DefaultClusterItem(latLng, options) {
  // TODO(bckenny): add support for {lat: num, lng: num}
  /**
   * Position of item.
   * @private {!google.maps.LatLng}
   */
  this.position_ = latLng;

  // TODO(bckenny): move to general options, not markeroptions
  /**
   * Options associated with item.
   * @private {!google.maps.MarkerOptions}
   */
  this.options_ = options;
}

/**
 * @inheritDoc
 */
DefaultClusterItem.prototype.getPosition = function() {
  return this.position_;
};

/**
 * Get options associated with this point.
 */
DefaultClusterItem.prototype.getMarkerOptions = function() {
  return this.options_;
};
