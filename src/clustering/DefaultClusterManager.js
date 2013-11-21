/**
 * @license
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

/* global HierarchicalClusterer, DefaultClusterRenderer */

/**
 * A simple cluster manager implementation. By default, uses a hierarchical
 * clusterer algorithm and the DefaultClusterRenderer for rendering.
 * @param {!google.maps.Map} map
 * @constructor
 */
function DefaultClusterManager(map) {
  /**
   * @private {!google.maps.Map}
   */
  this.map_ = map;

  /**
   * @private {!ClusterAlgorithm}
   */
  this.algorithm_ = new HierarchicalClusterer();

  /**
   * @private {!ClusterRenderer}
   */
  this.renderer_ = new DefaultClusterRenderer(map);
}

/**
 * Set the renderer used to display clusters on the map.
 * @param {!ClusterRenderer} clusterRenderer
 */
DefaultClusterManager.prototype.setRenderer = function(clusterRenderer) {
  this.renderer_ = clusterRenderer;
};

/**
 * Set the algorith used to cluster items.
 * @param {!ClusterAlgorithm} algorithm
 */
DefaultClusterManager.prototype.setAlgorithm = function(algorithm) {
  var items = this.algorithm_.getItems();
  this.algorithm_ = algorithm;
  this.algorithm_.addItems(items);
};

/**
 * Add a ClusterItem to be clustered.
 * @param {!ClusterItem} item
 */
DefaultClusterManager.prototype.addItem = function(item) {
  this.algorithm_.addItem(item);
};

/**
 * Add an array of ClusterItems to be clustered.
 * @param {!Array.<!ClusterItem>} items
 */
DefaultClusterManager.prototype.addItems = function(items) {
  this.algorithm_.addItems(items);
};

/**
 * Remove all items from items to be clustered.
 */
DefaultClusterManager.prototype.clearItems = function() {
  this.algorithm_.clearItems();
};

/**
 * Remove a ClusterItem from the items to be clustered, if present.
 * @param {ClusterItem} item
 */
DefaultClusterManager.prototype.removeItem = function(item) {
  this.algorithm_.removeItem(item);
};

/**
 * Forces a re-clustering and updates the view.
 */
DefaultClusterManager.prototype.cluster = function() {
  // TODO(bckenny): currently the only need for map is zoom
  var zoom = this.map_.getZoom();
  var clusters = this.algorithm_.getClusters(zoom);
  this.renderer_.onClustersChanged(clusters);
};

DefaultClusterManager.prototype.onCameraChange = function(cameraPosition) {
  // TODO(bckenny)
};
