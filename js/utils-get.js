function get(url){
	return new Promise(function(resolve, reject){
		
		var req = new XMLHttpRequest();
		req.open('GET',url,true);
		req.setRequestHeader("Accept","application/json");
		req.onload = function(){
			if(req.status == 200){
				resolve(req.response);
			}else{
				reject(req.statusText);
			}
		}
		
		req.send();
	});
}


function getFile(ref){
	return new Promise(function(resolve, reject){

		var reader = new FileReader();
		
		reader.onload = function(){
			resolve(reader.result);
		}
		
		reader.readAsText(ref);
	});
}


function isEmptyString(string){
	return string ? true:false;
}