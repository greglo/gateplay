var Circuit = Backbone.Model.extend({
    initialize: function(options) {
        if (typeof options.width == "undefined" || options.width < 0)
            throw "Circuit requires a valid width argument";
        if (typeof options.height == "undefined" || options.height < 0)
            throw "Circuit requires a valid height argument";

        this.set("components", new ComponentSet());

        var emptyLocationMap = [];
        for (var x = 0; x < options.width; x++) {
            emptyLocationMap[x] = [];
            for (var y = 0; y < options.height; y++) {
                emptyLocationMap[x][y] = -1;
            }
        }
        this.set("locationMap", emptyLocationMap);
    },

    addComponent: function(c) {
        console.log(c);
        var points = this._getComponentPoints(c.get("x"), c.get("y"), c.get("width"), c.get("height"));
        var valid = this._areValidPoints(points, [c.id]);
        
        if (!valid)
            return false;

        this._setPoints(points, c.id);
        this.get("components").add(c);
    },

    removeComponent: function(c) {
        this._setPoints(this._getComponentPoints(c.get("x"), c.get("y"), c.get("width"), c.get("height")), -1);
        this.get("components").remove(c);
    },

    moveComponent: function(id, newX, newY) {
        var transformations = [{
            id: id,
            newX: newX,
            newY: newY
        }];
        return this.moveSelection(transformations);
    },

    moveSelection: function(transformations) {
        var components = this.get("components");

        var pointsByTransform = [];
        var validIds = [];

        for (var i = 0; i < transformations.length; i++) {
            validIds.push(transformations[i].id);
        }

        for (var i = 0; i < transformations.length; i++) {
            var t = transformations[i];
            var c = components.get(t.id);

            var points = this._getComponentPoints(t.newX, t.newY, c.get("width"), c.get("height"));
            var valid = this._areValidPoints(points, validIds);

            if (!valid)
                return false;

            pointsByTransform[i] = points;
        }

        for (var i = 0; i < transformations.length; i++) {
            var t = transformations[i];
            var c = components.get(t.id);
            var points = pointsByTransform[i]
            var oldPoints = this._getComponentPoints(c.get("x"), c.get("y"), c.get("width"), c.get("height"));
    
            this._setPoints(oldPoints, -1);
            this._setPoints(points, c.id);
            c.set("x", t.newX);
            c.set("y", t.newY);
        }

        return true;
    },

    _getComponentPoints: function(x, y, width, height) {
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

    _setPoints: function(points, id) {
        var map = this.get("locationMap");
        for (var i = 0; i < points.length; i++) {
            var point = points[i];
            map[point.x][point.y] = id;
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
        if (point.x < 0 || point.x >= this.get("width"))
            return false;
        if (point.y < 0 || point.y >= this.get("height"))
            return false;

        var actualId = this.get("locationMap")[point.x][point.y];
        return actualId == -1 || _.contains(allowedIds, actualId);
    }
});