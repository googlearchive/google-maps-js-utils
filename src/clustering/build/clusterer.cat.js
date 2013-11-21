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
 * A very simple cluster renderer. When clusters change, existing ones are
 * repurposed, new ones are created as needed, and unneeded ones are removed
 * from map.
 * @param {!google.maps.Map} map
 * @constructor
 * @implements {ClusterRenderer}
 */
function DefaultClusterRenderer(map) {
  /**
   * The map for this renderer.
   * @private {!google.maps.Map}
   */
  this.map_ = map;

  /**
   * A pool of markers used for display and expanded on demand.
   * @private {!Array.<!google.maps.Marker>}
   */
  this.markers_ = [];
}

/**
 * A color scale hack.
 * @private {number}
 * @const
 */
DefaultClusterRenderer.SIZE_COLOR_SCALE_ = 30;

/**
 * @inheritDoc
 */
DefaultClusterRenderer.prototype.onClustersChanged = function(clusters) {
  // reuse markers from existing pool, expanding pool as needed
  for (var i = 0; i < clusters.length; i++) {
    var marker;
    if (i < this.markers_.length) {
      marker = this.markers_[i];
      if (!marker.getMap()) {
        marker.setMap(this.map_);
      }
    } else {
      marker = new google.maps.Marker({map: this.map_});
      this.markers_[i] = marker;
    }

    marker.setPosition(clusters[i].getPosition());

    var colorScale = clusters[i].getSize() /
        DefaultClusterRenderer.SIZE_COLOR_SCALE_;
    colorScale = Math.min(1, Math.sqrt(colorScale));
    var red = Math.min(Math.round(255 * colorScale), 255);
    marker.setIcon(/** @type {google.maps.Symbol} */ ({
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      strokeWeight: 4,
      fillColor: 'rgb(' + red + ',0,0)',
      fillOpacity: 1
    }));
  }

  // remove any member of the marker pool that was unused
  for (; i < this.markers_.length; i++) {
    if (this.markers_[i].getMap()) {
      this.markers_[i].setMap(null);
    }
  }
};
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
 * The required interface for values to be stored in a k-d tree.
 * @interface
 */
function KdData() {}

/**
 * The x coordinate of the value.
 * @type {number}
 */
KdData.prototype.x;

/**
 * The y coordinate of the value.
 * @type {number}
 */
KdData.prototype.y;

/**
 * An index for disambiguating values at the same (x, y) coordinates.
 * @type {number}
 */
KdData.prototype.index;

/**
 * A node in a k-d tree.
 * @param {KdData} data
 * @constructor
 */
function KdNode(data) {
  this.left = null;
  this.right = null;
  this.data = data;
}

/**
 * An object representing a nearest neighbor.
 * @interface
 */
function KdNearestNeighbor() {}

/**
 * @type {KdData}
 */
KdNearestNeighbor.prototype.neighbor;

/**
 * @type {number}
 */
KdNearestNeighbor.prototype.distance;
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

/* global KdNode */

/**
 * A k-d tree data structure. The stored KdData objects are used directly and
 * are *not* copied, so any change to their properties will invalidate the
 * results produced by this class. The KdData's x and y coordinates are used
 * for spatial sorting; its index is used to disambiguate points at the same
 * location. If two values in the tree have the same x, y, and index values,
 * results may be incorrect and an execution error may occur.
 * @param {Array.<KdData>=} opt_points Initial points for tree. The array
 *     itself is not retained and may be reused.
 * @constructor
 */
function KdTree(opt_points) {
  var points = opt_points || [];

  var xsorted = [];
  var ysorted = [];
  for (var i = 0; i < points.length; i++) {
    xsorted[i] = points[i];
    ysorted[i] = points[i];
  }
  xsorted.sort(KdTree.compareX_);
  ysorted.sort(KdTree.compareY_);

  this.root = KdTree.build_(xsorted, ysorted, true);
}

/**
 * Comparator function for sorting KdData values in x. If two objects have the
 * same x value, they are sorted in y, and if equal there, by unique index.
 * @param {KdData} a
 * @param {KdData} b
 * @return {number}
 * @private
 */
