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
