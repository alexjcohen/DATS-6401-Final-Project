// set global chart color palate
var palate = ['#173f5f', '#20639b','#64b5f6','#e3f2fd']

// remove previous contents
document.getElementById("age-change-over-time").innerHTML = "";

// set margins and draw canvas
var margin = {left: 100, right: 20, top: 20, bottom: 100};

var width = 800 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;
	
var canvas = d3.select("#age-change-over-time").append("svg")
		.attr("height", height + margin.top + margin.bottom)
		.attr("width", width + margin.left + margin.right)
	.append("g")
		.attr("transform", "translate(" + margin.left + ", " 
										+ margin.top + ")");
		 
// X label
canvas.append("text")
	.attr("class", "x axis-label")
	.attr("x", width / 2)
	.attr("y", height + (margin.bottom / 2) + 20)
	.attr("font-size", "14px")
	.attr("text-anchor", "middle")
	.text("Age Distribution")

// y label
canvas.append("text")
	.attr("class", "y axis-label")
	.attr("x", -(height/2))
	.attr("y", -60)
	.attr("font-size", "14px")
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.text("City")

// tooltip
var tip = d3.tip().attr("class", "d3-tip")
	.html(function(d){
		
		var info = "<strong>City: </strong><span style='color: grey'>" + d.Geography + "</span><br /> <br />";
		info += "<strong>Age Category: </strong><span style='color: grey'>" + d.variable + "</span><br /> <br />";
		info += "<strong>Proportion: </strong><span style='color: grey'>" + d3.format(",.1%")(d.value) + "</span>";
	return info;
});		

canvas.call(tip);

// A function that creates / updates the plot for a given variable:
d3.csv("data/age_heatmap.csv").then(function(data){
				
	data.forEach(d => {
		names = d3.keys(d)
		names.slice(2).forEach(j =>
		{
			d[j] = +d[j]
		})
	})		
	
	// define subcategories
	var myGroups = d3.map(data, function(d){return d.Geography;}).keys()
	var myVars = d3.map(data, function(d){return d.variable;}).keys()
	
	// define color palate
	var myColor = d3.scaleSequential()
					.interpolator(d3.interpolateBlues)
					.domain(d3.extent(data, function(d){return d.value}))

	// adding scales
	var x = d3.scaleBand()
			.range([ 0, width ])
			.domain(myGroups)
			.padding(0.01);
			
	var y = d3.scaleBand()
			.range([ height, 0 ])
			.domain(myVars)
			.padding(0.01);
	
	// define axes
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
	canvas.append("g")
		.attr("class", "y-axis")
		.call(yAxisCall);
	
	// run update function
	update(data, "2010");
		
	// add listener
	$("#input_value_age")
		.on("change", function(){
			year = document.getElementById('input_value_age')
			year = year.options[year.selectedIndex].value;
			update(data, year);
	});	

	// function to update data
	function update(data, year) {
	
		// filter data based on selected year
		data = data.filter(function(d){
			if(d.datayear == year) return true
		})
				
		// update tooltip contents		
		tip.html(function(d){

			var info = "<strong>City: </strong><span style='color: grey'>" + d.Geography + "</span><br /> <br />";
			info += "<strong>Age Category: </strong><span style='color: grey'>" + d.variable + "</span><br /> <br />";
			info += "<strong>Proportion: </strong><span style='color: grey'>" + d3.format(",.1%")(d.value) + "</span>";
		
			return info;
		});	
		
		// define transition
		var t = d3.transition().duration(1000)

		// draw initial rectanges
		var rects = canvas.selectAll("rect")
			  .data(data, function(d) {return d.Geography+':'+d.variable;});
		
		// remove rectanges
		rects.exit()
			.attr("class", "exit")
			.remove();  
		
		// draw and merge new rectangles
		rects.enter()
			  .append("rect")
			  .on("mouseover", tip.show)
			  .on("mouseout", tip.hide)
			  .merge(rects)
			  .transition(t)
				  .attr("x", function(d) { return x(d.Geography) })
				  .attr("y", function(d) { return y(d.variable) })
				  .attr("width", x.bandwidth() )
				  .attr("height", y.bandwidth() )
				  .style("fill", function(d) { return myColor(d.value)} )
			
		};
		
})
	

/* 
	------------------------------------------ 
	
	Comparing median vs home and rental prices

	------------------------------------------
*/

// remove previous contents
document.getElementById("age-vs-payment").innerHTML = "";

// get variables based on inputs
var yrname = document.getElementById('input_value_age')
var type   = document.getElementById('input_value_payment_category_age')
var age_yr = "age_" + yrname.options[yrname.selectedIndex].value;
var price_yr =  type.options[type.selectedIndex].value + yrname.options[yrname.selectedIndex].text + "-07";

// define margins and draw canvas
var margin = {left: 100, right: 120, top: 20, bottom: 100};

var width = 900 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;
	