KdTree.compareX_ = function(a, b) {
  if (a.x < b.x) {
    return -1;
  } else if (a.x === b.x) {
    if (a.y < b.y) {
      return -1;
    } else if (a.y === b.y) {
      if (a.index < b.index) {
        return -1;
      } else if (a.index === b.index) {
        return 0;
      }
    }
  }
  return 1;
};

/**
 * Returns true if a is strictly less than b in x, otherwise false. See
 * KdTree.compareX_ for ordering details.
 * @param {KdData} a
 * @param {KdData} b
 * @return {boolean}
 * @private
 */
KdTree.lessThanX_ = function(a, b) {
  return (a.x < b.x) || (a.x === b.x && ((a.y < b.y) || (a.y === b.y && a.index < b.index)));
};

/**
 * Comparator function for sorting KdData values in y. If two objects have the
 * same y value, they are sorted in x, and if equal there, by unique index.
 * @param {KdData} a
 * @param {KdData} b
 * @return {number}
 * @private
 */
KdTree.compareY_ = function(a, b) {
  if (a.y < b.y) {
    return -1;
  } else if (a.y === b.y) {
    if (a.x < b.x) {
      return -1;
    } else if (a.x === b.x) {
      if (a.index < b.index) {
        return -1;
      } else if (a.index === b.index) {
        return 0;
      }
    }
  }
  return 1;
};

/**
 * Returns true if a is strictly less than b in y, otherwise false. See
 * KdTree.compareY_ for ordering details.
 * @param {KdData} a
 * @param {KdData} b
 * @return {boolean}
 * @private
 */
KdTree.lessThanY_ = function(a, b) {
  return (a.y < b.y) || (a.y === b.y && ((a.x < b.x) || (a.x === b.x && a.index < b.index)));
};

/**
 * Build a k-d tree from the provided values.
 * @param {!Array.<!KdData>} sorted0 An array of values to put in the tree,
 *     sorted in the dimension indeicated by xLevel.
 * @param {!Array.<!KdData>} sorted1 An array of the same values, sorted in the
 *     other dimension.
 * @param {boolean} xLevel True if x is the dimension to sort in at this level,
 *     false if y. 
 * @return {KdNode} The root of the tree created from values.
 * @private
 */
KdTree.build_ = function(sorted0, sorted1, xLevel) {
  var node;

  // base cases
  if (sorted0.length === 1) {
    node = new KdNode(sorted0[0]);
    return node;
  } else if (sorted0.length === 0) {
    return null;
  }

  var medianIndex = (sorted0.length / 2) | 0;
  var median = sorted0[medianIndex];
  node = new KdNode(median);

  var left0 = [];
  var right0 = [];
  for (var i = 0; i < medianIndex; i++) {
    left0[i] = sorted0[i];
  }
  i++;
  for (var j = 0; i < sorted0.length; i++) {
    right0[j++] = sorted0[i];
  }

  var left1 = [];
  var right1 = [];
  j = 0;
  var k = 0;
  for (i = 0; i < sorted1.length; i++) {
    var point = sorted1[i];
    if (point === median) {
      continue;
    }

    if (xLevel) {
      if (KdTree.lessThanX_(point, median)) {
        left1[j++] = point;
      } else {
        right1[k++] = point;
      }
    } else {
      if (KdTree.lessThanY_(point, median)) {
        left1[j++] = point;
      } else {
        right1[k++] = point;
      }
    }
  }

  node.left = KdTree.build_(left1, left0, !xLevel);
  node.right = KdTree.build_(right1, right0, !xLevel);

  return node;
};

/**
 * Find the minimum value in the specified dimension.
 * @param {KdNode} node The root node of the search.
 * @param {boolean} inX If finding the minimum in x, true, in y, false.
 * @param {boolean} xLevel If node's children are sorted in x, true, in y,
 *     false.
 * @return {KdData}
 * @private
 */
