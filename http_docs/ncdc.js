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
				reject(error);
			}
			var dataT = data.temperature;
			if (data.id != this.id) reject("Different location is being queried.");
			
			nullify(dataT);
			
			var err = "NCDC does not have temperature data for this location.";
			
			// Get values from server
			this.getData("NORMAL_ANN",
				["MAM-TAVG-NORMAL",
				"JJA-TAVG-NORMAL",
				"SON-TAVG-NORMAL",
				"DJF-TAVG-NORMAL"],
				date,
				false,
				errorWrapper)
			.done( (result) => {
				//console.log(result);
				var avg = getBestAverages(result);
				if (avg == null) reject(err);
				// Data comes as (int * 10), so divide by 10 to get float representation
				for(let i = 0; i < avg.length; i++)
					dataT[i] = Math.floor(avg[i]) / 10;
				
				if (data.id != this.id) reject("Different data being loaded");
				if (dataT.isSet()) resolve(dataT);
			});
			
		});
	}
	
	getData(dataSetId, dataTypeId, dateInterval, metaData, reject) {
		if (typeof dataTypeId == "string") {
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
		
		var dataString =
			"datasetid=" + dataSetId +
			"&startdate=" + dateInterval.start +
			"&enddate=" + dateInterval.end +
			"&includemetadata=" + metaData.toString() +
			"&limit=1000" +
			"&locationid=" + this.id;
		
		for(var i = 0; i < dataTypeId.length; i++) {
			var type = dataTypeId[i];
			dataString += "&datatypeid=" + type;
		}
		
		return $.ajax({
			url: ncdcURL + "data",
			data: dataString,
			headers: { token: this.token },
			error: reject
		});
	}
}

ncdc = new NCDC("kmqITtdRUSngeoOeFWjzBAtkbdNpEkcJ");

function nullify(dataset) {
	for(var i = 0; i < dataset.length; i++) dataset[i] = null;
}

// The order of preferred datasets
var attributesPreference = ["C", "S", "R", "P", "Q"];
var prioritizer = {}
for(var i = 0; i < attributesPreference.length; i++)
	prioritizer[attributesPreference[i]] = i;

// NCDC has different datasets of various quality
// This gets the average from the best available one
function getBestAverage(dataSet) {
	var data = dataSet.results;
	if (typeof data == "undefined") return null;
	
	var priority = attributesPreference.length;
	var sum, count;
	for (var i = 0; i < data.length; i++) {
		var datum = data[i];
		var datumPriority = prioritizer[datum.attributes];
		
		if (datumPriority < priority) {
			priority = datumPriority;
			sum = datum.value;
			count = 1;
		} else if (datumPriority == priority) {
			sum += datum.value;
			count++;
		}
	}
	
	return (count) ? sum / number : null;
}

function getBestAverages(dataSet) {
	var data = dataSet.results;
	if (typeof data == "undefined") return null;
	
	var sums = 		[0, 0, 0, 0];
	var counts =	[0, 0, 0, 0];
	var mp = attributesPreference.length;
	var priority =  [mp, mp, mp, mp];
	
	var groups = ["MAM", "JJA", "SON", "DJF"];
	var groupIndex = {};
	for (let i = 0; i < groups.length; i++)
		groupIndex[groups[i]] = i;
	
	for (let i = 0; i < data.length; i++) {
		var datum = data[i];
		var index = -1;
		for (let j = 0; j < groups.length; j++) {
			var gIndex = datum.datatype.indexOf(groups[j]);
			if (gIndex != -1) {
				index = j;
				break;
			}
		}
		if (index == -1) {
			console.log(datum);
			continue;
		}
		
		var datumPriority = prioritizer[datum.attributes];
		
		if (datumPriority < priority[index]) {
			priority[index] = datumPriority;
			sums[index] = datum.value;
			counts[index] = 1;
		}else if (datumPriority == priority[index]) {
			sums[index] += datum.value;
			counts[index]++;
		}
	}
	
	for (let i = 0; i < counts.length; i++) {
		if (counts[i] == 0) return null;
		sums[i] /= counts[i];
	}
	
	return sums;
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

// for locationList.js
function getLocations() {
	var txt = $("#log");
	var reject = (r) => console.log(r);
	var dateInterval = getTenYearRange();
	
	function pull(index) {
		$.ajax({
			url: ncdcURL + "locations",
			data: {
				datasetid: "NORMAL_ANN",
				locationcategoryid: "CITY",
				startdate: dateInterval.start,
				enddate: dateInterval.end,
				includemetadata: true,
				units: "standard",
				limit: 1000,
				offset: index
				
			},
			headers: { token: ncdc.token },
			error: reject
		}).done( (r) => {
			var data = r.results;
			for (var i = 0; i < data.length; i++) {
				var datum = data[i];
				txt.append(datum.name + ":" + datum.id + "\\n\\\n");
			}
			
			index += 1000;
			if (index > r.metadata.resultset.count) return;
			pull(index);
		});
	}
	
	pull(0);
}

$(document).ready( () => {
});
