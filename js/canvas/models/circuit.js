define([
    "underscore",
    "backbone",
    "canvas/models/component",
    "canvas/models/wire",
    "canvas/collections/componentset",
    "canvas/collections/wireset"
], function(_, Backbone, Component, Wire, ComponentSet, WireSet) {
    return Backbone.Model.extend({
        EMPTY: -1,

        initialize: function(options) {
            if (typeof options.width == "undefined" || options.width < 0)
                throw "Circuit requires a valid width argument";
            if (typeof options.height == "undefined" || options.height < 0)
                throw "Circuit requires a valid height argument";

            this.set("components", new ComponentSet());
            this.set("wires", new WireSet());

            var emptyGateMap = [];
            var emptyWireMap = [];
            for (var x = 0; x < options.width; x++) {
                emptyGateMap[x] = [];
                emptyWireMap[x] = [];
                for (var y = 0; y < options.height; y++) {
                    emptyGateMap[x][y] = this.EMPTY;
                    emptyWireMap[x][y] = [];
                }
            }
            this.set("gateMap", emptyGateMap);
            this.set("wireMap", emptyWireMap);
        },

        isEmptyRect: function(x, y, width, height) {
            var points = this._getPointsInRect(x, y, width, height);
            return this._areValidGatePoints(points, []);
        },

        addComponent: function(x, y, inputCount, outputCount, templateId, cArg) {
            var c = new Component({
                x: x,
                y: y,
                inputCount: inputCount,
                outputCount: outputCount,
                templateId: templateId,
                cArg: cArg
            });

            var points = this._getComponentPoints(c);
            var valid = this._areValidGatePoints(points, [c.id]);
            
            if (!valid)
                return false;

            this._setPoints(points, c.id);
            this.get("components").add(c);

            return c.get("id");
        },

        removeComponent: function(cid) {
            var component = this.get("components").get(cid);
            this._setPoints(this._getComponentPoints(component), this.EMPTY);
            this.get("components").remove(cid);

            this.removeWiresFromComponent(cid);
        },

        removeWiresFromComponent: function(cid) {
            var component = this.get("components").get(cid);
            var existingWires = this.get("wires");
            
            var filteredWires = existingWires.filter(function(wire) {
                return wire.get("sourceId") === cid || wire.get("targetId") === cid;
            });

            this.get("wires").remove(filteredWires);
        },

        addWire: function(sourceId, sourcePort, targetId, targetPort, fixedPoints) {
            var wire = new Wire({
                sourceId: sourceId,
                sourcePort: sourcePort,
                targetId: targetId,
                targetPort: targetPort,
                fixedPoints: fixedPoints
            });
            this.get("wires").add(wire);

            return wire.get("id");
        },

        removeWire: function(id) {
            this.get("wires").remove(id);
        },

        moveComponentById: function(id, newX, newY) {
            var transformations = [{
                id: id,
                newX: newX,
                newY: newY
            }];
            return this.moveGroupByIds(transformations);
        },

        moveGroupByIds: function(transformations) {
            var components = this.get("components");

            var pointsByTransform = [];
            var validIds = [];

            // A component can move into the space previously occupied by itself, 
            //  or another component in the same transformation group
            for (var i = 0; i < transformations.length; i++) {
                validIds.push(transformations[i].id);
            }

            // Ensure that no transformation moves a component onto another component that is not in the same
            //  transformation group
            for (var i = 0; i < transformations.length; i++) {
                var t = transformations[i];
                var c = components.get(t.id);

                var points = this._getPointsInRect(t.newX, t.newY, c.get("width"), c.getHeight());
                var valid = this._areValidGatePoints(points, validIds);

                if (!valid)
                    return false;

                // Cache the points we calculated, since we will need them again if every transformation is valid
                pointsByTransform[i] = points;
            }

            // If we haven't returned false by this point, then all the tranformations are valid
            // We have cached the new points for every object, so now we just update the map
            for (var i = 0; i < transformations.length; i++) {
                var t = transformations[i];
                var c = components.get(t.id);
                var points = pointsByTransform[i]
                var oldPoints = this._getComponentPoints(c);

                this._clearPoints(oldPoints, t.id);
                this._setPoints(points, t.id);
                c.set("x", t.newX);
                c.set("y", t.newY);
            }

            return true;
        },

        _getComponentPoints: function(c) {
            return this._getPointsInRect(c.get("x"), c.get("y"), c.get("width"), c.getHeight());
        },

        _getPointsInRect: function(x, y, width, height) {
            var points = [];
            for (var px = x; px < x + width; px++) {
                for (var py = y; py < y + height; py++) {
                    points.push({
                        x: px, 
                        y: py
                    });
                };
            };
            return points;
        },


        _clearPoints: function(points, id) {
            var map = this.get("gateMap");
            for (var i = 0; i < points.length; i++) {
                var point = points[i];
                if (map[point.x][point.y] == id)
                    map[point.x][point.y] = this.EMPTY;
            }
        },

        _setPoints: function(points, newId) {
            var map = this.get("gateMap");
            for (var i = 0; i < points.length; i++) {
                var point = points[i];
                map[point.x][point.y] = newId;
            }
        },

        _areValidGatePoints: function(points, allowedIds) {
            var i = 0;
            var valid = true;
            while (valid && i < points.length) {
                valid = this._isValidGatePoint(points[i], allowedIds);
                i++;
            }
            return valid;
        },

        _isValidGatePoint: function(point, allowedIds) {
            if (point.x < 0 || point.x >= this.get("width")) {
                return false;
            }
            if (point.y < 0 || point.y >= this.get("height")) {
                return false;
            }

            var actualId = this.get("gateMap")[point.x][point.y];
            var isNotWirePoint = this.get("wireMap")[point.x][point.y].length === 0;
            return actualId == this.EMPTY || _.contains(allowedIds, actualId) && isNotWirePoint;
        }
    });
})