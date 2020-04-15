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
	},
	"shapes.txt": {
		'shape_id':null,
		'shape_pt_lat':null,
		'shape_pt_lon':null,
		'shape_pt_sequence':null,
		'shape_dist_traveled':null,
	},
	
	getGTFSPropertyId: function(fileName){
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
		
		console.log(fileName + " is an optional file for shape editing...");
	}
}