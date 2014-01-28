define([
    "jquery",
    "jquery-ui",
    "foundation",
    "canvas/models/circuit",
    "canvas/models/component",
    "canvas/views/circuitview"
], 
function($, ui, Foundation, Circuit, Component, CircuitView) {
    var GRID_SIZE = 16;

    $(function() {
        $(document).foundation();

        // Full size canvas
        $("#workbench").attr("width", $("#workbench").parent().innerWidth());
        $("#workbench").attr("height", $(window).height() - $(".top-bar").height());
        
        // Create the canvas model and view
        var circuit = new Circuit({
            width: Math.floor($("#workbench").width() / GRID_SIZE),
            height: Math.floor($("#workbench").height() / GRID_SIZE)
        });

        var v = new CircuitView({
            el: $("#workbench"),
            gridSize: GRID_SIZE,
            circuit: circuit
        });



        // Accordion
        var lastMoved;
        $(".slider").click(function() {
            var pane = $("#" + $(this).data("pane"));

            if (typeof(lastMoved) === "undefined" || !lastMoved) {
                pane.slideDown("fast", function() {});
                lastMoved = pane;
            } else if (lastMoved.is(pane)) {
                lastMoved.slideUp("fast", function(){});
                lastMoved = null;
            } else {
                lastMoved.slideUp("fast", function(){});
                pane.slideDown("fast", function() {});
                lastMoved = pane;
            }
        });

        // Drag & drop gates
        var endPosition;
        $(".gate").draggable({
            revert: true,
            revertDuration: 0,
            scroll: false,
            cursor: "pointer",
            helper: 'clone',
            zIndex: 1000,
            start: function(event, ui) { 
                $(this).draggable("option", "cursorAt", {
                    left: Math.round(ui.helper.width() / 2),
                    top: Math.round(ui.helper.height() / 2)
                }); 
                $(ui.helper).addClass("invalid");
            },
            drag: function(event, ui) {
                endPosition = {left: event.pageX, top: event.pageY};
            }
        });

        $("#workbench").droppable({ 
            accept: ".gate", 
            drop: function(event, ui) {
                circuit.addComponent(new Component({
                    x: Math.floor((endPosition.left - $("#workbench").offset().left) / GRID_SIZE), 
                    y: Math.floor((endPosition.top - $("#workbench").offset().top) / GRID_SIZE),
                    templateId: $(ui.helper).data("templateid")
                }));
           }, 
            over: function(event, ui) {
                $(ui.helper).removeClass("invalid");
            },
            out: function(event, ui) {
                $(ui.helper).addClass("invalid");
            }
        });

        $("#specialButton").click(function() {
            alert("The result of programming late at night while warm and fuzzy: <3 :)")
        });

        $("#loading-screen").fadeOut(700);
    });
});