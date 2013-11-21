#!/bin/sh
cd ..
cat DefaultClusterManager.js DefaultClusterItem.js DefaultCluster.js DefaultClusterRenderer.js lib/kdnode.js lib/kdtree.js lib/PriorityQueueNode.js lib/MinPriorityQueue.js kdqueue/ClusterObject.js kdqueue/ClusterEdge.js kdqueue/HierarchicalClusterer.js > build/clusterer.cat.js

#TODO(bckenny): disable function inlining

if [ -z $CLOSURE_COMPILER ]; then
  echo "CLOSURE_COMPILER should be defined."
  exit 1
fi

java -jar $CLOSURE_COMPILER --compilation_level ADVANCED_OPTIMIZATIONS --use_types_for_optimization --js=build/clusterer.cat.js --js=build/clusterer_exports.js --js_output_file=build/clusterer.min.js --warning_level=VERBOSE --jscomp_warning=accessControls --jscomp_warning=const --jscomp_warning=visibility --externs build/google_maps_api_v3_14.js --externs ClusterItem.js --externs Cluster.js --externs ClusterAlgorithm.js --externs ClusterRenderer.js --externs kdqueue/KdTreeQueueItem.js
cd build/

# from yepnope.js
m=$(ls -la clusterer.min.js | awk '{ print $5}')
gzip -nfc --best clusterer.min.js > clusterer.min.js.gz
g=$(ls -la clusterer.min.js.gz | awk '{ print $5}')
echo "$m bytes minified, $g bytes gzipped"
rm clusterer.min.js.gz