var canvas2 = d3.select("#age-vs-payment").append("svg")
		.attr("height", height + margin.top + margin.bottom)
		.attr("width", width + margin.left + margin.right)
	.append("g")
		.attr("transform", "translate(" + margin.left + ", " 
										+ margin.top + ")");

// initialize the X axis
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
	.text("Median Age (years)")

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
var tip2 = d3.tip().attr("class", "d3-tip")
	.html(function(d){
		
		var info = "<strong>City: </strong><span style='color: grey'>" + d.Geography + "</span><br /> <br /><br />";
		info += "<strong>Median Age: </strong><span style='color: grey'>" + d3.format(",.1f")(d[age_yr]) + "</span><br /><br />";
		info += "<strong>Median Price: </strong><span style='color: grey'>" + d3.format("$,.0f")(d[price_yr]) + "</span>";

	return info;
});		

canvas2.call(tip2);

// read data
d3.csv("data/age.csv").then(function(data){
				
	data.forEach(d => {
		names = d3.keys(d)
		names.slice(1).forEach(j =>
		{
			d[j] = +d[j]
		})
	})		
	
	// set color scheme
	var regionColor = d3.scaleOrdinal().range(palate);
	
	// set x and y scales
	var x = d3.scaleLinear()
		.domain([29, 40])
		.range([0, width]);

	var y = d3.scaleLinear()
		.domain([0, d3.max(data, function(d){return d[price_yr]})]) 
		.range([height, 0]);	

	// call axes
	var xAxisCall = d3.axisBottom(x)
		.ticks(5)
		.tickFormat(function(d){return d3.format(",.1f")(d)});
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
		.ticks(5)
		.tickFormat(function(d){return d3.format("$,.0f")(d)});
	canvas2.append("g")
		.attr("class", "y-axis")
		.call(yAxisCall);
		
	// create legend
	var legend = canvas2.append("g")
				.attr("transform", "translate(" + (width + 60)+ "," + (height - 100)+ ")")

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
		
	// initialize first chart using update function		
	update(data, "2010", "price_");

	// add listeners for changes to year and category
	$("#input_value_age")
		.on("change", function(){
			year = document.getElementById('input_value_age')
			year = year.options[year.selectedIndex].text;
			type = document.getElementById('input_value_payment_category_age')
			type = type.options[type.selectedIndex].value
			update(data, year, type);
	});	
	
	$("#input_value_payment_category_age")
		.on("change", function(){
			year = document.getElementById('input_value_age')
			year = year.options[year.selectedIndex].text;
			type = document.getElementById('input_value_payment_category_age')
			type = type.options[type.selectedIndex].value
			update(data, year, type);
	});	

	// function to update chart contents
	function update(data, year, type) {
		
		// call inputs
		var age_yr = "age_" + year;
		var price_yr =  type + year + "-07";	
		
		// set axis limits
		if (type == "price_"){
			var max_y = 1600000;
			var labeltext = "Median Housing Price ($)";
		} else {
			var max_y = 4500;
			var labeltext = "Median Rent Price ($)";
		}
		
		// update y axis
		canvas2.selectAll('.y axis-label')
			.text(labeltext)
		
		// call new x scales
		var x = d3.scaleLinear()
			.domain([29, 40])
			.range([0, width]);
			
		var xAxisCall = d3.axisBottom(x)
		.ticks(5)
		.tickFormat(function(d){return d3.format(",.1f")(d)});
		
		canvas2.selectAll('.x-axis')
			.call(xAxisCall);

		// set new y scales
		var y = d3.scaleLinear()
				.domain([0, max_y]) 
				.range([height, 0]);	
				
		var yAxisCall = d3.axisLeft(y) // pass the scale that is proper
		.ticks(5)
		.tickFormat(function(d){return d3.format("$,.0f")(d)});
		
		canvas2.selectAll('.y-axis')
			.call(yAxisCall);
		
		// update tool tip
		tip2.html(function(d){

			var info = "<strong>City: </strong><span style='color: grey'>" + d.Geography + "</span><br /> <br />";
			info += "<strong>Median Age: </strong><span style='color: grey'>" + d3.format(",.1f")(d[age_yr]) + "</span><br /><br />";
			info += "<strong>Median Price: </strong><span style='color: grey'>" + d3.format("$,.0f")(d[price_yr]) + "</span>";

			return info;
		});		
		
		// define transition
		var t = d3.transition().duration(1000);	
		
		// create points on scatterplot
		var circles = canvas2.selectAll("circle") 
						.data(data, function(d){return d.Geography});
		

		// remove old circles
		circles.exit()
			.attr("class", "exit")
			.remove();
			
		// merge new circles	
		circles.enter()
			.append("circle")
			.attr("fill", function(d){ return regionColor(d.Geography) })
			.on("mouseover", tip2.show)
			.on("mouseout", tip2.hide)
			.merge(circles)
			.transition(t)
					.attr("cy", function(d){return y(d[price_yr])})
					.attr("cx", function(d){return x(d[age_yr])}) 
					.attr("r", 7)
					.attr("stroke", "grey")
					.attr("stroke-width", "2")
						
	}
})
