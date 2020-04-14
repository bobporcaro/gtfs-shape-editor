var app = new Vue({
	el: '#app',
	data: {
		map: null,
		GTFS_patterns: GTFS_patterns,
		GTFS_DATA: {},
		editingFeature: null,
		isLoading: false
	},
	
	mounted: function(){
		this.initMap();
	},
	methods: {
		drop: function(e){
			console.log(e);
		},
		getGTFSLines: function(gtfsData){
			return gtfsData.split(/[\r\n]+/g);
		},
		
		fetchGTFSData: function(file_title, data, callback){
			var pattern = this.GTFS_patterns[file_title];
			if(!pattern){
				//console.log("non required file");
			}else{
				var 
				template = null,
				line =[];
				
				this.forEachLines(data, function(line){
					if(!template){
						//routes.txt GTFS fields specifications
						template = pattern; 
						line.forEach(function(elt, i){
							template[elt] = (template.hasOwnProperty(elt) ? i : false);
						});
						this.GTFS_DATA[file_title] = [];
					}else{
						//DB.routes.push(current);
						this.GTFS_DATA[file_title].push(line);
					}
				}.bind(this));
				callback ? callback(): false;
			}
		},
		forEachLines: function (lines, fct){
			for(var i = 0 ; i < lines.length -1; i++) {
				fct(lines[i].split(','));
			}
		},
		uploadFiles: function(e){
			let droppedFiles = e.dataTransfer.files;
			if(!droppedFiles) return;
			
			zip.workerScriptsPath = './js/zip/';
			
			// use a BlobReader to read the zip from a Blob object
			zip.createReader(new zip.BlobReader(e.dataTransfer.files[0]), function(reader) {
				// get all entries from the zip
				this.isLoading = true;
				reader.getEntries(function(entries) {
					if (entries.length) {
						entries.forEach(function(entry, i){
							entry.getData(new zip.TextWriter(), function(text) {	
								// text contains the entry data as a String
								this.fetchGTFSData(entry.filename, this.getGTFSLines(text));
								if(this.GTFS_DATA["shapes.txt"]){
									this.displayShapes();
									this.isLoading = false;
								}
								
							}.bind(this));	
						}.bind(this));
					}
				}.bind(this), function(error) {
					// onerror callback
					console.log(error);
				});
			}.bind(this));
			
			
		},
		displayShapes: function (){
			var 
			shapes = {};
			
			this.GTFS_DATA["shapes.txt"].forEach(function(shape){
				//["shp_3_1", "44.265293121", "0.70615625381", "1", "0"]
				
				if(!shapes[shape[0]]){
					shapes[shape[0]] = {
						    "type": "LineString",
						    "coordinates": [],
						    "shape_uri": shape[0]
					};
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
			            		f.coordinates.map(coords => coords.reverse());
			            		this.setEditableFeature(f);
			            	}.bind(this)
			            }.bind(this))(feature)
			        });
			    }.bind(this)
			}).addTo(this.map);
			
			this.map.on('editable:editing', function(e){
			});
			
			this.map.fitBounds(shapesGeoJSON.getBounds());
		},
		setEditableFeature: function (f){
			this.editingFeature ? this.map.removeLayer(this.editingFeature) : null;
			this.editingFeature = L.polyline(f.coordinates).addTo(this.map);
			this.editingFeature.enableEdit();
			this.map.fitBounds(this.editingFeature.getBounds());
		},
		initMap: function(){
			  this.map = L.map('map', {editable: true}).setView([51.505, -0.09], 13);;
			  L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
						attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>', maxZoom: 15}).addTo(this.map); 
			  
		}
	}
});