KdTree.findMinimum_ = function(node, inX, xLevel) {
  if (node === null) {
    return null;
  }

  if (inX === xLevel) {
    if (!node.left) {
      return node.data;
    } else {
      return KdTree.findMinimum_(node.left, inX, !xLevel);
    }

  } else {
    // return minimum of left, right, and node
    var left = KdTree.findMinimum_(node.left, inX, !xLevel);
    var right = KdTree.findMinimum_(node.right, inX, !xLevel);
    var minimum = node.data;

    if (inX) {
      if (left && KdTree.lessThanX_(left, minimum)) {
        minimum = left;
      }
      if (right && KdTree.lessThanX_(right, minimum)) {
        minimum = right;
      }
    } else {
      if (left && KdTree.lessThanY_(left, minimum)) {
        minimum = left;
      }
      if (right && KdTree.lessThanY_(right, minimum)) {
        minimum = right;
      }
    }

    return minimum;
  }
};

/**
 * Find the maximum value in the specified dimension.
 * @param {KdNode} node The root node of the search.
 * @param {boolean} inX If finding the maximum in x, true, in y, false.
 * @param {boolean} xLevel If node's children are sorted in x, true, in y,
 *     false.
 * @return {KdData}
 * @private
 */
KdTree.findMaximum_ = function(node, inX, xLevel) {
  if (node === null) {
    return null;
  }

  if (inX === xLevel) {
    if (!node.right) {
      return node.data;
    } else {
      return KdTree.findMaximum_(node.right, inX, !xLevel);
    }

  } else {
    // return maximum of left, right, and node
    var left = KdTree.findMaximum_(node.left, inX, !xLevel);
    var right = KdTree.findMaximum_(node.right, inX, !xLevel);
    var maximum = node.data;

    // NOTE: left !== right !== node.data, so !lessThan works for greaterThan
    if (inX) {
      if (left && !KdTree.lessThanX_(left, maximum)) {
        maximum = left;
      }
      if (right && !KdTree.lessThanX_(right, maximum)) {
        maximum = right;
      }
    } else {
      if (left && !KdTree.lessThanY_(left, maximum)) {
        maximum = left;
      }
      if (right && !KdTree.lessThanY_(right, maximum)) {
        maximum = right;
      }
    }

    return maximum;
  }
};

/**
 * Search for a value in the tree starting at specified root, removing it if
 * found, and returning the root (the new one, if changed).
 * @param {KdData} item The value to remove.
 * @param {KdNode} root The root node of the search for item.
 * @param {boolean} xLevel If root's children are sorted in x, true, in y,
 *     false.
 * @return {KdNode}
 * @private
 */
KdTree.delete_ = function(item, root, xLevel) {
  // TODO(bckenny): currently ~10% of execution time (including findMin/Max)
  if (root === null) {
    // TODO(bckenny): not sure what to do in this case yet

  } else if (root.data === item) {
    if (root.right !== null) {
      // take replacement from minimum on right
      root.data = KdTree.findMinimum_(root.right, xLevel, !xLevel);
      root.right = KdTree.delete_(root.data, root.right, !xLevel);
    } else if (root.left !== null) {
      root.data = KdTree.findMaximum_(root.left, xLevel, !xLevel);
      root.left = KdTree.delete_(root.data, root.left, !xLevel);
    } else {
      // leaf, so just delete
      root.data = null;
      return null;
    }

  } else {
    // can't be equal, so use lessThan/greaterThan
    var lessThan = xLevel ? KdTree.lessThanX_(item, root.data) : KdTree.lessThanY_(item, root.data);
    if (lessThan) {
      root.left = KdTree.delete_(item, root.left, !xLevel);
    } else {
      root.right = KdTree.delete_(item, root.right, !xLevel);
    }
  }

  return root;
};

/**
 * Find the nearest value in the tree to target, as defined by comparator
 * sorting.
 * @param {KdData} target
 * @param {KdNode} root The root node of the search for a neighbor.
 * @param {boolean} xLevel If root's children are sorted in x, true, in y,
 *     false.
 * @param {KdNearestNeighbor} candidate The closest neighbor so far.
 * @return {KdNearestNeighbor}
 * @private
 */
