function getClass(obj) {
  if (typeof obj === "undefined")
    return "undefined";
  if (obj === null)
    return "null";
  return Object.prototype.toString.call(obj)
    .match(/^\[object\s(.*)\]$/)[1];
}

class Dropdown {
	constructor(thisname, id, buttonName, city) {
		this.name = thisname;
		this.id = id;
		this.buttonName = buttonName;
		this.place = city;
	}
	
	makeCountry() {
		var tid = this.id + "Country";
		var dropdown = $("#" + tid + "Selector");
		var ddContent = initDropDown(dropdown, "Country", tid);
		
		for (var country in locationList)
			addDropdownItem(ddContent, tid, country, this.name + ".setCountry");
	}
	
	makeCity() {
		var tid = this.id + "City";
		var dropdown = $("#" + tid + "Selector");
		var ddContent = null;
		
		var country = this.place.state ?
			locationList[this.place.country][this.place.state] :
			locationList[this.place.country];
		
		for (var city in country) {
			if (getClass(country[city]) == "String") {
				if (ddContent == null) ddContent = initDropDown(dropdown, "City", tid);
				addDropdownItem(ddContent, tid, city, this.name + ".setCity");
			}
		}
	}
	
	makeState() {
		var tid = this.id + "State";
		var dropdown = $("#" + tid + "Selector");
		var ddContent = null;
		
		var country = this.place.state ?
			locationList[this.place.country][this.place.state] :
			locationList[this.place.country];
		
		for (var state in country) {
			if (getClass(country[state]) != "String") {
				if (ddContent == null) ddContent = initDropDown(dropdown, "State", tid);
				addDropdownItem(ddContent, tid, state, this.name + ".setState");
			}
		}
		
	}
	
	setCountry(country) {
		$("#" + this.id + "Country").text(country);
		if (country != this.place.country) {
			this.place.country = country;
			this.place.city = null;
			if (this.place.state) {
				this.place.state = null;
				$("#" + this.id + "StateSelector").empty();
			}
			$("#citySpace").text("");
			this.makeState();
			this.makeCity();
		}
	}
	
	setState(state) {
		$("#" + this.id + "State").text(state);
		if(state != this.place.state) {
			this.place.state = state;
			this.place.city = null;
			this.makeCity();
			$("#citySpace").text("");
		}
	}
	
	setCity(city) {
		$("#" + this.id + "City").text(city);
		this.place.city = city;
		$("#citySpace").text("City: " + this.place.toString());
		console.log(this.place.getId());
	}
}

function initDropDown(dd, buttonName, id) {
	dd.empty();
	var inputId = id + 'Input';
	
	dd.append(
		$('<button class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" id="' + id + '"></button>')
			.text(buttonName),
		'<div class="dropdown-menu scrollable-menu" id="' + id + 'Content">' +
			'<input type="text" placeholder="Search" onkeyup="filterFunction(\'' + id + '\')" id="' + inputId + '">' +
		'</div>'
	);

	var content = $('#' + buttonName + 'Content');
	return content;
}

function setCountry(country) {
	console.log(country);
	
	console.log(locationList[country]);
}

function setState(state) {
	console.log(state);
	
}

function setCity(city) {
	
}

function addDropdownItem(contents, id, val, fx) {
	contents.append('<button class="dropdown-item ' + id + 'Button" onclick="' + fx + '(\'' + val + '\')">' + val + '</button>');
}

function makeCountryDropDown(id) {

}

function filterFunction(id) {
	var input = $('#' + id + 'Input');
	var filter = input[0].value.toUpperCase();
	var elements = $('.' + id + "Button");
	
	for(var i = 0; i < elements.length; i++) {
		if (elements[i].innerHTML.toUpperCase().indexOf(filter) > -1)
			elements[i].style.display = "";
		else
			elements[i].style.display = "none";
	}
}

var currentPlace = new Location(null, null, null);
var countryDD;

$(document).ready( () => {
	countryDD = new Dropdown("countryDD", "", "Country", currentPlace);
	countryDD.makeCountry();
	makeCountryDropDown("CountrySelector");
});