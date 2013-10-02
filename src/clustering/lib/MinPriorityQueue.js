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
