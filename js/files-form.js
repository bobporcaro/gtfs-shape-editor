var 
GTFS_FILES;

if (window.File && window.FileReader && window.FileList && window.Blob) {
 	$('#uploadFile').change(function() {
		GTFS_FILES = $('#uploadFile').prop("files");

		var names = $.map(GTFS_FILES, function(val) { return val.name; });

		//clean
		$("#agency").removeClass();
		$("#routes").removeClass();
		$("#stops").removeClass();
		$("#trips").removeClass();
		$("#stop_times").removeClass();
		$("#calendar").removeClass();
		$("#calendar_dates").removeClass();
		$("#shapes").removeClass();


		//check if required files and shapes
		names.forEach(function(name){
			name === "agency.txt" ? $("#agency").addClass("ok"): $("#agency").addClass("nok");
			name === "routes.txt" ? $("#routes").addClass("ok"): $("#routes").addClass("nok");
			name === "stops.txt" ? $("#stops").addClass("ok"): $("#stops").addClass("nok");
			name === "trips.txt" ? $("#trips").addClass("ok"): $("#trips").addClass("nok");
			name === "stop_times.txt" ? $("#stop_times").addClass("ok"): $("#stop_times").addClass("nok");
			name === "calendar.txt" ? $("#calendar").addClass("ok"): $("#calendar").addClass("nok");
			name === "calendar_dates.txt" ? $("#calendar_dates").addClass("ok"): $("#calendar_dates").addClass("nok");
			name === "shapes.txt" ? $("#shapes").addClass("ok"): $("#shapes").addClass("nok");
		});

		//transform GTFS file object
		for (var key in GTFS_FILES){
			if(GTFS_FILES.hasOwnProperty(key)){
				
				GTFS_FILES[GTFS_FILES[key]['name']] = GTFS_FILES[key];

				delete GTFS_FILES[key];
			}
		}
		//if all required files, run the moulinette
		if(GTFS_FILES['agency.txt'] && GTFS_FILES['routes.txt'] && GTFS_FILES['stops.txt']  && GTFS_FILES['trips.txt']  && GTFS_FILES['stop_times.txt']  && GTFS_FILES['calendar.txt']  && GTFS_FILES['calendar_dates.txt'] && GTFS_FILES['shapes.txt']){
			parseGTFSFiles();
		}
	});
	
} else {
 	alert('The File APIs are not fully supported in this browser.');
}

