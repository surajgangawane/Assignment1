//Problem Statement : 

// a)Retrieving City from JSON file.
// b)Retrieving Latitude,Longitude using  API in Json Format.
// c)Passing these Latitude and Longitude to another API to get Temperature.
// d)According to Temperature calculated Fahrenheit.
// e)Put all these value in object and Stringify() to convert in JSON format.
// f)Finally write these values in JSON file.


var express = require('express');
var app = express();
var async = require('async');
var fs = require('fs');

//Read contents from climate.json file.

var content = JSON.parse(fs.readFileSync('climate.json'));

app.get('/convertClimate', function(request, response){
	
	//Null Object. 
	var Map = {};
	var countryName = request.query.countryname;
	
	//Here we are using waterfakk method of Async module to execute the function
	//serially.
	async.waterfall([

		//Here we are fetching the longitude and latitude of requested Country.

		function getLongitudeLatitude(callback){
			var flag = 0;

			//Checking weather requested country is present in JSON or not.
			//If it is available then flag will turn to 1 at the same time longitiude 
			//and latitude of the respective country will be passed to next function.

			for(var i =0; i < content.climate.length ; i++){
				if(countryName == content.climate[i].countryname){
					flag = 1;
					callback(null, content.climate[i].longitude, content.climate[i].latitude);
				}
			}

			//If flag is 0 it means requested country is not available in JSON/File.

			if(flag == 0){
				callback(null, null, null);
			}
		},

		//We are fetching temperature of requested Country with the help of longitude 
		//and latitude.

		function getTemperature(longitude, latitude, callback){

			// If longitude and latitude is null then it will pass temperature equal to null,

			if(longitude == null && latitude == null){
				callback(null, null);
			}else{

				// We are fetching temperature with the help of longitude and latitude.

				for(var j =0; j < content.climate.length ; j++){
					if(longitude == content.climate[j].longitude && latitude == content.climate[j].latitude){
						
						//If we found similar longitude & latitude as parameters of function
						//then will mount longitude &  latitude in Map with countryName as key.

						Map[countryName] = {
							"longitude" : longitude,
							"latitude" : latitude
						}

						//Passing temperature to next callback.

						callback(null, content.climate[j].temperature);
					}
				}
			}
		},

		//Here we convert the temperature which is in degree celcius to Faherneit.

		function convertToFaherneit(temperature, callback){
			if(temperature == null){
				callback(null, null);
			}else{
				var temp = temperature*33.8;
				var tempo = temp+"F";
				Map[countryName]["temperature"] = tempo;
				callback(null, Map);
			}
		},

		//Write to destination file.

		function writeToFile(Map, callback){
			if(Map == null){
				callback(null, null);
			}else{
				fs.appendFileSync('destination.json', JSON.stringify(Map));
				callback(null, Map);
			}
		}
	], function responseToUser(error, result){
		if(result == null){
			response.send("Undefined CountryName");
		}else{
			response.send(result);
		}
	});
});

app.listen(3000);



