// set global chart color palate
var palate = ['#173f5f', '#20639b','#64b5f6','#e3f2fd'] // blues

// remove previous contents
document.getElementById("employ-change-over-time").innerHTML = "";

// get variables based on inputs
var yrname = document.getElementById('input_value_employ')
var employ_yr = "employ_" + yrname.options[yrname.selectedIndex].text;

// set margins	
var margin = {left: 100, right: 20, top: 20, bottom: 100};

var width = 800 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

// create the first canvas	
var canvas = d3.select("#employ-change-over-time").append("svg")
		.attr("height", height + margin.top + margin.bottom)
		.attr("width", width + margin.left + margin.right)
	.append("g")
		.attr("transform", "translate(" + margin.left + ", " 
										+ margin.top + ")");
		
// Initialize the X axis
var xAxis = canvas.append("g")
  .attr("transform", "translate(0," + height + ")")

// x label  
canvas.append("text")
	.attr("class", "x axis-label")
	.attr("x", width / 2)
	.attr("y", height + (margin.bottom / 2) + 20)
	.attr("font-size", "14px")
	.attr("text-anchor", "middle")
	.text("City")

// Initialize the Y axis
var yAxis = canvas.append("g")
  .attr("class", "myYaxis")
  
// y label
canvas.append("text")
	.attr("class", "y axis-label")
	.attr("x", -(height/2))
	.attr("y", -60)
	.attr("font-size", "14px")
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.text("Median Unemployment Rate")
	
// title	
canvas.append("text")
	.attr("class", "title")
	.attr("x", (width/2))
	.attr("y", margin.top)
	.attr("font-size", "14px")
	.style("text-decoration", "underline")
	.attr("text-anchor", "middle")
	.text("Change in Unemployment Rate between 2010 and 2017")	

// legend
var legend = canvas.append("g")
			.attr("transform", "translate(" + (width - 10)+ "," + (height -50)+ ")")

var years = ["2010", "2017"];

var palate_sub = [palate[1], palate[3]]

years.forEach(function(year, i){
	
var legendRow = legend.append("g")
	.attr("transform", "translate(0," + (i * 20) + ")")

legendRow.append("rect")
	.attr("width", 10)
	.attr('height', 10)
	.attr("fill", palate_sub[i])
	.attr("stroke", "grey")
	.attr("stroke-width", "1")
	
legendRow.append("text")
	.attr("x", -10)
	.attr("y", 10)
	.attr("text-anchor", "end")
	.style("text-transform", "capitalize")
	.style("font-size", '10px')
	.text(year)
}) 	

// tooltip
var tip1 = d3.tip().attr("class", "d3-tip")
	.html(function(d){
		
		var info = "<strong>City: </strong><span style='color: grey'>" + d.Geography + "</span> </br> </br>";
		info += "<strong>2010 Unemployment Rate: </strong><span style='color: grey'>" + d3.format(",.1%")(d.employ_2010) + "</span> </br> </br>";
		info += "<strong>Region: </strong><span style='color: grey'>" + d.region + "</span>";
	return info;
});		

canvas.call(tip1);

var tip2 = d3.tip().attr("class", "d3-tip")
	.html(function(d){
		
		var info = "<strong>City: </strong><span style='color: grey'>" + d.Geography + "</span> </br> </br>";
		info += "<strong>2017 Unemployment Rate: </strong><span style='color: grey'>" + d3.format(",.1%")(d.employ_2017) + "</span> </br> </br>";
		info += "<strong>Region: </strong><span style='color: grey'>" + d.region + "</span>";

	return info;
});		

canvas.call(tip2);

