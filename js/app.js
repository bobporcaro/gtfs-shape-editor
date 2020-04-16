var app = new Vue({
	el: '#app',
	data: {
		map: null,
		GTFS_patterns: GTFS_patterns,
		GTFS:{
			agency:null,
			stops:null,
			routes:null,
			trips:null,
			shapes: null,
			stop_times:null
		},
		shapesByRoute: {},
		SHAPES_LAYER: null,
		SHAPES_FEATURE: [],
		EDITING_OBJECT: null,
		isLoading: false,
		isModified: false,
		isLoaded : false
	},
	mounted: function(){
		this.initMap();
	},
	computed: {
		editingShape: function(){
			return this.EDITING_OBJECT ? this.EDITING_OBJECT.feature.shape_id : null;
		}
	},
	watch: {
	},
	methods: {
		HTMLcolor: function(route_id){
			return {
				"background-color": this.routeColor(route_id),
				"color": "#"+(this.GTFS.routes[route_id].route_text_color ? this.GTFS.routes[route_id].route_text_color : "black")
			}
		},
		routeColor: function(route_id){
			return "#"+(this.GTFS.routes[route_id].route_color ? this.GTFS.routes[route_id].route_color : "white");
		},
		shapeColor: function(shape_id){
			for(var route_id in this.shapesByRoute){
				if(this.shapesByRoute.hasOwnProperty(route_id)){
					var index = this.shapesByRoute[route_id].indexOf(shape_id);
					if(index === -1){
						return "#"+(this.GTFS.routes[route_id].route_color ? this.GTFS.routes[route_id].route_color : "white");
					}
				}
			}
		},
		buildGeoJson: buildGeoJson,
		updateShapes: updateShapes,
		displayShapes: displayShapes,
		setEditingObject: setEditingObject,
		initMap: initMap,
		findFeatureIndex: findFeatureIndex,
		getGTFSLines: function(gtfsData){
			return gtfsData.split(/[\r\n]+/g);
		},
		getGTFSPropertyId: GTFS_patterns.getGTFSPropertyId,
		fetchGTFSData: function(filename, data){
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
							this.GTFS[gtfs_property][entry[id]] = entry;
						}
					}
				}.bind(this));
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
								if(this.GTFS.routes && this.GTFS.stops && this.GTFS.trips && this.GTFS.shapes){
									for(var trip_id in this.GTFS.trips){
										if(this.GTFS.trips.hasOwnProperty(trip_id)){
											var 
											route_id = this.GTFS.trips[trip_id].route_id,
											shape_id = this.GTFS.trips[trip_id].shape_id;
											
											if(!this.shapesByRoute[route_id]){
												this.shapesByRoute[route_id] = [];
											}
											
											var index = this.shapesByRoute[route_id].indexOf(shape_id);
											if(index === -1){
												this.shapesByRoute[route_id].push(shape_id);
											}
										}
									}
									this.displayShapes();
									this.isLoading = false;	
									this.isLoaded = true;
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
		exportGTFSZip: function(){
			// use a BlobWriter to store the zip into a Blob object
			zip.createWriter(new zip.BlobWriter(), function(writer) {
			
			  // use a TextReader to read the String to add
			  writer.add("filename.txt", new zip.TextReader("test!"), function() {
			    // onsuccess callback

			    // close the zip writer
			    writer.close(function(blob) {
			      // blob contains the zip file as a Blob object

			    });
			  }, function(currentIndex, totalIndex) {
			    // onprogress callback
			  });
			}, function(error) {
			  // onerror callback
			});
		}
	}
});