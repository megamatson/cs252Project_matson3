class Location {
	constructor(city, country, state) {
		this.country = country;
		this.city = city;
		this.state = state;
	}
	
	getId() {
		if (this.state) return locationList[this.country][this.state][this.city];
		else return locationList[this.country][this.city];
	}
	
	toString() {
		var ret = this.city + ", ";
		if (this.state != null) ret = this.state + ", ";
		ret += this.country;
		return ret;
	}
}

var locationList = createLocationList();
console.log(locationList);

function createLocationList() {
	var list = {};
	var start = 0;
	
	do {
		var end = locations.indexOf("\n", start);
		if (end == -1) break;
		
		var entry = locations.substring(start, end);
		var delim = entry.indexOf(":");
		var geoLocation = entry.substring(0, delim);
		
		var id = entry.substring(delim + 1);
		var place = valueToLocation({name: geoLocation});
		
		if(!list[place.country])
			list[place.country] = {};
		
		if (place.state != null) {
			if (!list[place.country][place.state])
				list[place.country][place.state] = {};
			
			list[place.country][place.state][place.city] = id;
		} else {
			list[place.country][place.city] = id;
		}
		
		start = end + 1;
	} while (true);
	
	return list;
}

function valueToLocation(value) {
	var string = value.name;
	
	var commaIndex = string.indexOf(", ");
	var city = string.substring(0, commaIndex);
	
	var country = string.substring(commaIndex + 2);
	var spaceIndex = country.indexOf(' ');
	
	if (spaceIndex == -1) return new Location(city, country);
	var state = country.substring(0, spaceIndex);
	
	country = country.substring(spaceIndex + 1);
	return new Location(city, country, state);
}


// =======================================
// M A I N
// =======================================
$(document).ready( () => {
});