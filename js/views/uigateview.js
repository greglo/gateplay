var UIGateView = Backbone.View.extend({
    render : function() {
        var model=this.model;

        var layer = new Kinetic.Layer();

        var gateGroup = new Kinetic.Group({
            x: model.get("x"),
            y: model.get("y"),
            draggable: true
        });

              var center = new Kinetic.Circle({
        x: 0,
        y: 0,
        radius: 20,
        fill: 'yellow',
        stroke: 'black',
        strokeWidth: 4
      });
              gateGroup.add(center);

        layer.add(gateGroup);
        stage.add(layer);
    }
});