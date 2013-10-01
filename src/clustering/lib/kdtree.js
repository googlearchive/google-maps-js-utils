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
