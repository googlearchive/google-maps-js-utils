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