// read data to plot
d3.csv("data/employ.csv").then(function(data){
				
	// set each non-city identifier to a numeric input			
	data.forEach(d => {
		names = d3.keys(d)
		names.slice(2).forEach(j =>
		{
			d[j] = +d[j]
		})
	})		
	
	// create y scale
	var y = d3.scaleLinear()
				.domain([0, 0.2]) 
				.range([height, 0]); // change here to height
	
	// create x scale
	var x = d3.scaleBand()
				.domain(data.map(function(d){return d.Geography}))
				.range([0,width]) // change here to width
				.paddingInner(0.3)
				.paddingOuter(0.3);	
	
	// create color scale
	var regionColor = d3.scaleOrdinal().range(palate);
	
	// adding in the axes
	var xAxisCall = d3.axisBottom(x)
	canvas.append("g")
		.attr("class", "x-axis")
		.attr("transform", "translate(0, " + (height) + ")")
		.call(xAxisCall)
	.selectAll("text")
		.attr("y", "10")
		.attr("x", "-5")
		.attr("text-anchor", "end")
		.attr("transform", "rotate(-30)");
		
	var yAxisCall = d3.axisLeft(y)
		.ticks(4)
	.tickFormat(function(d){return d3.format(".0%")(d)}); // update
	canvas.append("g")
		.attr("class", "y-axis")
		.call(yAxisCall);
		
	var t = d3.transition().duration(1000)	
				
	// create lines
	var lines = canvas.selectAll("line") 
					.data(data, function(d){return d.Geography});
	
	lines.enter()
		.append("line")
		.merge(lines)
		.transition(t)
			.attr("y1", function(d){return y(d.employ_2010)})
			.attr("y2", function(d){return y(d.employ_2017)})
			.attr("x1", function(d){return x(d.Geography)}) 
			.attr("x2", function(d){return x(d.Geography)})
			.attr("stroke", "grey")
			
			
	var circles2010 = canvas.selectAll("circle")
					.data(data);
					
		circles2010.enter()
			.append("circle")
			.on("mouseover", tip1.show)
			.on("mouseout", tip1.hide)
			.transition(t)
				.attr("cx", function(d){return x(d.Geography)})
				.attr("cy", function(d) {return y(d.employ_2010)} )
				.attr("fill", palate[1])	
				.attr("stroke", "grey")
				.attr("stroke-width", "1")
				.attr("r", "8")
				
	var circles2017 = canvas.selectAll("circles")
					.data(data);

		circles2017.enter()
			.append("circle")
			.on("mouseover", tip2.show)
			.on("mouseout", tip2.hide)
			.transition(t)
				.attr("cx", function(d){return x(d.Geography)})
				.attr("cy", function(d) {return y(d.employ_2017)} )
				.attr("fill", palate[3])	
				.attr("stroke", "grey")
				.attr("stroke-width", "1")
				.attr("r", "8")
				
			
}) // end update function

/* 
	------------------------------------------ 
	
	Comparing income vs home and rental prices

	------------------------------------------
*/

// remove previous contents
document.getElementById("employ-vs-payment").innerHTML = "";

// get variables based on inputs
var yrname = document.getElementById('input_value_employ')
var type   = document.getElementById('input_value_employ_category')
var employ_yr = "employ_" + yrname.options[yrname.selectedIndex].text;
var price_yr =  type.options[type.selectedIndex].value + yrname.options[yrname.selectedIndex].text + "-07";
var category = type.options[type.selectedIndex].text

// set margins
var margin = {left: 100, right: 20, top: 20, bottom: 100};

var width = 800 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;
	
// create canvas
var canvas2 = d3.select("#employ-vs-payment").append("svg")
			.attr("height", height + margin.top + margin.bottom)
			.attr("width", width + margin.left + margin.right)
		.append("g")
			.attr("transform", "translate(" + margin.left + ", " 
											+ margin.top + ")");
											
// Initialize the X axis											
var x = d3.scaleLinear()
  .range([ 0, width ])
  
var xAxis = canvas2.append("g")
  .attr("transform", "translate(0," + height + ")")

// Initialize the Y axis
var y = d3.scaleLinear()
  .range([ height, 0]);
var yAxis = canvas2.append("g")
  .attr("class", "myYaxis")
  
// x label
canvas2.append("text")
	.attr("class", "x axis-label")
	.attr("x", width / 2)
	.attr("y", height + (margin.bottom / 2) + 20)
	.attr("font-size", "14px")
	.attr("text-anchor", "middle")
	.text("Unemployment Rate (%)")

// y label
canvas2.append("text")
	.attr("class", "y axis-label")
	.attr("x", -(height/2))
	.attr("y", -80)
	.attr("font-size", "14px")
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.text("Median Price ($)")	

// tooltip
var tip = d3.tip().attr("class", "d3-tip")
	.html(function(d){
		
		var info = "<strong>City: </strong><span style='color: grey'>" + d.Geography + "</span><br /> <br /><br />";
		info += "<strong>Unemployment Rate: </strong><span style='color: grey'>" + d3.format(",.1%")(d[employ_yr]) + "</span><br /><br />";
		info += "<strong>Median Price: </strong><span style='color: grey'>" + d3.format("$,.0f")(d[price_yr]) + "</span>";

	return info;
});		

canvas2.call(tip);

