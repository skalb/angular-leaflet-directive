angular.module("leaflet-directive").directive('functionalTiles', function ($log, leafletData, leafletMapDefaults, leafletHelpers) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: 'leaflet',

        link: function(scope, element, attrs, controller) {
            var isDefined = leafletHelpers.isDefined,
                leafletScope  = controller.getLeafletScope(),
                functionalTiles = leafletScope.functionalTiles;

            if (!isDefined(functionalTiles) && !isDefined(functionalTiles.urlFunction)) {
                $log.warn("[AngularJS - Leaflet] The 'functionalTiles' definition doesn't have the 'urlFunction' property.");
                return;
            }

            controller.getMap().then(function(map) {
                var defaults = leafletMapDefaults.getDefaults(attrs.id);
                var tileLayerObj;
                leafletScope.$watch("functionalTiles", function(functionalTiles) {
                    var tileLayerOptions = defaults.tileLayerOptions;
                    var tileLayerUrlFunction = defaults.tileLayer;

                    // If no valid functionalTiles are in the scope, remove the last layer
                    if (!isDefined(functionalTiles.urlFunction) && isDefined(tileLayerObj)) {
                        map.removeLayer(tileLayerObj);
                        return;
                    }

                    // No leafletTiles object defined yet
                    if (!isDefined(tileLayerObj)) {
                        if (isDefined(functionalTiles.options)) {
                            angular.copy(functionalTiles.options, tileLayerOptions);
                        }

                        if (isDefined(functionalTiles.urlFunction)) {
                            tileLayerUrlFunction = functionalTiles.urlFunction;
                        }

                        tileLayerObj = new L.TileLayer.Functional(tileLayerUrlFunction, tileLayerOptions);
                        tileLayerObj.addTo(map);
                        leafletData.setFunctionalTiles(tileLayerObj, attrs.id);
                        return;
                    }

                    // If the options of the tilelayer is changed, we need to redraw the layer
                    if (isDefined(functionalTiles.urlFunction) && isDefined(functionalTiles.options) && !angular.equals(functionalTiles.options, tileLayerOptions)) {
                        map.removeLayer(tileLayerObj);
                        tileLayerOptions = defaults.tileLayerOptions;
                        angular.copy(functionalTiles.options, tileLayerOptions);
                        tileLayerUrlFunction = functionalTiles.urlFunction;
                        tileLayerObj = new L.TileLayer.Functional(tileLayerUrlFunction, tileLayerOptions);
                        tileLayerObj.addTo(map);
                        leafletData.setFunctionalTiles(tileLayerObj, attrs.id);
                        return;
                    }

                    // Only the URL of the layer is changed, update the functionalTiles object
                    if (isDefined(functionalTiles.urlFunction)) {
                        tileLayerObj.setUrl(functionalTiles.urlFunction);
                    }
                }, true);
            });
        }
    };
});
