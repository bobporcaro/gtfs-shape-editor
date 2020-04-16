function displayShapes(shapes, route_id){
	//TODO test if scope is not already displayed, for new we always reset map
	this.SHAPES_FEATURE = [];
	for(var shape_id in this.GTFS.shapes){
		if(this.GTFS.shapes.hasOwnProperty(shape_id) && (shapes ? shapes.indexOf(shape_id) > -1 : true)){
			var t = this.buildGeoJson(shape_id, route_id);
			this.GTFS.shapes[shape_id].forEach(function(shape_entry){
				t.coordinates.push([parseFloat(shape_entry['shape_pt_lon']), parseFloat(shape_entry['shape_pt_lat'])]);
			});
			this.SHAPES_FEATURE.push(t);
		}
	}
	this.updateShapes();
}
//FIXME pass color here ? 
function buildGeoJson(shape_id, route_id){
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
function updateShapes(){
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
function setEditingObject(shape_id, route_id){
	//save modifs
	if(this.EDITING_OBJECT && this.isModified){
		this.GTFS.shapes[this.EDITING_OBJECT.feature.shape_id] = this.EDITING_OBJECT.layer.getLatLngs().map(function(latLng, i){
			return {
				"shape_id": this.EDITING_OBJECT.feature.shape_id,
				"shape_pt_lon":latLng.lng,//FIXME create String ? 
				"shape_pt_lat":latLng.lat,//FIXME create String ? 
				"shape_pt_sequence": i //FIXME create String ? 
			};
		}.bind(this));
	}
	//remove to update
	this.EDITING_OBJECT && this.EDITING_OBJECT.layer ? this.map.removeLayer(this.EDITING_OBJECT.layer):null;
	//display route scope
	if(route_id){
		this.displayShapes(this.shapesByRoute[route_id], route_id);
	}else{
		//no route is all route
		this.displayShapes();
	}
	//check if shape to edit
	if(shape_id){
		const index = this.findFeatureIndex(shape_id);
		//update editing object
		this.EDITING_OBJECT = {
			layer: L.polyline(this.SHAPES_FEATURE[index].coordinates.map(function(coords){
				return [coords[1], coords[0]];
			})).addTo(this.map),
			feature: this.SHAPES_FEATURE[index]
		};
		this.EDITING_OBJECT.layer.enableEdit();
		this.map.fitBounds(this.EDITING_OBJECT.layer.getBounds());
	}else{
		//nothing to edit
		this.EDITING_OBJECT = null;
	}
}
function initMap(){
	this.map = L.map('map', {editable: true}).setView([51.505, -0.09], 13);
	L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'}).addTo(this.map); 
	
	this.map.on('editable:editing', function(e){
		this.isModified = true;
	}.bind(this));
}