KdTree.nearest_ = function(target, root, xLevel, candidate) {
  if (root === null) {
    return candidate;
  }

  var data = root.data;
  var xDiff = target.x - data.x;
  var yDiff = target.y - data.y;
  xDiff *= xDiff;
  yDiff *= yDiff;

  // test this node, but skip over if self
  if (target !== data) {
    var distance = xDiff + yDiff;
    if (distance < candidate.distance) {
      candidate.distance = distance;
      candidate.neighbor = data;
    }
  }

  // recurse to children, prioritizing the nearer half
  var lessThan;
  var testDistance;
  if (xLevel) {
    lessThan = target.x < data.x;
    testDistance = xDiff;
  } else {
    lessThan = target.y < data.y;
    testDistance = yDiff;
  }

  if (lessThan) {
    candidate = KdTree.nearest_(target, root.left, !xLevel, candidate);
    if (root.right && testDistance <= candidate.distance) {
      candidate = KdTree.nearest_(target, root.right, !xLevel, candidate);
    }

  } else {
    candidate = KdTree.nearest_(target, root.right, !xLevel, candidate);
    if (root.left && testDistance <= candidate.distance) {
      candidate = KdTree.nearest_(target, root.left, !xLevel, candidate);
    }
  }

  return candidate;
};

/**
 * Add a value to the k-d tree.
 * @param {KdData} item
 */
KdTree.prototype.addItem = function(item) {
  if (!this.root) {
    this.root = new KdNode(item);
    return;
  }

  var node = this.root;
  var xLevel = true;

  while (true) {
    var lessThan = xLevel ? KdTree.lessThanX_(item, node.data) : KdTree.lessThanY_(item, node.data);

    if (item === node.data) {
      throw new Error('duplicate entry by our metric');

    } else if (lessThan) {
      if (!node.left) {
        node.left = new KdNode(item);
        return;
      }
      node = node.left;
      xLevel = !xLevel;

    } else {
      if (!node.right) {
        node.right = new KdNode(item);
        return;
      }
      node = node.right;
      xLevel = !xLevel;
    }
  }
};

/**
 * Remove an item from the k-d tree, if present.
 * @param {KdData} item
 */
KdTree.prototype.removeItem = function(item) {
  this.root = KdTree.delete_(item, this.root, true);
};

/**
 * Find the nearest neighbor to item in the tree.
 * @param {KdData} item
 * @return {KdNearestNeighbor}
 */
KdTree.prototype.nearestNeighbor = function(item) {
  var candidate = /** @type {KdNearestNeighbor} */ ({
    neighbor: null,
    distance: Number.MAX_VALUE
  });

  return KdTree.nearest_(item, this.root, true, candidate);
};
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
 * A prioritizable node.
 * @interface
 * 
 */
function PriorityQueueNode() {}

/**
 * @type {number}
 */
PriorityQueueNode.prototype.value;
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
 * Implementation of a min-priority queue. If initial values are provided via
 * opt_elements, the queue will use that array as storage, modifying it in
 * place, assuming total ownership afterwards.
 * @param {Array.<PriorityQueueNode>=} opt_elements A set of elements to
 *     intialize the queue with.
 * @constructor
 */
function MinPriorityQueue(opt_elements) {
  /**
   * The heap.
   * @private {!Array.<PriorityQueueNode>}
   */
  this.elements_ = opt_elements || [];

  /**
   * The number of elements in the heap.
   * @private {number}
   */
  this.size_ = this.elements_.length;

  if (opt_elements) {
    this.init_();
  }
}

/**
 * Ensure that the node at index correctly fulfills heap property with respect
 * to its children.
 * @param {number} index The index of the node to check
 * @private
 */
MinPriorityQueue.prototype.heapify_ = function(index) {
  var elements = this.elements_;
  var minIndex = index;
  var item = elements[index];
  var itemValue = item.value;
  var minItem = item;

  while (true) {
    var leftIndex = index * 2 + 1;
    if (leftIndex < this.size_) {
      var left = elements[leftIndex];
      if (left.value < itemValue) {
        minIndex = leftIndex;
        minItem = left;
      }

      var rightIndex = leftIndex + 1;
      if (rightIndex < this.size_) {
        var right = elements[rightIndex];
        if (right.value < minItem.value) {
          minIndex = rightIndex;
          minItem = right;
        }
      }

      if (minIndex !== index) {
        elements[index] = minItem;
        index = minIndex;
      } else {
        elements[index] = item;
        break;
      }
    } else {
      elements[index] = item;
      break;
    }
  }
};

