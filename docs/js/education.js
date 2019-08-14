// set global chart color palate
var palate = ['#173f5f', '#20639b','#64b5f6','#e3f2fd']

document.getElementById("edu-change-over-time").innerHTML = "";

// get variables based on inputs
var yrname = document.getElementById('input_value_edu')
var hs_yr = "hs_" + yrname.options[yrname.selectedIndex].text;
var coll_yr = "college_" + yrname.options[yrname.selectedIndex].text;

// set margins	
var margin = {left: 100, right: 120, top: 20, bottom: 100};

var width = 900 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

// create the first canvas	
var canvas = d3.select("#edu-change-over-time").append("svg")
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
	.text("Median Income ($)")

// tooltip
var tip = d3.tip().attr("class", "d3-tip")
	.html(function(d){
		
		var info = "<strong>City: </strong><span style='color: grey'>" + d.Geography + "</span><br /> <br />";
		info += "<strong>HS Proportion: </strong><span style='color: grey'>" + d3.format(",.0%")(d[hs_yr]) + "</span><br />";
		info += "<strong>Bachelor's Proportion: </strong><span style='color: grey'>" + d3.format(",.0%")(d[coll_yr]) + "</span><br />";

	return info;
});		

canvas.call(tip);

// read data to plot
d3.csv("data/hs_college_rates.csv").then(function(data){
				
	// set each non-city identifier to a numeric input			
	data.forEach(d => {
		names = d3.keys(d)
		names.slice(1).forEach(j =>
		{
			d[j] = +d[j]
		})
	})		
	
	// create y scale
	var y = d3.scaleLinear()
			.range([height, 0])	
	
	// create x scales
	var x = d3.scaleBand()
		.range([0, width])
	
	var x1 = d3.scaleBand()
	
	// create color scale
	var regionColor = d3.scaleOrdinal(d3.schemePaired);
	
	// create legend
	var legend = canvas.append("g")
						.attr("transform", "translate(" + (margin.left + width + 10) + "," + (height - 50) + ")")
						.attr("width", 20)
		
	var metrics = ["High School", "Bachelor's Degree"];
	
	metrics.forEach(function(metric, i){
		
	var legendRow = legend.append("g")
		.attr("transform", "translate(0," + (i * 20) + ")")
	
	legendRow.append("rect")
		.attr("width", 10)
		.attr('height', 10)
		.attr("fill", regionColor(i))
		
	legendRow.append("text")
		.attr("x", - 10)
		.attr("y", 10)
		.attr("text-anchor", "end")
		.style("text-transform", "capitalize")
		.style("font-size", '10px')
		.text(metric)
	}) 
	
					
	// adding in the y axis	
	var yAxisCall = d3.axisLeft(y)
		.ticks(4)
	.tickFormat(function(d){return d3.format(",.0%")(d)});
	canvas.append("g")
		.attr("class", "y-axis")
		.call(yAxisCall);

	// update chart	
	update(data, "2010");
	
	// add listener
	$("#input_value_edu")
		.on("change", function(){
			year = document.getElementById('input_value_edu')
			year = year.options[year.selectedIndex].text;
			update(data, year);
	});	

	function update(data, year) {
		
		// remove old contents
		$('.bargroup').remove()
		$('.x-axis').remove()
		
		// initialize variables
		var hs_yr = "hs_" + year;
		var coll_yr = "college_" + year

		var keys = [hs_yr, coll_yr]
			
		// redefine scales	
		y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]).n
		x.domain(data.map(function(d){return d.Geography}))
					.range([0,width])
					.paddingInner(0.2)
		x1.domain(keys)
				.range([0, x.bandwidth()])
				.padding(0.1);			
				
		var regionColor = d3.scaleOrdinal(d3.schemePaired);
		
		// define transition
		var t = d3.transition().duration(1000);	
		
		// create bars
		var bars = canvas.selectAll("canvas") 
			.data(data)
			
		var enter = bars.enter()
			.append("g")
			.attr("class", "bargroup")
			
		bars = enter
			.on("mouseover", tip.show)
			.on("mouseout", tip.hide)
			.merge(bars)
			.attr("transform", function(d) { return "translate(" + x(d.Geography) + ",0)"; })
		
		var rect = bars.selectAll("rect")
				.data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
				
			rect.enter()
				.append("rect")
				.merge(rect)
				.transition(t)
					.attr("x", function(d) { return x1(d.key); })
					.attr("y", function(d) { return y(d.value); })
					.attr("width", x1.bandwidth())
					.attr("height", function(d) { return height - y(d.value); })
					.attr("fill", function(d) { return regionColor(d.key); });
		
		// update x axis with new contents
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
			
		// update tooltip 	
		tip.html(function(d){

			var info = "<strong>City: </strong><span style='color: grey'>" + d.Geography + "</span><br /> <br />";
				info += "<strong>High School Graduation Rate: </strong><span style='color: grey'>" + d3.format(",.0%")(d[hs_yr]) + "</span><br /><br />";
				info += "<strong>Bachelor's Degree Attainment Rate: </strong><span style='color: grey'>" + d3.format(",.0%")(d[coll_yr]) + "</span><br />";
			return info;
		});		
		}	

	})

/* 
	------------------------------------------ 
	
	Comparing income vs home and rental prices

	------------------------------------------
*/

// remove previous contents
//document.getElementById("education-vs-payment").innerHTML = "";

