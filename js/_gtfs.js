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
		'route_text_color':null,
		"agency_id": null
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

function getGTFSLines(gtfsData){
	return gtfsData.split(/[\r\n]+/g);
}

function forEachLines(lines, fct){
	for(var i = 0 ; i < lines.length -1; i++) {
		fct(lines[i].split(','));
	}
}
function buildLine(lineObject, isFirst){
	var 
	fileContent = "",
	j = 0;
	
	for(var i in lineObject){
		if(lineObject.hasOwnProperty(i)){ //FIXME use pattern order to build line
			fileContent += j > 0 ? "," : "";
			fileContent += isFirst ? i :(lineObject[i] === (undefined || null) ? "" : lineObject[i]) ;
			j++;
		}
	}
	return fileContent += "\n";;
}

function fetchGTFSData(filename, data, callback){
	var 
	pattern = this.GTFS_patterns[filename],
	gtfs_property = filename.slice(0,filename.indexOf(".")),
	id = this.getGTFSPropertyId(filename);
	
	if(pattern){
		var 
		template = null;
		
		this.forEachLines(data, function(line){
			if(!template){
				template = pattern; 
				line.forEach(function(elt, i){
					template[elt] = (template.hasOwnProperty(elt) ? i : false);
				});
				this.GTFS[gtfs_property] = {};
				
			}else{
				var entry = {};
				for(var key in template){
					if(template.hasOwnProperty(key)){
						entry[key] = line[template[key]];
					}
				}
				if(this.GTFS[gtfs_property][entry[id]]){
					if(!Array.isArray(this.GTFS[gtfs_property][entry[id]])){
						//array if several datas for same entries (shapes...)
						this.GTFS[gtfs_property][entry[id]] = [this.GTFS[gtfs_property][entry[id]]];
					}
					this.GTFS[gtfs_property][entry[id]].push(entry);
				}else{
					//use set to make property reactive
					this.$set(this.GTFS[gtfs_property], entry[id], entry);
				}
			}
		}.bind(this));
	}
}
function forceNearests(GTFSObject){
	for(var trip_id in GTFSObject.trips){
		if(GTFSObject.trips.hasOwnProperty(trip_id)){
			var 
			stop_times = GTFSObject.stop_times[trip_id],
			shape = GTFSObject.shapes[GTFSObject.trips[trip_id].shape_id];
			
			stop_times.forEach(function(stop_time, i){
				var 
				stop = GTFSObject.stops[stop_time.stop_id],
				nearest_point = {
						shape_pt_lat: 0.0,
						shape_pt_lon: 0.0
				},
				dist,
				shape_cursor =0;
				
				//set first
				if(i === 0){
					nearest_point = shape[0];
				}else 
				//set terminus
				if( i === stop_times.length - 1){
					nearest_point = shape[shape.length-1];
				}else{
						
					for(var i = shape_cursor ; i < shape.length ; i++){
						var 
						currentDist = getDistanceFromLatLonInM({'lat':parseFloat(stop.stop_lat), 'lon':parseFloat(stop.stop_lon)}, {'lat':parseFloat(shape[i].shape_pt_lat), 'lon':parseFloat(shape[i].shape_pt_lon)}),
						nearestDist = getDistanceFromLatLonInM({'lat':parseFloat(stop.stop_lat), 'lon':parseFloat(stop.stop_lon)}, {'lat':parseFloat(nearest_point.shape_pt_lat), 'lon':parseFloat(nearest_point.shape_pt_lon)});
						
						if(currentDist < nearestDist){
							nearest_point = shape[i];
							dist = currentDist;
						}
						shape_cursor = i;
					}
				}
				if(dist > 9 || i === 0 ||i === stop_times.length - 1){
					console.log("force point to be near")
					console.log(stop.stop_name + " -  " + stop.stop_id);
					console.log(nearest_point);
					nearest_point.shape_pt_lat = stop.stop_lat;
					nearest_point.shape_pt_lon = stop.stop_lon;
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
	  Math.sin(dLon/2) * Math.sin(dLon/2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c; // Distance in meters
	return d;
}

function deg2rad(deg) {
	return deg * (Math.PI/180)
}
