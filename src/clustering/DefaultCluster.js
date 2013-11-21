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
 * A simple cluster class representing a number of ClusterItems clustered at a
 * single position.
 * @param {!google.maps.LatLng} position
 * @param {!Array.<ClusterItem>} items
 * @constructor
 * @implements {Cluster}
 */
function DefaultCluster(position, items) {
  // TODO(bckenny): add support for {lat: num, lng: num}
  /**
   * Position of cluster.
   * @private {!google.maps.LatLng}
   */
  this.position_ = position;

  /**
   * Items in cluster.
   * @private {!Array.<ClusterItem>}
   */
  this.items_ = items;

  /**
   * Number of items in cluster.
   * @private {number}
   */
  this.size_ = this.items_.length;
}

/**
 * @inheritDoc
 */
DefaultCluster.prototype.getPosition = function() {
  return this.position_;
};

/**
 * @inheritDoc
 */
DefaultCluster.prototype.getItems = function() {
  return this.items_;
};

/**
 * @inheritDoc
 */
DefaultCluster.prototype.getSize = function() {
  return this.size_;
};
