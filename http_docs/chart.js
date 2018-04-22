class Chart {
	constructor(id, xlabels, ylabel, data, data2 = null) {
		this.data  = data;
		this.data2 = data2;
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
		y.domain([0, d3.max(data)]);
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
	
	render(data = null, data2 = null) {
		if (data) this.data = data;
		if (data2)this.data2 = data2;
		
		if (data2 == null)
			this.singleRender();
		else
			this.multiRender();
	}
	
	singleRender() {
		var bars = this.g.selectAll(".bar").data(this.data);
		
		var y = d3.scaleLinear().rangeRound([this.height, 0]);
		
		var d = d3.extent(this.data);
		var minMod = d[0] % 10;
		if (minMod < 0) minMod = 10 + minMod;
		if (d[0] > 0) d[0] = 0;
		
		y.domain(d);
		
		var yAxis = this.g.selectAll(".yAxis");
		
		var w = this.fullBarWidth;
		
		yAxis.call(d3.axisLeft(y))
			.append("text")
				.attr("transform", "translate(-10, -20)")
				.attr("y", 6)
				.attr("dy", "0.71em")
				.attr("text-anchor", "middle")
				.text(this.label);
				
		bars.enter().append("rect")
			.attr("class", "bar")
			.attr("x", (d, i) => this.x(i + 0.5) - w/2)
			.attr("y", (d) => y(d) )
			.attr("width", w)
			.attr("height", (d) => this.height - y(d) );
				
				
		bars.transition()
			.attr("height", (d) => this.height - y(d) )
			.attr("width", (d) => w)
			.attr("y", (d) => y(d) );
			
		var obars = this.g.selectAll(".bar2").data(this.data2);
		if (typeof obars.length == "undefined") {
			obars.enter().append("rect")
				.attr("height", (d) => 0)
				.attr("y", (d) => this.height);
			
			obars.transition()
				.attr("height", (d) => 0)
				.attr("y", (d) => this.height);
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
			.attr("text-anchor", "end");
		
		bars.enter().append("rect")
			.attr("class", "bar")
			.attr("x", (d, i) => this.x(i + 0.5) - w )
			.attr("y", (d) => y(d) )
			.attr("width", w)
			.attr("height", (d) => this.height - y(d) );
		
		other.enter().append("rect")
			.attr("class", "bar2")
			.attr("x", (d, i) => this.x(i + 0.5) )
			.attr("y", (d) => y(d) )
			.attr("width", w)
			.attr("height", (d) => this.height - y(d) );
		
		
		bars.transition()
			.attr("height", (d) => this.height - y(d) )
			.attr("width", (d) => w)
			.attr("y", (d) => y(d) );
		
		other.transition()
			.attr("height", (d) => this.height - y(d) )
			.attr("width", (d) => w)
			.attr("y", (d) => y(d) );
	}
}

$(document).ready( () => {
	var xlabels = [ "Spring", "Summer", "Fall", "Winter" ];
	var chart = new Chart("climateChart", xlabels, "inches", [0, 0, 0, 0]);
	chart.render();
	//chart.render([1, 2, 3, 4]);
	setTimeout( () => {
		chart.render([2, 3, 4, 5], [1, 2, 3, 4]);
		
		setTimeout( () => {
			chart.render([4, 4, 4, 4]);
			
			setTimeout( () => {
				chart.render([1, 4, 3, 0], [3, 3, 3, 2]);
			}, 1000);
		}, 1000);
		
	}, 1000);
});

