
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
		//TODO create an object to use relations
		shapesByRoute: {},
		stopsByShape: {},
		
		//map
		SHAPES_LAYER: null,
		SHAPES_FEATURE: [],
		STOPS_LAYER: null,
		STOPS_FEATURE: [],
		EDITING_OBJECT: null,
		
		//states
		isLoading: false,
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
		'GTFS.shapes': {
			deep: true,
			 handler: function (val, oldVal) { 
			 }
		}
	},
	methods: {
		forceGTFS: function(){
			this.isLoading = true;
			
			setTimeout(function(){
				forceNearests(this.GTFS);
				this.updateShapes();
				this.updateStops();
				this.isLoading = false;
				this.isModified = true;	
			}.bind(this), 1);
		},
		HTMLcolor: function(route_id){
			return {
				"background-color": this.routeColor(route_id),
				"color": "#"+(this.GTFS.routes[route_id].route_text_color ? this.GTFS.routes[route_id].route_text_color : "black")
			}
		},
		buildGTFS: buildGTFS,
		routeColor: routeColor,
		shapeColor: shapeColor,
		updateShapes: updateShapes,
		displayShapes: displayShapes,
		buildGeoJsonStop: buildGeoJsonStop,
		buildGeoJsonShape:buildGeoJsonShape,
		updateStops: updateStops,
		setEditingObject: setEditingObject,
		initMap: initMap,
		findFeatureIndex: findFeatureIndex,
		getGTFSLines: getGTFSLines,
		getGTFSPropertyId: GTFS_patterns.getGTFSPropertyId,
		fetchGTFSData: fetchGTFSData,
		forEachLines: forEachLines,
		imporGTFSZip: function(e){
			let droppedFiles = e.dataTransfer.files;
			if(!droppedFiles) return;
			zip.workerScriptsPath = './js/libs/zip/';
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
								if(this.GTFS.routes && this.GTFS.stops && this.GTFS.trips && this.GTFS.shapes && this.GTFS.stop_times){
									for(var trip_id in this.GTFS.trips){
										if(this.GTFS.trips.hasOwnProperty(trip_id)){
											var trip = this.GTFS.trips[trip_id],
											route_id = trip.route_id,
											shape_id = trip.shape_id;
											
											if(!this.shapesByRoute[route_id]){
												this.shapesByRoute[route_id] = [];
											}
											var index = this.shapesByRoute[route_id].indexOf(shape_id);
											if(index === -1){
												this.shapesByRoute[route_id].push(shape_id);
											}
											if(this.GTFS.stop_times[trip_id]){
												if(!this.stopsByShape[shape_id]){
													this.stopsByShape[shape_id] = [];
												}
												
												this.GTFS.stop_times[trip_id].forEach(function(stop_time){
													var index = this.stopsByShape[shape_id].indexOf(stop_time.stop_id);
													if(index === -1){
														this.stopsByShape[shape_id].push(stop_time.stop_id);
													}
												}.bind(this));
											}
										}
									}
									this.updateShapes();
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
			var 
			zip_ = new JSZip(),
			builtGTFS = this.buildGTFS(this.GTFS);
			
			for(var property in builtGTFS){
				if(builtGTFS.hasOwnProperty(property)){
					zip_.file(property+".txt", builtGTFS[property]);
				}
			}
			// Generate the zip file asynchronously
			zip_.generateAsync({type:"blob"})
			.then(function(content) {
			    // Force down of the Zip file
			    saveAs(content, "gtfs.zip");
			});
		}
	}
});