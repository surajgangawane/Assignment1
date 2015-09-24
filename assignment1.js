var express = require('express');
var app = express();
var async = require('async');
var fs = require('fs');

var content = JSON.parse(fs.readFileSync('climate.json'));



app.get('/country', function(req, res){
	var details = {};
	var countryname = req.query.countryname;
	async.waterfall([
		function(callback){
			for(var i =0; i < content.climate.length ; i++){
				if(countryname == content.climate[i].countryname){
					callback(null, content.climate[i].longitude, content.climate[i].latitude);
				}
			}
		},
		function(longt, lat, callback){
			for(var j =0; j < content.climate.length ; j++){
				if(longt == content.climate[j].longitude && lat == content.climate[j].latitude){
					details[countryname] = {
						"longitude" : longt,
						"latitude" : lat
					}
					callback(null, content.climate[j].temperature);
				}
			}
		},
		function(temperature, callback){
			var temp = temperature*33.8;
			var tempo = temp+"F";
			details[countryname]["temperature"] = tempo;
			callback(null, details);
		},
		function(details, callback){
			fs.writeFileSync('destination.json', JSON.stringify(details));
			callback(null, details);
		}
	], function(err, result){
		res.send(details);
	});
});

app.listen(3000);



