define([
    "jquery",
    "jquery-ui",
    "foundation",
    "fabric",
    "canvas/models/component",
    "canvas/views/componentview",
    "application",
    "thumbnails"
], 
function($, ui, Foundation, fabric, Component, ComponentView, ApplicationState, createThumbnail) {
    $(function() {
        var GRID_SIZE = 16;
        
        // Zurb Foundation
        $(document).foundation();


        // Calculate full width and height canvas size
        var gridWidth = $("#workbench").parent().innerWidth();
        var gridHeight = $(window).height() - $(".top-bar").height();
        gridWidth = Math.floor(gridWidth / GRID_SIZE);
        gridHeight = Math.floor(gridHeight / GRID_SIZE);
        var pixelWidth = gridWidth * GRID_SIZE;
        var pixelHeight = gridHeight * GRID_SIZE;

        // Size the canvas
        $("#workbench").attr("width", pixelWidth);
        $("#workbench").attr("height", pixelHeight);

        // Create image files for each gate in the sidebar
        $(".gate").each(function() {
            var templateId = $(this).data("templateid");
            var inputCount = $(this).data("inputcount");
            var outputCount = $(this).data("outputcount");
            createThumbnail(templateId, inputCount, outputCount, GRID_SIZE, this);
        });

        // Create the GatePlay web application object
        var application = new ApplicationState(gridWidth, gridHeight, GRID_SIZE);

        // Run button handler
        $("#run").click(function() {
            application.runButtonPressed();
        });

        // Save button handler
        $("#save").click(function() {
        });
        
        // Download button handler
        $("#download-image").click(function() {
            var image = application.getCanvas().toDataURL();
            var a = document.getElementById('download-image');
            a.href=image;
            a.download = "circuit.png";
        });

        // Simulation speed slider
        $("#slider").slider({
            min: -4,
            max: 4,
            step: 1,
            value: 0
        });
        $("#slider").on("slidechange", function(e, ui) {
            application.changeSimulationSpeed(Math.pow(1.5, ui.value) * 200);
        });
        application.changeSimulationSpeed(200);
        
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
                if (application.getCanvasModel().isEmptyRect(x, y, 7, 5)) {
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
                application.addComponent(
                    Math.round((event.pageX - $("#workbench").offset().left) / GRID_SIZE - 3.5), 
                    Math.round((event.pageY - $("#workbench").offset().top) / GRID_SIZE - 2.5),
                    7,
                    $(ui.helper).data("inputcount"),
                    $(ui.helper).data("outputcount"),
                    $(ui.helper).data("templateid")
                );
            }
        });
      
        // Remove loading panel
        $("#loading-panel").fadeOut(300, function() {
            $("#loading-screen").fadeOut(300);
        });
    });
});