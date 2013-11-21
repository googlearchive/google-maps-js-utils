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
