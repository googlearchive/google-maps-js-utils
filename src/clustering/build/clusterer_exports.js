// closure compiler exports for clusterer

self['DefaultClusterManager'] = DefaultClusterManager;
DefaultClusterManager.prototype['setRenderer'] = DefaultClusterManager.prototype.setRenderer;
DefaultClusterManager.prototype['setAlgorithm'] = DefaultClusterManager.prototype.setAlgorithm;
DefaultClusterManager.prototype['addItem'] = DefaultClusterManager.prototype.addItem;
DefaultClusterManager.prototype['addItems'] = DefaultClusterManager.prototype.addItems;
DefaultClusterManager.prototype['clearItems'] = DefaultClusterManager.prototype.clearItems;
DefaultClusterManager.prototype['removeItem'] = DefaultClusterManager.prototype.removeItem;
DefaultClusterManager.prototype['cluster'] = DefaultClusterManager.prototype.cluster;
DefaultClusterManager.prototype['onCameraChange'] = DefaultClusterManager.prototype.onCameraChange;

self['DefaultClusterItem'] = DefaultClusterItem;
DefaultClusterItem.prototype['getPosition'] = DefaultClusterItem.prototype.getPosition;
DefaultClusterItem.prototype['getMarkerOptions'] = DefaultClusterItem.prototype.getMarkerOptions;

self['DefaultCluster'] = DefaultCluster;
DefaultCluster.prototype['getPosition'] = DefaultCluster.prototype.getPosition;
DefaultCluster.prototype['getItems'] = DefaultCluster.prototype.getItems;
DefaultCluster.prototype['getSize'] = DefaultCluster.prototype.getSize;

self['DefaultClusterRenderer'] = DefaultClusterRenderer;
DefaultClusterRenderer.prototype['onClustersChanged'] = DefaultClusterRenderer.prototype.onClustersChanged;

self['HierarchicalClusterer'] = HierarchicalClusterer;
HierarchicalClusterer.prototype['addItem'] = HierarchicalClusterer.prototype.addItem;
HierarchicalClusterer.prototype['removeItem'] = HierarchicalClusterer.prototype.removeItem;
HierarchicalClusterer.prototype['getClusters'] = HierarchicalClusterer.prototype.getClusters;
