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
        WIRE: -2,

        initialize: function(options) {
            if (typeof options.width == "undefined" || options.width < 0)
                throw "Circuit requires a valid width argument";
            if (typeof options.height == "undefined" || options.height < 0)
                throw "Circuit requires a valid height argument";

            this.set("components", new ComponentSet());
            this.set("wires", new WireSet());

            var emptyLocationMap = [];
            for (var x = 0; x < options.width; x++) {
                emptyLocationMap[x] = [];
                for (var y = 0; y < options.height; y++) {
                    emptyLocationMap[x][y] = this.EMPTY;
                }
            }
            this.set("locationMap", emptyLocationMap);
        },

        isEmptyRect: function(x, y, width, height) {
            var points = this._getPointsInRect(x, y, width, height);
            return this._areValidPoints(points, []);
        },

        addComponent: function(x, y, width, inputCount, outputCount, templateId) {
            var c = new Component({
                x: x,
                y: y,
                width: width,
                inputCount: inputCount,
                outputCount: outputCount,
                templateId: templateId
            });

            var points = this._getComponentPoints(c);
            var valid = this._areValidPoints(points, [c.id]);
            
            if (!valid)
                return false;

            this._setPoints(points, c.id);
            this.get("components").add(c);

            return c.get("id");
        },

        removeComponent: function(c) {
            this._setPoints(this._getComponentPoints(c), this.EMPTY);
            this.get("components").remove(c);
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
                var valid = this._areValidPoints(points, validIds);

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
            var map = this.get("locationMap");
            for (var i = 0; i < points.length; i++) {
                var point = points[i];
                if (map[point.x][point.y] == id)
                    map[point.x][point.y] = this.EMPTY;
            }
        },

        _setPoints: function(points, newId) {
            var map = this.get("locationMap");
            for (var i = 0; i < points.length; i++) {
                var point = points[i];
                map[point.x][point.y] = newId;
            }
        },

        _areValidPoints: function(points, allowedIds) {
            var i = 0;
            var valid = true;
            while (valid && i < points.length) {
                valid = this._isValidPoint(points[i], allowedIds);
                i++;
            }
            return valid;
        },

        _isValidPoint: function(point, allowedIds) {
            if (point.x < 0 || point.x >= this.get("width")) {
                return false;
            }
            if (point.y < 0 || point.y >= this.get("height")) {
                return false;
            }

            var actualId = this.get("locationMap")[point.x][point.y];
            return actualId == this.EMPTY || _.contains(allowedIds, actualId);
        }
    });
})