/**
 * Ensure that all nodes fulfill the heap property.
 * @private
 */
MinPriorityQueue.prototype.init_ = function() {
  var last = this.size_ - 1;
  var index = Math.floor((last - 1) / 2);

  for (; index >= 0; index--) {
    this.heapify_(index);
  }
};

/**
 * Returns the current number of elements in the queue.
 * @return {number}
 */
MinPriorityQueue.prototype.getSize = function() {
  return this.size_;
};

/**
 * Returns the minimum element, if any, without removing from the
 * queue.
 * @return {PriorityQueueNode|undefined}
 */
MinPriorityQueue.prototype.peek = function() {
  return this.elements_[0];
};

/**
 * Removes the minimum element from the queue, if any, and returns it.
 * @return {PriorityQueueNode|undefined}
 */
MinPriorityQueue.prototype.pop = function() {
  var min = this.elements_[0];
  this.size_--;
  this.elements_[0] = this.elements_[this.size_];
  this.elements_[this.size_] = null;
  this.heapify_(0);

  return min;
};

/**
 * Puts the specified element into the queue.
 * @param {!PriorityQueueNode} element
 */
MinPriorityQueue.prototype.push = function(element) {
  var elements = this.elements_;
  var index = this.size_;
  elements[index] = element;
  this.size_++;

  var parentIndex = Math.floor((index - 1) / 2);
  while (parentIndex >= 0 && elements[index].value < elements[parentIndex].value) {
    var tmp = elements[parentIndex];
    elements[parentIndex] = elements[index];
    elements[index] = tmp;

    index = parentIndex;
    parentIndex = Math.floor((index - 1) / 2);
  }
};
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
 * An object for the internal representation of a cluster. 
 * @param {number} x The x coordinate of the cluster.
 * @param {number} sumX The sum of x coordinates of the clustered objects.
 * @param {number} y The y coordinate of the cluster.
 * @param {number} sumY The sum of y coordinates of the clustered objects.
 * @param {!Array.<number>} indices The indices of the clustered objects.
 * @param {number} index The index of this object in array of clusters.
 * @constructor
 * @implements {KdData}
 * @struct
 */
function ClusterObject(x, sumX, y, sumY, indices, index) {
  /**
   * @type {number}
   */
  this.x = x;

  /**
   * @type {number}
   */
  this.sumX = sumX;

  /**
   * @type {number}
   */
  this.y = y;

  /**
   * @type {number}
   */
  this.sumY = sumY;

  /**
   * @type {!Array.<number>}
   */
  this.indices = indices;

  /**
   * @type {boolean}
   */
  this.valid = true;

  /**
   * @type {number}
   */
  this.index = index;
}
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
 * An edge between a node and possibly the next closest node.
 * @interface
 * @extends {PriorityQueueNode}
 */
function ClusterEdge() {}

/**
 * The origin of the edge, always defined.
 * @type {!ClusterObject}
 */
ClusterEdge.prototype.origin;

/**
 * The destination of the edge, if one exists.
 * @type {ClusterObject}
 */
ClusterEdge.prototype.dest;

/**
 * The value of the edge, in this case the square of the length between nodes.
 */
ClusterEdge.prototype.value;
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

/* global DefaultCluster, KdTree, MinPriorityQueue, ClusterObject */

/**
 * A hierarchical clustering algorithm. Clusters any items a set distance apart
 * in pixel space, in order by distance (ascending). The clustering order of
 * multiple pairs of items an equal distance apart is defined by insertion
 * order and the details of implementation, so may vary between releases.
 * Assumes pixel space is defined by the Web Mercator projection.
 * @param {number=} opt_clusterDistance The distance within which two objects
 *     will clustered. If not specified, a default of 30 piexls will be used.
 * @constructor
 * @implements {ClusterAlgorithm}
 */
