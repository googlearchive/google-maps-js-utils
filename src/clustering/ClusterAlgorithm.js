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
 * Logic for computing clusters.
 * @interface
 */
function ClusterAlgorithm() {}

/**
 * Add a ClusterItem to be clustered.
 * @param {ClusterItem} item
 */
ClusterAlgorithm.prototype.addItem = function(item) {};

/**
 * Add an array of ClusterItems to be clustered.
 * @param {!Array.<!ClusterItem>} items
 */
ClusterAlgorithm.prototype.addItems = function(items) {};

/**
 * Remove all items from items to be clustered.
 */
ClusterAlgorithm.prototype.clearItems = function() {};

/**
 * Remove a ClusterItem from the items to be clustered, if present.
 * @param {ClusterItem} item
 */
ClusterAlgorithm.prototype.removeItem = function(item) {};

/**
 * Returns the set of Clusters to display at specified zoom level.
 * @param {number} zoom
 * @return {!Array.<!Cluster>}
 */
ClusterAlgorithm.prototype.getClusters = function(zoom) {};
