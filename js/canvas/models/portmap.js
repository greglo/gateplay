define([
    "underscore",
    "backbone",
], function(_, Backbone) {
    return Backbone.Model.extend({
        initialize: function(options) {
            this.set("components", {});
        },

        addNewComponent: function(c) {
            var id = c.get("id");
            var componentMaps = this.get("componentMaps");
            componentMaps[id] = _newEmptyMap();
        },

        addConnection: function(sourceId, sourcePort, targetId, targetPort) {
            var sourceMap = this.get("componentMaps")[sourceId];
            sourceMap.outputToInputs[sourcePort]
        },  

        _newEmptyMap: function() {
            return {
                outputToInputs: {},
                inputToOutput: {}
            };
        }
    });
});