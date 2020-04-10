/**
 * local database
 * if you want to generate data (to be deployed), you just have to fetch DB.routes object (be sure data have been generated for concerned routes)
 */

/*TODO
 * - change for loop in forEach
 */


var 

DB = { 
		routes : [],
		stops : [],
		calendars : [],
		calendar_dates: [],
		trips : [],
		shapes: []
},

editingFeature = null;

/**
 * MAIN
 */
function parseGTFSFiles(){
	$("#loader").removeClass("hidden");
	getFile(GTFS_FILES['stops.txt']).then(function(data){
		fetchStops(getGTFSLines(data));
		return getFile(GTFS_FILES['stop_times.txt']);
	}).then(function(data){
		fetchTrips(getGTFSLines(data));
		return getFile(GTFS_FILES['calendar.txt']);
	}).then(function(data){
		fetchCalendar(getGTFSLines(data));
		return getFile(GTFS_FILES['calendar_dates.txt']);
	}).then(function(data){
		fetchCalendarDates(getGTFSLines(data));
		return getFile(GTFS_FILES['routes.txt']);
	}).then(function(data){
		fetchRoutes(getGTFSLines(data));
		return getFile(GTFS_FILES['shapes.txt']);
	}).then(function(data){
		fetchShapes(getGTFSLines(data));
		return getFile(GTFS_FILES['trips.txt']);
	}).then(function(data){
		$("#loader").addClass("hidden");
		$("#filesUploader").removeClass("pushtofront");
		
		$('#export-button').click(function(e){
			alert('coming soon');
		});
		
		displayShapes();
	});
}

/*
 * UTILS
 */
/*
 PARSING FUNCTION
 TODO: refactor the way to define templates...
 */

function displayShapes(){
	var 
	shapes = {};
	
	DB.shapes.forEach(function(shape){
		//["shp_3_1", "44.265293121", "0.70615625381", "1", "0"]
		
		if(!shapes[shape[0]]){
			shapes[shape[0]] = {
				    "type": "LineString",
				    "coordinates": [],
				    "shape_uri": shape[0]
				};
			
			$('<li/>')
				.attr('id', shape[0])
				.text(shape[0])
				.appendTo($("#shapes-list"));
			
		}
		shapes[shape[0]].coordinates.push([parseFloat(shape[2]), parseFloat(shape[1])]);
	});

	shapesGeoJSON = L.geoJSON(Object.values(shapes), {
	    style: {
	        "color": "#ff7800",
	        "weight": 5,
	        "opacity": 0.5
	    },
	    onEachFeature: function(feature, layer){
	    	
	    	//bind click
	        layer.on({
	            click: (function(f){
	            	return function(e){
	            		setEditableFeature(f);
	            		$("#shapes-list").scrollTop( $("#"+f.shape_uri).offset().top);
	            	}
	            })(feature)
	        });

	        $("#"+feature.shape_uri).click((function(f){
	        	return function(e){
	        		setEditableFeature(f);
	        	}
			})(feature));
	    }
	}).addTo(map);
	
	map.on('editable:editing', function(e){
		$('#export-button').addClass("modified");
	});
	
	map.fitBounds(shapesGeoJSON.getBounds());
	
	/*shapes["shp_3_1"]["editableCoordinates"] = shapes["shp_3_1"].coordinates.map(coords => coords.reverse());
	
	var p = L.polyline(shapes["shp_3_1"].coordinates.reverse()).addTo(map);
	p.enableEdit();*/
	
	//map.fitBounds(p.getBounds());
}

function setEditableFeature(f){
	f.coordinates.map(coords => coords.reverse());
	editingFeature ? map.removeLayer(editingFeature) : null;
	editingFeature = L.polyline(f.coordinates).addTo(map);
	editingFeature.enableEdit();
	map.fitBounds(editingFeature.getBounds());
	
	//DOM
	$("#shapes-list").children().removeClass("active");
	$("#"+f.shape_uri).addClass("active");
}

