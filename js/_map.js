function displayShapes(){
	for(var shape_uri in this.GTFS.shapes){
		if(this.GTFS.shapes.hasOwnProperty(shape_uri)){
			var 
			t = {
				 "type": "LineString",
				 "coordinates": [],
				 "shape_uri" : shape_uri
			};
			this.GTFS.shapes[shape_uri].forEach(function(shape_entry){
				t.coordinates.push([parseFloat(shape_entry['shape_pt_lon']), parseFloat(shape_entry['shape_pt_lat'])]);
			});
			this.SHAPES_FEATURE.push(t);
		}
	}
	this.updateShapes();
	this.map.on('editable:editing', function(e){
		this.isModified = true;
	}.bind(this));
}

function updateShapes(){
	this.SHAPES_LAYER ? this.map.removeLayer(this.SHAPES_LAYER):true;
	this.SHAPES_LAYER = L.geoJSON(this.SHAPES_FEATURE, {style: {"color": "#ff7800","weight": 5,"opacity": 0.5},
		onEachFeature: function(feature, layer){
			//bind click
			  layer.on({
				click: (function(f, l){
					return function(e){
						this.setEditingObject(f, l);
					}.bind(this)
				}.bind(this))(feature, layer)
			  });
		 }.bind(this)
	});
	this.SHAPES_LAYER.addTo(this.map);
	this.map.fitBounds(this.SHAPES_LAYER.getBounds());
}

function setEditingObject(f, l){
	if(this.EDITING_OBJECT){
		if(this.isModified){
			//create new feature based on modified layer
			var newFeature ={
				"type": "LineString",
				"coordinates": this.EDITING_OBJECT.layer.getLatLngs().map(function(latLng){
					return [latLng.lng, latLng.lat];
				}),
				"shape_uri": this.EDITING_OBJECT.feature.shape_uri
			};
			//update feature object
			const index = this.SHAPES_FEATURE.findIndex(function(f){
				return f.shape_uri === this.EDITING_OBJECT.feature.shape_uri
			}.bind(this));
			
			if (index > -1) {
				this.SHAPES_FEATURE.splice(index, 1);
			}
			//create layer for updated feature
			this.SHAPES_LAYER.addData(newFeature);
			this.isModified = false;;
		}
		this.map.removeLayer(this.EDITING_OBJECT.layer);
	}
	//update editing object
	this.EDITING_OBJECT = {
		layer: L.polyline(f.coordinates.map(function(coords){
			return [coords[1], coords[0]];
		})).addTo(this.map),
		feature: f
	};
	this.EDITING_OBJECT.layer.enableEdit();
	this.map.fitBounds(this.EDITING_OBJECT.layer.getBounds());
}
function initMap(){
	this.map = L.map('map', {editable: true}).setView([51.505, -0.09], 13);
	L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>', maxZoom: 15}).addTo(this.map); 
}