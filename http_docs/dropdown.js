function initDropDown(dd, buttonName) {
	dd.empty();
	var inputId = buttonName + 'Input';
	
	dd.append(
		$('<button class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" id="dropdownMenuButton"></button>')
			.text(buttonName),
		'<div class="dropdown-menu scrollable-menu" aria-labelledby="dropdownMenuButton" id="' + buttonName + 'Content">' +
			'<input type="text" placeholder="Search" onkeyup="filterFunction(\'' + buttonName + '\')" id="' + inputId + '">' +
		'</div>'
	);

	var content = $('#' + buttonName + 'Content');
	return content;
}

function addDropdownItem(contents, id, val) {
	contents.append('<button class="dropdown-item ' + id + 'Button">' + val + '</button>');
}

function makeCountryDropDown(id) {
	var dropdown = $("#" + id);
	var ddContent = initDropDown(dropdown, "Country");
	
	for (var country in locationList) {
		addDropdownItem(ddContent, "Country", country);
	}
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

$(document).ready( () => {
	makeCountryDropDown("CountrySelector");
});