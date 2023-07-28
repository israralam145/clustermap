
var mapOptions;
var map;

var coordinates = []
let new_coordinates = []
let lastElement
var all_overlays = [];

function InitMap() {
    var location = new google.maps.LatLng(28.620585, 77.228609)
    mapOptions = {
        zoom: 12,
        center: location,
        mapTypeId: google.maps.MapTypeId.RoadMap
    }
    
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions)

    var selectedShape;
    var drawingManager = new google.maps.drawing.DrawingManager({
        //drawingMode: google.maps.drawing.OverlayType.MARKER,
        //drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [
                //google.maps.drawing.OverlayType.MARKER,
                //google.maps.drawing.OverlayType.CIRCLE,
                google.maps.drawing.OverlayType.POLYGON,
                //google.maps.drawing.OverlayType.RECTANGLE
            ]
        },
        markerOptions: {
            //icon: 'images/beachflag.png'
        },
        circleOptions: {
            fillColor: '#ffff00',
            fillOpacity: 0.2,
            strokeWeight: 3,
            clickable: false,
            editable: true,
            zIndex: 1
        },
        polygonOptions: {
            clickable: true,
            draggable: false,
            editable: true,
            // fillColor: '#ffff00',
            fillColor: '#ADFF2F',
            fillOpacity: 0.5,

        },
        rectangleOptions: {
            clickable: true,
            draggable: true,
            editable: true,
            fillColor: '#ffff00',
            fillOpacity: 0.5,
        }
    });

    function clearSelection() {
        if (selectedShape) {
            selectedShape.setEditable(false);
            selectedShape = null;
        }
    }
    //to disable drawing tools
    function stopDrawing() {
        drawingManager.setMap(null);
    }

    function setSelection(shape) {
        clearSelection();
        stopDrawing()
        selectedShape = shape;
        shape.setEditable(true);
    }

    function deleteSelectedShape() {
        if (selectedShape) {
            selectedShape.setMap(null);
            drawingManager.setMap(map);
            var index = all_overlays.findIndex(function (overlay) {
                return overlay.overlay === selectedShape;
            });
            if (index !== -1) {
                all_overlays.splice(index, 1);
            }
            coordinates.splice(0, coordinates.length)
            document.getElementById('info').innerHTML = "";
        }
    }
    function calculateDistance() {
        if (all_overlays.length >= 2) {
            var polygon1 = all_overlays[0].overlay;
            var polygon2 = all_overlays[1].overlay;

            var area1 = google.maps.geometry.spherical.computeArea(polygon1.getPath());
            var area2 = google.maps.geometry.spherical.computeArea(polygon2.getPath());
            var areaDistance = Math.abs(area1 - area2);

            var perimeter1 = google.maps.geometry.spherical.computeLength(polygon1.getPath());
            var perimeter2 = google.maps.geometry.spherical.computeLength(polygon2.getPath());
            var perimeterDistance = Math.abs(perimeter1 - perimeter2);

            document.getElementById('labelArea').innerText = "<b>Area Distance:</b> " + areaDistance;
            document.getElementById('labelPerimeter').innerText = "<b>Perimeter Distance:</b> " + perimeterDistance;

        }
    }
    function CenterControl(controlDiv, map) {

        // Set CSS for the control border.
        var controlUI = document.createElement('div');
        controlUI.style.backgroundColor = '#fff';
        controlUI.style.border = '2px solid #fff';
        controlUI.style.borderRadius = '3px';
        controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
        controlUI.style.cursor = 'pointer';
        controlUI.style.marginBottom = '22px';
        controlUI.style.textAlign = 'center';
        controlUI.title = 'Select to delete the shape';
        controlDiv.appendChild(controlUI);

        // Set CSS for the control interior.
        var controlText = document.createElement('div');
        controlText.style.color = 'rgb(25,25,25)';
        controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
        controlText.style.fontSize = '16px';
        controlText.style.lineHeight = '38px';
        controlText.style.paddingLeft = '5px';
        controlText.style.paddingRight = '5px';
        controlText.innerHTML = 'Delete Selected Area';
        controlUI.appendChild(controlText);

        //to delete the polygon
        controlUI.addEventListener('click', function () {
            deleteSelectedShape();
        });
    }

    drawingManager.setMap(map);

    var getPolygonCoords = function (newShape) {
        coordinates.splice(0, coordinates.length);
        new_coordinates.splice(0, new_coordinates.length);

        var len = newShape.getPath().getLength();

        for (var i = 0; i < len; i++) {
            var latLng = newShape.getPath().getAt(i);
            coordinates.push(latLng.toUrlValue(6));
            new_coordinates.push({
                latitude: latLng.lat(),
                longitude: latLng.lng()
            });
        }

        document.getElementById('labelLong').innerHTML = "Longitude: " + new_coordinates.map(coord => coord.longitude).join(", ");
        document.getElementById('labelLat').innerHTML = "Latitude: " + new_coordinates.map(coord => coord.latitude).join(", ");
    }


    google.maps.event.addListener(drawingManager, 'polygoncomplete', function (event) {
        event.getPath().getLength();
        google.maps.event.addListener(event, "dragend", getPolygonCoords(event));

        google.maps.event.addListener(event.getPath(), 'insert_at', function () {
            getPolygonCoords(event)

        });

        google.maps.event.addListener(event.getPath(), 'set_at', function () {
            getPolygonCoords(event)
        })
    })

    google.maps.event.addListener(drawingManager, 'overlaycomplete', function (event) {
        all_overlays.push(event);
        if (event.type !== google.maps.drawing.OverlayType.MARKER) {
            drawingManager.setDrawingMode(null);

            var newShape = event.overlay;
            newShape.type = event.type;
            google.maps.event.addListener(newShape, 'click', function () {
                setSelection(newShape);
            });
            setSelection(newShape);
        }
    })

    var centerControlDiv = document.createElement('div');
    var centerControl = new CenterControl(centerControlDiv, map);


    centerControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(centerControlDiv);
    centerControl=document.getElementById()
}

InitMap()
