function getClass(obj) {
  if (typeof obj === "undefined")
    return "undefined";
  if (obj === null)
    return "null";
  return Object.prototype.toString.call(obj)
    .match(/^\[object\s(.*)\]$/)[1];
}

class Dropdown {
	constructor(thisname, id, city, dataset) {
		this.name = thisname;
		this.id = id;
		this.place = city;
		this.dataset = dataset;
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
			
			$("#" + this.id + "StateSelector").empty();
			this.place.state= null;
			
			$("#" + this.id + "citySpace").text("");
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
			$("#" + this.id + "citySpace").text("");
		}
	}
	
	setCity(city) {
		this.place.city = city;
		$("#" + this.id + "City").text(city);
		
		var cityText = $("#" + this.id + "citySpace");
		cityText.text("Loading...");
		
		console.log(this.place.getId());
		// Get temperatures
		this.dataset.id = this.place.getId();
		ncdc.setId(this.dataset.id);
		ncdc.getSeasonalTemps(this.dataset)
		.then(
			(result) => {
				cityText.text("City: " + this.place.toString());
				result.render();
				
				if (this != countryDD2) {
					countryDD2 = new Dropdown("countryDD2", "Second", otherPlace, data2);
					countryDD2.makeCountry();
				}
			},
			(err) => {
				var str = " error: ";
				if (err) str += err;
				cityText.text(this.place.toString() + str);
			}
		);
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

	var content = $('#' + id + 'Content');
	return content;
}

function addDropdownItem(contents, id, val, fx) {
	contents.append('<button class="dropdown-item ' + id + 'Button" onclick="' + fx + '(\'' + val + '\')">' + val + '</button>');
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
var otherPlace = new Location(null, null, null);
var countryDD;
var countryDD2;

$(document).ready( () => {
	countryDD = new Dropdown("countryDD", "", currentPlace, data1);
	countryDD.makeCountry();
});