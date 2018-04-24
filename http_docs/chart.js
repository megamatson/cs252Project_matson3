class Chart {
	constructor(id, xlabels, ylabel, data = null, data2 = null) {
		this.setData(data);
		this.setData2(data2);
		this.label = ylabel;
		this.id = id;
		
		this.svg = d3.select('#' + id)
			.append("svg")
			.attr("width", "200")
			.attr("height", "200");
		
		this.margin = {top: 20, right: 20, bottom: 20, left: 30};
		this.width = +this.svg.attr("width") - this.margin.left - this.margin.right;
		this.height = +this.svg.attr("height") - this.margin.top - this.margin.bottom;
		
		this.x = d3.scaleLinear().rangeRound([0, this.width]);
		var y = d3.scaleLinear().rangeRound([this.height, 0]);
		
		this.axis = d3.scaleBand().rangeRound([0, this.width]);
		
		this.x.domain([0, 4]);
		
		if (this.data.isSet())
			y.domain([0, d3.max(this.data)]);
		else
			y.domain([0, 0]);
		
		this.axis.domain(xlabels);
		
		this.g = this.svg.append("g")
			.attr("transform",
				"translate(" + this.margin.left + "," + this.margin.top + ")");
				
		this.g.append("g")
			.attr("class", "axis axis--x")
			.attr("transform", "translate(0," + this.height + ")")
			.call(d3.axisBottom(this.axis));
			
		this.g.append("g")
			.attr("class", "yAxis")
			.call(d3.axisLeft(y))
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", "0.71em")
				.attr("text-anchor", "end");
				
		this.barWidth = Math.floor(this.width/9);
		this.fullBarWidth = Math.floor(2 * this.width / 10);
	}
	
	link(data) {
		if (typeof data.render == "undefined") {
			data.chart = this;
			data.renderFx = Chart.prototype.render;
			data.render = function () { this.renderFx.apply(this.chart); }
		}
	}
	
	setData(data) {
		if (data) {
			this.link(data);
			this.data = data;
		}
	}
	
	setData2(data) {
		if (data) {
			this.link(data);
			this.data2 = data;
		}
	}
	
	render(data = null, data2 = null) {
		this.setData(data);
		this.setData2(data2);
		
		if (this.data2.isSet())
			this.multiRender();
		else
			this.singleRender();
		
		enableToolTips();
	}
	
	singleRender() {
		if (!this.data.isSet()) return;
		var bars = this.g.selectAll(".bar").data(this.data);
		
		var y = d3.scaleLinear().rangeRound([this.height, 0]);
		
		var d = d3.extent(this.data);
		var minMod = d[0] % 10;
		if (minMod < 0) minMod = 10 + minMod;
		if (d[0] > 0) d[0] = 0;
		if(d[0] < 0) d[0] -= minMod;
		
		y.domain(d);
		
		var yAxis = this.g.selectAll(".yAxis");
		
		var w = this.fullBarWidth;
		
		yAxis.call(d3.axisLeft(y))
			.append("text")
				.attr("transform", "translate(-10, -20)")
				.attr("y", 6)
				.attr("dy", "0.71em")
				.attr("text-anchor", "middle")
				.text(this.label)
			;
				
		bars.enter().append("rect")
			.attr("class", "bar")
			.attr("x", (d, i) => this.x(i + 0.5) - w/2)
			.attr("y", (d) => y(d) )
			.attr("width", w)
			.attr("height", (d) => this.height - y(d) )
			.attr("data-toggle", "tooltip")
			.attr("data-placement", "top")
			.attr("title", (d) => "" + d )
		;
				
				
		bars.transition()
			.attr("height", (d) => this.height - y(d) )
			.attr("width", (d) => w)
			.attr("y", (d) => y(d) )
			.attr("data-original-title", (d) => "" + d )
		;
			
		var obars = this.g.selectAll(".bar2").data(this.data2);
		if (typeof obars.length == "undefined") {
			obars.enter().append("rect")
				.attr("height", (d) => 0)
				.attr("y", (d) => this.height)
			;
			
			obars.transition()
				.attr("height", (d) => 0)
				.attr("y", (d) => this.height)
			;
		}
	}
	
	multiRender() {
		var bars =	this.g.selectAll(".bar").data(this.data);
		var other =	this.g.selectAll(".bar2").data(this.data2);
		
		var y = d3.scaleLinear().rangeRound([this.height, 0]);
		
		var nmin = d3.min(this.data);
		var omin = d3.min(this.data2);
		var min = (nmin < omin) ? nmin : omin;
		var minMod = min % 10;
		if(minMod < 0) minMod = 10 + minMod;
		if(min > 0) min = 0;
		if(min < 0) min -= minMod;
		
		var nmax = d3.max(this.data);
		var omax = d3.max(this.data2);
		var max = (nmax > omax) ? nmax : omax;
		
		y.domain([min, max]);
		
		var yAxis = this.g.selectAll(".yAxis");
		
		var w = this.barWidth;
		
		yAxis.call(d3.axisLeft(y))
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", "0.71em")
			.attr("text-anchor", "end")
		;
		
		bars.enter().append("rect")
			.attr("class", "bar")
			.attr("x", (d, i) => this.x(i + 0.5) - w )
			.attr("y", (d) => y(d) )
			.attr("width", w)
			.attr("height", (d) => this.height - y(d) )
			.attr("data-toggle", "tooltip")
			.attr("data-placement", "top")
			.attr("title", (d) => "" + d )
		;
		
		other.enter().append("rect")
			.attr("class", "bar2")
			.attr("x", (d, i) => this.x(i + 0.5) )
			.attr("y", (d) => y(d) )
			.attr("width", w)
			.attr("height", (d) => this.height - y(d) )
			.attr("data-toggle", "tooltip")
			.attr("data-placement", "top")
			.attr("title", (d) => "" + d )
		;
		
		bars.transition()
			.attr("height", (d) => this.height - y(d) )
			.attr("width", (d) => w)
			.attr("y", (d) => y(d) )
			.attr("data-original-title", (d) => "" + d )
		;
		
		other.transition()
			.attr("height", (d) => this.height - y(d) )
			.attr("width", (d) => w)
			.attr("y", (d) => y(d) )
			.attr("data-original-title", (d) => "" + d )
		;
	}
}

function ChartData (data = [null, null, null, null]) {
	var ret = data;
	ret.isSet = function() {
		return (this[0] != null &&
			this[1] != null &&
			this[2] != null && 
			this[3] != null);
	}
	return ret;
}

function test(data) {
	data[0] = 1;
	data[1] = 3;
	data[2] = 6;
	data[3] = 0;
}

function enableToolTips() {
	$(() => 
		$('[data-toggle="tooltip"]').tooltip()
	);
}

const xLabels = [ "Spring", "Summer", "Fall", "Winter" ]
var temperatureChart = {};
var rainChart = {};
var data1 = {};
var data2 = {};



$(document).ready( () => {
	data1.temperature = new ChartData();
	data1.rain = new ChartData();
	
	data2.temperature = new ChartData();
	data2.rain = new ChartData();
	
	temperatureChart = new Chart(
		"temperatureChart",
		xLabels,
		"°F",
		data1.temperature,
		data2.temperature
	);
	
	rainChart = new Chart(
		"rainChart",
		xLabels,
		"inches",
		data1.rain,
		data2.rain
	);
});