function HierarchicalClusterer(opt_clusterDistance) {
  /**
   * The objects to be clustered.
   * @private {!Array.<KdTreeQueueItem>}
   */
  this.items_ = [];

  /**
   * The count of objects to be clustered.
   * @private {number}
   */
  this.itemCount_ = 0;

  /**
   * The distance within which two objects will be clustered.
   * @private {number}
   */
  this.clusterDistance_ = (opt_clusterDistance != null) ? opt_clusterDistance :
      HierarchicalClusterer.CLUSTER_PIXEL_DISTANCE;
}

/**
 * The default distance within which two objects will clustered.
 * @type {number}
 * @const
 */
HierarchicalClusterer.CLUSTER_PIXEL_DISTANCE = 30;

/**
 * Convert longitude to x in world coordinates.
 * @param {number} lng
 * @return {number}
 * @private
 */
HierarchicalClusterer.lngToX_ = function(lng) {
  return 256 * (lng / 360 + 0.5);
};

/**
 * Convert latitude to y in world coordinates.
 * @param {number} lat
 * @return {number}
 * @private
 */
HierarchicalClusterer.latToY_ = function(lat) {
  var merc = -Math.log(Math.tan((0.25 + lat / 360) * Math.PI));
  return 128 * (1 +  merc / Math.PI);
};

/**
 * Convert x in world coordinates to longitude.
 * @param {number} x
 * @return {number}
 * @private
 */
HierarchicalClusterer.xToLng_ = function(x) {
  return 360 * (x / 256 - 0.5);
};

/**
 * Convert y in world coordinates to latitude.
 * @param {number} y
 * @return {number}
 * @private
 */
HierarchicalClusterer.yToLat_ = function(y) {
  var merc = Math.PI * (y / 128 - 1);
  return (360 / Math.PI) * Math.atan(Math.exp(-merc)) - 90;
};

/**
 * @inheritDoc
 */
HierarchicalClusterer.prototype.addItem = function(item) {
  var latLng = item.getPosition();
  var newPoint = /** @type {KdTreeQueueItem} */ ({
    x: HierarchicalClusterer.lngToX_(latLng.lng()),
    y: HierarchicalClusterer.latToY_(latLng.lat()),
    item: item
  });

  this.items_[this.itemCount_] = newPoint;
  this.itemCount_++;
};

/**
 * @inheritDoc
 */
HierarchicalClusterer.prototype.addItems = function(items) {
  for (var i = 0; i < items.length; i++) {
    this.addItem(items[i]);
  }
};

/**
 * @inheritDoc
 */
HierarchicalClusterer.prototype.clearItems = function() {
  this.items_ = [];
  this.itemCount_ = 0;
};

/**
 * @inheritDoc
 */
HierarchicalClusterer.prototype.getItems = function() {
  var itemArray = [];
  for (var i = 0; i < this.items_.length; i++) {
    itemArray[i] = this.items_[i];
  }

  return itemArray;
};

/**
 * @inheritDoc
 */
HierarchicalClusterer.prototype.removeItem = function(item) {
  // item order doesn't matter, so replace removed with last element
  // removes first matching item and keeps array dense
  for (var i = 0; i < this.itemCount_; i++) {
    if (this.items_[i].item === item){
      this.itemCount_--;
      this.items_[i] = this.items_[this.itemCount_];
      this.items_[this.itemCount_] = null;
      break;
    }
  }
};

/**
 * @inheritDoc
 */
HierarchicalClusterer.prototype.getClusters = function(zoom) {
  var cluster;

  var clusters = [];
  for (var i = 0; i < this.itemCount_; i++) {
    cluster = new ClusterObject(this.items_[i].x, this.items_[i].x,
        this.items_[i].y, this.items_[i].y, [i], clusters.length);
    clusters[i] = cluster;
  }

  var epsilon = this.clusterDistance_ / (1 << zoom);

  var clusterCount = this.cluster_(clusters, epsilon);

  var finalClusters = [];
  for (i = 0; i < clusterCount; i++) {
    cluster = clusters[i];
    var indices = cluster.indices;
    var latLng;
    if (indices.length === 1) {
      // single point, so just reuse latlng
      latLng = this.items_[indices[0]].item.getPosition();
    } else {
      var lat = HierarchicalClusterer.yToLat_(cluster.y);
      var lng = HierarchicalClusterer.xToLng_(cluster.x);
      latLng = new google.maps.LatLng(lat, lng);
    }

    var items = [];
    for (var j = 0; j < cluster.indices.length; j++) {
      items[j] = this.items_[cluster.indices[j]].item;
    }

    finalClusters[i] = new DefaultCluster(latLng, items);
  }

  return finalClusters;
};