// read data
d3.csv("data/employ.csv").then(function(data){
	
		// set values to numeric
	data.forEach(d => {
		names = d3.keys(d)
		names.slice(2).forEach(j =>
		{
			d[j] = +d[j]
		})
	})		
		
	// set colorscale
	var regionColor = d3.scaleOrdinal().range(palate);
	
	// adding in the axes
	var x = d3.scaleLinear()
		.domain([0, d3.max(data, function(d){return d[employ_yr]})]) 
		.range([0, width]);

	var y = d3.scaleLinear()
		.domain([0, d3.max(data, function(d){return d[price_yr]})]) 
		.range([height, 0]);	

	// draw axes
	var xAxisCall = d3.axisBottom(x)
		.ticks(3)
		.tickFormat(function(d){return d3.format(".0%")(d)});
	canvas2.append("g")
		.attr("class", "x-axis")
		.attr("transform", "translate(0, " + (height) + ")")
		.call(xAxisCall)
	.selectAll("text")
		.attr("y", "10")
		.attr("x", "-5")
		.attr("text-anchor", "end")
		.attr("transform", "rotate(-30)");
		
	var yAxisCall = d3.axisLeft(y) 
		.ticks(3)
		.tickFormat(function(d){return d3.format("$,.0f")(d)});
	canvas2.append("g")
		.attr("class", "y-axis")
		.call(yAxisCall);
		
	// legend
	var legend = canvas2.append("g")
				.attr("transform", "translate(" + (width - 10)+ "," + (height - 100)+ ")")

	var regions = ["East", "South", "Central", "West"];

	regions.forEach(function(region, i){
		
	var legendRow = legend.append("g")
		.attr("transform", "translate(0," + (i * 20) + ")")
	
	legendRow.append("rect")
		.attr("width", 10)
		.attr('height', 10)
		.attr("fill", regionColor(region))
		.attr("stroke", "grey")
		.attr("stroke-width", "1")
		
	legendRow.append("text")
		.attr("x", -10)
		.attr("y", 10)
		.attr("text-anchor", "end")
		.style("text-transform", "capitalize")
		.style("font-size", '10px')
		.text(region)
	}) 
	
	// create initial plot
	update(data, "2010", "price_");

	// add listeners
	$("#input_value_employ")
		.on("change", function(){
			year = document.getElementById('input_value_employ')
			year = year.options[year.selectedIndex].text;
			type = document.getElementById('input_value_employ_category')
			type = type.options[type.selectedIndex].value
			update(data, year, type);
	});	
	
	$("#input_value_employ_category")
		.on("change", function(){
			year = document.getElementById('input_value_employ')
			year = year.options[year.selectedIndex].text;
			type = document.getElementById('input_value_employ_category')
			type = type.options[type.selectedIndex].value
			update(data, year, type);
	});	

	// function to update data
	function update(data, year, type) {
		
		// initialize variables
		var employ_yr = "employ_" + year;
		var price_yr =  type + year + "-07";	
		
		// determine axis limits based on selections
		if (type == "price_"){
			var max_y = 1600000;
			var labeltext = "Median Housing Price ($)";
		} else {
			var max_y = 4500;
			var labeltext = "Median Rent Price ($)";
		}
		
		// x scale
		var x = d3.scaleLinear()
			.domain([0, 0.2]) 
			.range([0, width]);
			
		var xAxisCall = d3.axisBottom(x)
		.ticks(3)
		.tickFormat(function(d){return d3.format(".0%")(d)});
		
		// call new x axis
		canvas2.selectAll('.x-axis')
			.call(xAxisCall);
		
		
		// set y scale based on selection
		var y = d3.scaleLinear()
				.domain([0, max_y]) 
				.range([height, 0]);	
				
		var yAxisCall = d3.axisLeft(y) // pass the scale that is proper
		.ticks(3)
		.tickFormat(function(d){return d3.format("$,.0f")(d)});
		
		// call new y axis
		canvas2.selectAll('.y-axis')
			.call(yAxisCall);
		
		// update tooltip
		tip.html(function(d){

			var info = "<strong>City: </strong><span style='color: grey'>" + d.Geography + "</span><br /><br />";

			info += "<strong>Unemployment Rate: </strong><span style='color: grey'>" + d3.format(",.1%")(d[employ_yr]) + "</span><br /><br />";

			info += "<strong>Median Price: </strong><span style='color: grey'>" + d3.format("$,.0f")(	d[price_yr]) + "</span>";

			return info;
		});	
		
		// set transition time and draw initial points
		var t = d3.transition().duration(1000);	
		
		var circles = canvas2.selectAll("circle") 
						.data(data, function(d){return d.Geography});
		
		// remove old circles
		circles.exit()
			.attr("class", "exit")
			.remove();
			
		// add new circles with given properties
		circles.enter()
			.append("circle")
			.attr("fill", function(d){ return regionColor(d.region) })
			.on("mouseover", tip.show)
			.on("mouseout", tip.hide)
			.merge(circles)
			.transition(t)
					.attr("cy", function(d){return y(d[price_yr])})
					.attr("cx", function(d){return x(d[employ_yr])}) 
					.attr("r", 7)
					.attr("stroke", "grey")
					.attr("stroke-width", "2")
						
	} // end update function
})
