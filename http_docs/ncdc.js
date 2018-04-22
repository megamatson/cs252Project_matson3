// Documentation (for future use)
//		https://www.ncdc.noaa.gov/cdo-web/webservices/v2
const ncdcURL = "https://www.ncdc.noaa.gov/cdo-web/api/v2/";

var ncdc;

class NCDC {
	constructor(token) {
		this.token = token;
	}
	
	setId(p) {
		this.id = p;
	}
	
	getSeasonalTemps(data) {
		return new Promise( (resolve, reject) => {
			var date = getTenYearRange();
			
			function errorWrapper(xqhxr, status, error) { 
				console.log(xqhxr);
				console.log(status);
				reject(error);
			}
			
			// Get values from server
			this.getData("NORMAL_ANN", "MAM-TAVG-NORMAL", date, false, errorWrapper)
			.done( (result) => {
				// Data comes as (int * 10), so divide by 10 to get float representation
				var avg = getBestAverage(result);
				if (avg == null) { console.log(result); reject("Could not find valid spring temperature"); }
				data[0] =  avg/10;
				if (data.isSet()) resolve(data);
			});
			
			this.getData("NORMAL_ANN", "JJA-TAVG-NORMAL", date, false, errorWrapper)
			.done( (result) => {
				// Data comes as (int * 10), so divide by 10 to get float representation
				var avg = getBestAverage(result);
				if (avg == null) { console.log(result); reject("Could not find valid spring temperature"); }
				data[1] =  avg/10;
				if (data.isSet()) resolve(data);
			});
			
			this.getData("NORMAL_ANN", "SON-TAVG-NORMAL", date, false, errorWrapper)
			.done( (result) => {
				// Data comes as (int * 10), so divide by 10 to get float representation
				var avg = getBestAverage(result);
				if (avg == null) { console.log(result); reject("Could not find valid spring temperature"); }
				data[2] =  avg/10;
				if (data.isSet()) resolve(data);
			});
			
			this.getData("NORMAL_ANN", "DJF-TAVG-NORMAL", date, false, errorWrapper)
			.done( (result) => {
				// Data comes as (int * 10), so divide by 10 to get float representation
				var avg = getBestAverage(result);
				if (avg == null) { console.log(result); reject("Could not find valid spring temperature"); }
				data[3] =  avg/10;
				if (data.isSet()) resolve(data);
			});
			
		});
	}
	
	getData(dataSetId, dataTypeId, dateInterval, metaData, reject) {
		return $.ajax({
			url: ncdcURL + "data",
			data: {
				datasetid: dataSetId,
				datatypeid: dataTypeId,
				startdate: dateInterval.start,
				enddate: dateInterval.end,
				includemetadata: metaData,
				limit: 1000,
				locationid: this.id
			},
			headers: { token: this.token },
			error: reject
		});
	}
}

ncdc = new NCDC("kmqITtdRUSngeoOeFWjzBAtkbdNpEkcJ");

function getBestAverage(dataSet) {
	// NCDC has different datasets of various quality
	// This gets the average from the best available one
	var data = dataSet.results;
	if (typeof data == "undefined") return null;
	
	// The order of the preferred data sets
	var  attributesPreference = ["C", "S", "R", "P", "Q"];
	for(var cAttr in attributesPreference) {
		var sum = 0;
		var number = 0;
		for (var i = 0; i < data.length; i++) {
			var datum = data[i];
			sum += datum.value;
			number++;
		}
		
		if (number != 0)
			return (sum / number);
	}
	return null;
}

function getTenYearRange() {
	//Get the dates
	var date = new Date();
	var year = date.getFullYear();
	var month= date.getMonth().toString();
	var day  = date.getDate().toString();
	
	if(month.length != 2) month = "0" + month;
	if(day.length != 2) day = "0" + day;
	
	var endDate = year.toString();
	if(endDate.length != 4) return null;
	endDate = endDate + "-" + month + "-" + day; //YYYY-MM-DD
	
	var startDate = (year - 10).toString();
	if(startDate.length !=4) return null;
	startDate = startDate + "-" + month + "-" + day; //YYYY-MD-DD
	
	return { start: startDate, end: endDate };
}