/**
 * Cluster the specified objects, using minDistance as a threshold. The
 * clustering is done within the clusters array; the returned value is the
 * number of the resulting clusters, found in that number of the first slots of
 * the clusters array.
 * @param {!Array.<ClusterObject>} clusters The objects to cluster.
 * @param {number} minDistance
 * @return {number} The number of resulting clusters.
 * @private
 */
HierarchicalClusterer.prototype.cluster_ = function(clusters, minDistance) {
  var kdtree = new KdTree(clusters);
  var edgeQueue = this.createShortestEdgeQueue_(clusters, kdtree);

  // merge clusters if within limit
  var clusterCount = clusters.length;
  var sqEpsilon = minDistance * minDistance;
  while (edgeQueue.peek().value < sqEpsilon && clusterCount > 1) {
    var shortest = edgeQueue.pop();

    if (shortest.origin.valid) {
      var originCluster;
      var originClusterIndex;

      if (!shortest.dest.valid) {
        // dest not valid, so need to find new dest
        originCluster = shortest.origin;
        originClusterIndex = originCluster.index;

      } else {
        // origin and dest valid, combine into new cluster and find new dest
        var item0 = shortest.origin;
        var item1 = shortest.dest;

        var indices = item0.indices;
        var start = indices.length;
        var oldIndices = item1.indices;
        var length = oldIndices.length;
        for (var i = 0; i < length; i++) {
          indices[start + i] = oldIndices[i];
        }

        var sumX = item0.sumX + item1.sumX;
        var sumY = item0.sumY + item1.sumY;
        var newX = sumX / indices.length;
        var newY = sumY / indices.length;

        // eliminate old clusters
        item0.valid = false;
        kdtree.removeItem(item0);
        item1.valid = false;
        kdtree.removeItem(item1);
        originClusterIndex = Math.min(item0.index, item1.index);
        var oldIndex = Math.max(item0.index, item1.index);
        clusterCount--;
        clusters[oldIndex] = clusters[clusterCount];
        clusters[oldIndex].index = oldIndex;
        clusters[clusterCount] = null;

        originCluster = new ClusterObject(newX, sumX, newY, sumY,
            indices, originClusterIndex);

        clusters[originClusterIndex] = originCluster;
        kdtree.addItem(originCluster);
      }
      if (clusterCount < 2) {
        break;
      }

      // update edge by finding closest cluster dest to new origin
      shortest.origin = originCluster;
      var newNearest = kdtree.nearestNeighbor(originCluster);
      shortest.dest = newNearest.neighbor;
      shortest.value = newNearest.distance;

      // put new edge back on queue
      edgeQueue.push(shortest);
    }
  }

  return clusterCount;
};

/**
 * Creates a priority queue of edges, one per cluster, representing the
 * distance to the closest other cluster.
 * @param {!Array.<ClusterObject>} clusters
 * @param {KdTree} kdtree An acceleration data structure for fast nearest-
 *     neighbor queries, already populated by clusters array.
 * @return {MinPriorityQueue}
 * @private
 */
HierarchicalClusterer.prototype.createShortestEdgeQueue_ =
    function(clusters, kdtree) {
  var edges = [];
  for (var i = 0; i < clusters.length; i++) {
    var cluster = clusters[i];
    var nearest = kdtree.nearestNeighbor(cluster);

    var edge = /** @type {ClusterEdge} */ ({
      origin: cluster,
      dest: nearest.neighbor,
      value: nearest.distance
    });
    edges[i] = edge;
  }

  return new MinPriorityQueue(edges);
};
