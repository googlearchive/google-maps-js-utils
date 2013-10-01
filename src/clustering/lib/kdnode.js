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