function fetchRoutes(lines){
	var template = null;
	forEachLines(lines, function(current){
		if(!template){
			//routes.txt GTFS fields specifications
			template = {
				'route_id':null,
				'agency_id':null,
				'route_short_name':null,
				'route_long_name':null,
				'route_desc':null,
				'route_type':null,
				'route_url':null,
				'route_color':null,
				'route_text_color':null
			};
			current.forEach(function(elt, i){
				template[elt] = (template.hasOwnProperty(elt) ? i : false);
			});
		}else{
			DB.routes.push(current);
		}
	}, true);
}

function fetchCalendar(lines){
	var template = null;
	forEachLines(lines, function(current){
		if(!template){
			//calendar.txt GTFS fields specifications		
			template = {
				'service_id':null,
				'monday':null,
				'tuesday':null,
				'wednesday':null,
				'thursday':null,
				'friday':null,
				'saturday':null,
				'sunday':null,
				'start_date':null,
				'end_date':null
			};
			current.forEach(function(elt, i){
				template[elt] = (template.hasOwnProperty(elt) ? i : false);
			});
		}else{
			DB.calendars.push(current);
		}
	}, true);
}
	
function fetchStops(lines){
	var template = null;
	forEachLines(lines, function(current){
		if(!template){
			//stops.txt GTFS fields specifications	
			template = {
				'stop_id':null,
				'stop_code':null,
				'stop_name':null,
				'stop_desc':null,
				'stop_lat':null,
				'stop_lon':null,
				'zone_id':null,
				'stop_url':null,
				'location_type':null,
				'parent_station':null,
				'stop_timezone':null,
				'wheelchair_boarding':null
			};
			current.forEach(function(elt, i){
				template[elt] = (template.hasOwnProperty(elt) ? i : false);
			});
		}else{
			DB.stops.push(current);
		}
	},true);
}

function fetchTrips(lines){
	var template = null;
	forEachLines(lines, function(current){
		if(!template){
			//stop_times.txt GTFS fields specifications
			template = {
				'trip_id':null,
				'arrival_time':null,
				'departure_time':null,
				'stop_id':null,
				'stop_sequence':null,
				'stop_headsign':null,
				'pickup_type':null,
				'drop_off_type':null,
				'shape_dist_traveled':null,
				'timepoint':null
			};
			current.forEach(function(elt, i){
				template[elt] = (template.hasOwnProperty(elt) ? i : false);
			});
		}else{
			DB.trips.push(current);
		}
	}, true);
}


function fetchCalendarDates(lines){
	var template = null;
	forEachLines(lines, function(current){
		if(!template){			
			//calendar_dates.txt GTFS fields specifications
			template = {
				'service_id':null,
				'date':null,
				'exception_type':null
			};
			current.forEach(function(elt, i){
				template[elt] = (template.hasOwnProperty(elt) ? i : false);
			});
		}else{
			DB.calendar_dates.push(current);
		}
		
	}, true);
}

function fetchShapes(lines){
	var template = null;
	forEachLines(lines, function(current){
		if(!template){
			
			//shapes.txt GTFS fields specifications
			template = {
				'shape_id':null,
				'shape_pt_lat':null,
				'shape_pt_lon':null,
				'shape_pt_sequence':null,
				'shape_dist_traveled':null,
			};

			current.forEach(function(elt, i){
				template[elt] = (template.hasOwnProperty(elt) ? i : false);
			});
		}else{
			DB.shapes.push(current);
		}
	},true);
}

/*
 * UTILS
 */

function forEachLines(lines, fct, bool){

	var start = bool ? 0 : 1;
	for(var i = start; i < lines.length -1; i++) {
		fct(lines[i].split(','));
	}
}

function getGTFSLines(gtfsData){
	return gtfsData.split(/[\r\n]+/g);
}