// get variables based on inputs
var yrname = document.getElementById('input_value_edu')
var paytype = document.getElementById('input_value_payment_category_edu')
var edutype = document.getElementById('input_value_education_category')
edutype = edutype.options[edutype.selectedIndex].value;
var edu_yr = edutype + yrname.options[yrname.selectedIndex].text;
var price_yr =  paytype.options[paytype.selectedIndex].value + yrname.options[yrname.selectedIndex].text + "-07";
var category = paytype.options[paytype.selectedIndex].text

// set margins
var margin = {left: 100, right: 20, top: 20, bottom: 100};

var width = 800 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;
	
// create canvas
var canvas2 = d3.select("#education-vs-payments").append("svg")
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
	.text("Attainment Rate (%)")

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
		info += "<strong>Attainment Rate: </strong><span style='color: grey'>" + d3.format(",.1%")(d[edu_yr]) + "</span><br /><br />";
		info += "<strong>Median Price: </strong><span style='color: grey'>" + d3.format("$,.0f")(d[price_yr]) + "</span>";

	return info;
});		

canvas2.call(tip2)

// read data
d3.csv("data/edu_data.csv").then(function(data){
	
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
		.domain([0, d3.max(data, function(d){return d[edu_yr]})]) 
		.range([0, width]);

	var y = d3.scaleLinear()
		.domain([0, d3.max(data, function(d){return d[price_yr]})]) 
		.range([height, 0]);	

	// draw axes
	var xAxisCall = d3.axisBottom(x)
		.ticks(5)
		.tickFormat(function(d){return d3.format(",.1%")(d)});
	canvas2.append("g")
		.attr("class", "x-axis2")
		.attr("transform", "translate(0, " + (height) + ")")
		.call(xAxisCall)
	.selectAll("text")
		.attr("y", "10")
		.attr("x", "0")
		
	var yAxisCall = d3.axisLeft(y) 
		.ticks(5)
		.tickFormat(function(d){return d3.format("$,.0f")(d)});
	canvas2.append("g")
		.attr("class", "y-axis")
		.call(yAxisCall);
		
	// legend
	var legend = canvas2.append("g")
				.attr("transform", "translate(" + (width - 10)+ "," + (height -100)+ ")")

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
	update(data, "2010", "price_", "hs_");

	// add listeners
	$("#input_value_edu")
		.on("change", function(){
			year = document.getElementById('input_value_edu')
			year = year.options[year.selectedIndex].text;
			type = document.getElementById('input_value_payment_category_edu')
			type = type.options[type.selectedIndex].value;
			edu_type = document.getElementById('input_value_education_category')
			edu_type = edu_type.options[edu_type.selectedIndex].value;
			update(data, year, type, edu_type);
	});	
	
	$("#input_value_payment_category_edu")
		.on("change", function(){
			year = document.getElementById('input_value_edu')
			year = year.options[year.selectedIndex].text;
			type = document.getElementById('input_value_payment_category_edu')
			type = type.options[type.selectedIndex].value;
			edu_type = document.getElementById('input_value_education_category')
			edu_type = edu_type.options[edu_type.selectedIndex].value;
			update(data, year, type, edu_type);
	});	
	
	$("#input_value_education_category")
		.on("change", function(){
			year = document.getElementById('input_value_edu')
			year = year.options[year.selectedIndex].text;
			type = document.getElementById('input_value_payment_category_edu')
			type = type.options[type.selectedIndex].value;
			edu_type = document.getElementById('input_value_education_category')
			edu_type = edu_type.options[edu_type.selectedIndex].value;
			update(data, year, type, edu_type);
	});	

	// function to update data
	function update(data, year, type, edu_type) {
		
		// initialize variables
		var edu_yr = edu_type + year;
		var price_yr =  type + year + "-07";	
		
		// determine axis limits based on selections
		if (type == "price_"){
			var max_y = 1600000;
			var labeltext = "Median Housing Price ($)";
		} else {
			var max_y = 4500;
			var labeltext = "Median Rent Price ($)";
		}
		
		if(edu_type == "hs_") {
			var max_x = 1.25;
		} else {
			var max_x = 1;
		}
		
		// x scale
		var x = d3.scaleLinear()
			.domain([0, max_x]) 
			.range([0, width]);
			
		var xAxisCall = d3.axisBottom(x)
		.ticks(5)
		.tickFormat(function(d){return d3.format(",.0%")(d)});
		
		// call new x axis
		canvas2.selectAll('.x-axis2')
			.call(xAxisCall);
		
		// set y scale based on selection
		var y = d3.scaleLinear()
				.domain([0, max_y]) 
				.range([height, 0]);	
				
		var yAxisCall = d3.axisLeft(y) // pass the scale that is proper
		.ticks(5)
		.tickFormat(function(d){return d3.format("$,.0f")(d)});
		
		// call new y axis
		canvas2.selectAll('.y-axis')
			.call(yAxisCall);
		
		// update tooltip
		tip2.html(function(d){

			var info = "<strong>City: </strong><span style='color: grey'>" + d.Geography + "</span><br /><br />";

			info += "<strong>Attainment Rate: </strong><span style='color: grey'>" + d3.format(",.1%")(d[edu_yr]) + "</span><br /><br />";

			info += "<strong>Median Price: </strong><span style='color: grey'>" + d3.format("$,.0f")( d[price_yr]) + "</span>";

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
			.on("mouseover", tip2.show)
			.on("mouseout", tip2.hide)
			.merge(circles)
			.transition(t)
					.attr("cy", function(d){return y(d[price_yr])})
					.attr("cx", function(d){return x(d[edu_yr])}) 
					.attr("r", 7)
					.attr("stroke", "grey")
					.attr("stroke-width", "2")
						
	} // end update function
})
