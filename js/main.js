define([
    "jquery",
    "jquery-ui",
    "foundation",
    "canvas/models/circuit",
    "canvas/models/component",
    "canvas/views/circuitview",
    "fabric",
    "canvas/views/templates/templatefactory"
], 
function($, ui, Foundation, Circuit, Component, CircuitView, fabric, TemplateFactory) {
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

        $("#rasterizer").attr("width", 2 * 7 * GRID_SIZE);
        $("#rasterizer").attr("height", 5 * GRID_SIZE);
        
        var rasterizer = new fabric.StaticCanvas("rasterizer");
        
        $(".gate").each(function() {
            rasterizer.clear();
            var templateId = $(this).data("templateid");
            var template = TemplateFactory.getTemplate(templateId);
            template.setValid(true);
            template.set({
                left: 0,
                top: 0
            });
            template.scale(GRID_SIZE / TemplateFactory.BOX_SIZE);
            rasterizer.add(template);

            var template = TemplateFactory.getTemplate(templateId);
            template.setValid(false);
            template.set({
                left: 7 * GRID_SIZE,
                top: 0
            });
            template.scale(GRID_SIZE / TemplateFactory.BOX_SIZE);
            rasterizer.add(template);
            $(this).css("width", 7 * GRID_SIZE);
            $(this).css("height", 5 * GRID_SIZE);
            $(this).css("background-image", "url(" + rasterizer.toDataURL() + ")");
        });




        // Accordion
        var lastMoved;
        $(".slider").click(function() {
            var pane = $("#" + $(this).data("pane"));
            var speed = 100;

            if (typeof(lastMoved) === "undefined" || !lastMoved) {
                pane.slideDown(speed, function() {});
                lastMoved = pane;
            } else if (lastMoved.is(pane)) {
                lastMoved.slideUp(speed, function(){});
                lastMoved = null;
            } else {
                lastMoved.slideUp(speed, function(){});
                pane.slideDown(speed, function() {});
                lastMoved = pane;
            }
        });

        // Drag & drop gates
        $(".gate").draggable({
            revert: true,
            revertDuration: 0,
            scroll: false,
            cursor: "pointer",
            helper: 'clone',
            zIndex: 1000,
            start: function(event, ui) { 
                $(ui.helper).addClass("invalid");
            },
            drag: function(event, ui) { 
                var x = Math.round((event.pageX - $("#workbench").offset().left) / GRID_SIZE - 3.5);
                var y = Math.round((event.pageY - $("#workbench").offset().top) / GRID_SIZE - 2.5);
                if (circuit.isEmptyRect(x, y, 7, 5)) {
                    $(ui.helper).removeClass("invalid");
                    // HACK: Force webkit browsers to display the class change
                    $(ui.helper).css("display", "none");
                    $(ui.helper).offset();
                    $(ui.helper).css("display", "block");
                } else {
                    $(ui.helper).addClass("invalid");
                    $(ui.helper).css("display", "none");
                    $(ui.helper).offset();
                    $(ui.helper).css("display", "block");
                }
            },
        });
        $(".gate").draggable("option", "cursorAt", {
            left: Math.round($(".gate").width() / 2),
            top: Math.round($(".gate").height() / 2)
        }); 

        $("#workbench").droppable({ 
            accept: ".gate", 
            drop: function(event, ui) {
                circuit.addComponent(new Component({
                    x: Math.round((event.pageX - $("#workbench").offset().left) / GRID_SIZE - 3.5), 
                    y: Math.round((event.pageY - $("#workbench").offset().top) / GRID_SIZE - 2.5),
                    templateId: $(ui.helper).data("templateid")
                }));
           }, 
            over: function(event, ui) {
                    $(ui.helper).removeClass("invalid");
                    $(ui.helper).addClass("valid");
            },
            out: function(event, ui) {
                    $(ui.helper).removeClass("valid");
                    $(ui.helper).addClass("invalid");
            }
        });

        $("#specialButton").click(function() {
            alert("Well obviously I couldn't not... Have a lovely evening <3 :)")
        });
      
        $("#loading-panel").fadeOut(300, function() {
            $("#loading-screen").fadeOut(300);
        });
    });
});