var GTFS_patterns ={
	"agency.txt": {
		"agency_id": null,
		"agency_name": null,
		"agency_url": null,
		"agency_timezone": null
	},
	"routes.txt":{
		'route_id':null,
		'route_short_name':null,
		'route_long_name':null,
		'route_desc':null,
		'route_type':null,
		'route_url':null,
		'route_color':null,
		'route_text_color':null
	},
	"stops.txt": {
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
	},
	"trips.txt": {
		'route_id':null,
		'service_id':null,
		'trip_id':null,
		'trip_headsign':null,
		'trip_short_name':null,
		'direction_id':null,
		'block_id':null,
		'shape_id':null,
		'wheelchair_accessible':null,
		'bikes_allowed':null
	},
	"shapes.txt": {
		'shape_id':null,
		'shape_pt_lat':null,
		'shape_pt_lon':null,
		'shape_pt_sequence':null,
		'shape_dist_traveled':null,
	},
	"stop_times.txt": {
		'trip_id': null,
		'arrival_time': null,
		'departure_time': null,
		'stop_id': null,
		'stop_sequence': null
	},
	"calendar.txt":{
		'service_id': null,
		'monday': null,
		'tuesday': null,
		'wednesday': null,
		'thursday': null,
		'friday': null,
		'saturday': null,
		'sunday': null,
		'start_date': null,
		'end_date': null
	},
	"calendar_dates.txt":{
		'service_id': null,
		'date': null,
		'exception_type': null
	},
	getGTFSPropertyId: function(fileName){
		if(fileName === "calendar.txt"){
			return 'service_id';
		}
		if(fileName === "calendar_dates.txt"){
			return 'service_id';
		}
		if(fileName === "shapes.txt"){
			return 'shape_id';
		}
		if(fileName === "trips.txt"){
			return 'trip_id';
		}
		if(fileName === "stops.txt"){
			return 'stop_id';
		}
		if(fileName === "routes.txt"){
			return 'route_id';
		}
		if(fileName === "agency.txt"){
			return 'agency_id';
		}
		if(fileName === "stop_times.txt"){
			return 'trip_id';
		}
		console.log(fileName + " --> don't know this file :) "); //TODO do it ! 
	}
}
function buildGTFS(GTFSObject){
	var filesContent = {};
	//Convert into GTFS
	for(var property in GTFSObject){
		if(GTFSObject.hasOwnProperty(property)){
			var fileContent = "";
			for(var id in GTFSObject[property]){ 
				if(GTFSObject[property].hasOwnProperty(id)){
					if(Array.isArray(GTFSObject[property][id])){
						GTFSObject[property][id].forEach(function(elt){
							//fileContent += buildLine(elt, (fileContent.length === 0));
							
							if(fileContent.length === 0){
								fileContent +=buildLine(elt, (fileContent.length === 0));
							}
							fileContent +=buildLine(elt, (fileContent.length === 0));
						});
					}else{
						
						
						if(fileContent.length === 0){
							fileContent +=buildLine(GTFSObject[property][id], (fileContent.length === 0));
						}
						fileContent +=buildLine(GTFSObject[property][id], (fileContent.length === 0));
					}
				}
			}
			filesContent[property]= fileContent;
		}
	}
	return filesContent;
}
function buildLine(lineObject, isFirst){
	var 
	fileContent = "",
	j = 0;
	
	for(var i in lineObject){
		if(lineObject.hasOwnProperty(i)){
			fileContent += j > 0 ? "," : "";
			fileContent += isFirst ? i :(lineObject[i] === undefined ? "" : lineObject[i]) ;
			j++;
		}
	}
	return fileContent += "\n";;
}


//TODO add functions to parse GTFS here (create an object ? )



function detectNearests(GTFSObject){
	for(var trip_id in GTFSObject.trips){
		if(GTFSObject.trips.hasOwnProperty(trip_id)){
			console.log("trip: " + trip_id);
			GTFSObject.stop_times[trip_id].forEach(function(stop_time){
				console.log("---stop: " +stop_time.stop_id);
				var 
				stop = GTFSObject.stops[stop_time.stop_id],
				nearest_point = {
						shape_pt_lat: 0.0,
						shape_pt_lon: 0.0
				},
				dist;
				
				GTFSObject.shapes[GTFSObject.trips[trip_id].shape_id].forEach(function(point){
					var 
					currentDist = getDistanceFromLatLonInM({'lat':parseFloat(stop.stop_lat), 'lon':parseFloat(stop.stop_lon)}, {'lat':parseFloat(point.shape_pt_lat), 'lon':parseFloat(point.shape_pt_lon)}),
					nearestDist = getDistanceFromLatLonInM({'lat':parseFloat(stop.stop_lat), 'lon':parseFloat(stop.stop_lon)}, {'lat':parseFloat(nearest_point.shape_pt_lat), 'lon':parseFloat(nearest_point.shape_pt_lon)});
					
					if(currentDist < nearestDist){
						nearest_point = point
						dist = currentDist;
						
						
					}
				});
				
				console.log("----------shape nearest point: ");
				console.log(nearest_point)
				if(dist > 20){
					console.log("----------" + dist + "m is not zenbus compliant");
				}
			});
			
		}
	}
}

function getDistanceFromLatLonInM(latlon1,latlon2) {
	  var R = 6371000; // Radius of the earth in m
	  var dLat = deg2rad(latlon2.lat-latlon1.lat);  // deg2rad below
	  var dLon = deg2rad(latlon2.lon-latlon1.lon); 
	  var a = 
	    Math.sin(dLat/2) * Math.sin(dLat/2) +
	    Math.cos(deg2rad(latlon1.lat)) * Math.cos(deg2rad(latlon2.lat)) * 
	    Math.sin(dLon/2) * Math.sin(dLon/2)
	    ; 
	  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	  var d = R * c; // Distance in meters
	  return d;
	}

	function deg2rad(deg) {
	  return deg * (Math.PI/180)
	}

