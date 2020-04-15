var app = new Vue({
	el: '#app',
	data: {
		map: null,
		GTFS_patterns: GTFS_patterns,
		GTFS:{
			agency:{},
			stops:{},
			routes:{},
			trips:{},
			shapes: {}
		},
		SHAPES_LAYER: null,
		SHAPES_FEATURE: [],
		EDITING_OBJECT: null,
		isLoading: false,
		isModified: false
	},
	mounted: function(){
		this.initMap();
	},
	computed: {
		editingShape: function(){
			return this.EDITING_OBJECT ? this.EDITING_OBJECT.feature.shape_uri : null;
		}
	},
	methods: {
		updateShapes: updateShapes,
		displayShapes: displayShapes,
		setEditingObject: setEditingObject,
		initMap: initMap,
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

								this.isLoading = false;
							}.bind(this));	
						}.bind(this));
					}
				}.bind(this), function(error) {
					// onerror callback
					console.log(error);
				});
			}.bind(this));
		},
	}
});