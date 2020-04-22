function updateShapes(shapes, route_id){
	//TODO test if scope is not already displayed, for new we always reset map
	this.SHAPES_FEATURE = [];
	for(var shape_id in this.GTFS.shapes){
		if(this.GTFS.shapes.hasOwnProperty(shape_id) && (shapes ? shapes.indexOf(shape_id) > -1 : true)){ 
			var t = this.buildGeoJsonShape(shape_id, route_id);
			this.GTFS.shapes[shape_id].forEach(function(shape_entry){
				t.coordinates.push([parseFloat(shape_entry['shape_pt_lon']), parseFloat(shape_entry['shape_pt_lat'])]);
			});
			this.SHAPES_FEATURE.push(t);
		}
	}
	this.displayShapes();
}
function updateStops(shape_id){
	this.STOPS_LAYER ? this.map.removeLayer(this.STOPS_LAYER):null;
	this.STOPS_FEATURE = [];
	
	if(shape_id){
		this.stopsByShape[shape_id].forEach(function(stop_id){
			var 
			stop = this.GTFS.stops[stop_id],
			station = stop.parent_station ? this.GTFS.stops[stop.parent_station] : null;
			
			if(station){
				var station = this.GTFS.stops[stop.parent_station]
				this.STOPS_FEATURE.push(this.buildGeoJsonStop(station, true));
			}
			this.STOPS_FEATURE.push(this.buildGeoJsonStop(stop, false));
		}.bind(this));
	}
	if(this.STOPS_FEATURE.length > 0){
		this.STOPS_LAYER = L.geoJSON(this.STOPS_FEATURE,{ onEachFeature: function(feature, layer) {
			
			var greenIcon = L.icon({
			    iconUrl: feature.station ? 'Location-Marker-50.png' : 'Maps-50.png',
			    iconAnchor:   [25, 50], // point of the icon which will correspond to marker's location
			    popupAnchor:  [0, -50] // point from which the popup should open relative to the iconAnchor
			});
			layer.bindPopup((feature.station ? "Station: ":"")+this.GTFS.stops[feature.stop_id].stop_name + " - " + this.GTFS.stops[feature.stop_id].stop_id);
			layer.options.icon = greenIcon;
		}.bind(this)});
		this.STOPS_LAYER.addTo(this.map);
	}
}
//FIXME pass color here ? 
function buildGeoJsonShape(shape_id, route_id){
	return {
		 "type": "LineString",
		 "coordinates": [],
		 "style":{
				"color": route_id ? this.routeColor(route_id) : "#636e72", //flat grey when route is not selected
				"weight": 5,
				"opacity": 0.6
			},
		 "shape_id" : shape_id
	};
}

function buildGeoJsonStop(stop, isStation){
	return {
		"type": "Point",
		"coordinates": [stop.stop_lon, stop.stop_lat],
		"station": isStation,
		"stop_id": stop.stop_id
	}
}

function displayShapes(){
	this.SHAPES_LAYER ? this.map.removeLayer(this.SHAPES_LAYER):null;
	this.SHAPES_LAYER = L.geoJSON(this.SHAPES_FEATURE,{style: function(feature) {
        	return {
        		color: feature.geometry.style.color,
        		weight: feature.geometry.style.weight,
        		opacity: feature.geometry.style.opacity
        	}
		},
		onEachFeature: function(feature, layer){
			//bind click
			  layer.on({
				click: (function(shape_id){
					return function(e){
						this.setEditingObject(shape_id, null);
					}.bind(this)
				}.bind(this))(feature.shape_id)
			  });
		 }.bind(this)
	});
	this.SHAPES_LAYER.addTo(this.map);
	this.map.fitBounds(this.SHAPES_LAYER.getBounds());
}
function findFeatureIndex(shape_id){
	return this.SHAPES_FEATURE.findIndex(function(f){
		return f.shape_id === shape_id
	}.bind(this));
}

function routeColor(route_id){
	return "#"+(this.GTFS.routes[route_id].route_color ? this.GTFS.routes[route_id].route_color : "white");
}
function shapeColor(shape_id){
	for(var route_id in this.shapesByRoute){
		if(this.shapesByRoute.hasOwnProperty(route_id)){
			var index = this.shapesByRoute[route_id].indexOf(shape_id);
			if(index === -1){
				return "#"+(this.GTFS.routes[route_id].route_color ? this.GTFS.routes[route_id].route_color : "white");
			}
		}
	}
}

function setEditingObject(shape_id, route_id){
	//save modifs
	if(this.EDITING_OBJECT){
		this.GTFS.shapes[this.EDITING_OBJECT.feature.shape_id] = this.EDITING_OBJECT.layer.getLatLngs().map(function(latLng, i){
			return {
				"shape_id": this.EDITING_OBJECT.feature.shape_id,
				"shape_pt_lat":latLng.lat,//FIXME create String ? 
				"shape_pt_lon":latLng.lng,//FIXME create String ? 
				"shape_pt_sequence":i, //FIXME create String ?,
				"shape_dist_traveled":null
			};
		}.bind(this));
		this.map.removeLayer(this.EDITING_OBJECT.layer);
	}
		
	this.updateShapes(route_id ? this.shapesByRoute[route_id]:null, route_id);
	this.updateStops(shape_id);
	
	//check if shape to edit
	if(shape_id){
		const index = this.findFeatureIndex(shape_id);
		//update editing object FIXME when there is only one modfication... we retrun inverted shape (modified one)
		this.EDITING_OBJECT = {
			layer: L.polyline(this.SHAPES_FEATURE[index].coordinates.map(function(coords){
				return [coords[1], coords[0]];
			})).addTo(this.map),
			feature: this.SHAPES_FEATURE[index]
		};
		this.EDITING_OBJECT.layer.enableEdit();
		this.map.fitBounds(this.EDITING_OBJECT.layer.getBounds());
	}
}
function initMap(){
	this.map = L.map('map', {editable: true}).setView([51.505, -0.09], 13);
	L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'}).addTo(this.map); 
}