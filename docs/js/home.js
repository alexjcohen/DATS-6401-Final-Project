// set global chart color palate
var palate = ['#173f5f', '#20639b','#64b5f6','#e3f2fd'] // blues

function rentHousingOverview(chartarea) {
	
	var year = document.getElementById('input_value_house_rent')
	var rent_yr = "rent_" + year.options[year.selectedIndex].text + "-07";
	var house_yr = "price_" + year.options[year.selectedIndex].text + "-07";
	var pop_yr = "POPESTIMATE" + year.options[year.selectedIndex].text;

	
	// create margin and canvas dimensions	
	var margin = {left: 100, right: 20, top: 20, bottom: 100};

	var width = 800 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;
		
	var canvas = d3.select(chartarea)
		.append("svg")
			.attr("height", height + margin.top + margin.bottom)
			.attr("width", width + margin.left + margin.right)
		.append("g")
			.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

	// x label
	canvas.append("text")
	    .attr("class", "x axis-label")
		.attr("x", width / 2)
		.attr("y", height + (margin.bottom / 2) + 20)
		.attr("font-size", "14px")
		.attr("text-anchor", "middle")
		.text("Median Home Price ($)")

	// y label
	canvas.append("text")
		.attr("class", "y axis-label")
		.attr("x", -(height/2))
		.attr("y", -60)
		.attr("font-size", "14px")
		.attr("text-anchor", "middle")
		.attr("transform", "rotate(-90)")
		.text("Median Monthly Rent ($)")
	
	// Title
	canvas.append("text")
		.attr("class", "Title")
		.attr("x", (width/2))
		.attr("y", -(margin.top / 2))
		.attr("font-size", "14px")
		.style("text-decoration", "underline")
		.attr("text-anchor", "middle")
		.text("Median Home Price vs Monthly Rent")
		
	// Initialize the X axis
	var x = d3.scaleLinear()
	  .range([ 0, width ])
	var xAxis = canvas.append("g")
	  .attr("transform", "translate(0," + height + ")")
	  .attr("class", "myXaxis")

	// Initialize the Y axis
	var y = d3.scaleLinear()
	  .range([ height, 0]);
	var yAxis = canvas.append("g")
	  .attr("class", "myYaxis")
 
	// create scales
	var y = d3.scaleLinear()
				.domain([0, 5000]) 
				.range([height, 0]);
	
	var x = d3.scaleLinear()
				.domain([0, 1300000])
				.range([0,width])
								
	var regionColor = d3.scaleOrdinal().range(palate);
	
	// legend
	var legend = canvas.append("g")
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
	
	
	// adding in the axes
	var xAxisCall = d3.axisBottom(x)
		.ticks(5)
		.tickFormat(function(d){return d3.format("$,.0f")(d)});
	canvas.append("g")
		.attr("class", "x-axis")
		.attr("transform", "translate(0, " + (height) + ")")
		.call(xAxisCall)
	.selectAll("text")
		.attr("y", "10")
		.attr("x", "-5")
		.attr("text-anchor", "end")
		.attr("transform", "rotate(-30)");
		
	var yAxisCall = d3.axisLeft(y) // pass the scale that is proper
		.ticks(5)
		.tickFormat(function(d){return d3.format("$,.0f")(d)});
	canvas.append("g")
		.attr("class", "y-axis")
		.call(yAxisCall);
		
	// Tool Tip
	var tip = d3.tip().attr("class", "d3-tip")
	.html(function(d){
		
		var info = "<strong>City: </strong><span style='color: grey'>" + d.city + "</span><br /> <br />";
		info += "<strong>Population: </strong><span style='color: grey'>" + d3.format(",.0f")(d[pop_yr]) + "</span><br /></br>";
		info += "<strong>Median Housing Price: </strong><span style='color: grey'>" + d3.format("$,.0f")(d[house_yr]) + "</span><br /></br>";
		info += "<strong>Median Apartment Rent: </strong><span style='color: grey'>" + d3.format("$,.0f")(d[rent_yr]) + "</span>";
	
	return info;
	});		
	
	canvas.call(tip);
		
	// Call data
	d3.csv("data/housing_rent_pop.csv").then(function(data){	
		data.forEach(d => {
			names = d3.keys(d)
			names.slice(2).forEach(j =>
			{
				d[j] = +d[j]
			})
		})		

		// initialize variables based on selector input
		var year = document.getElementById('input_value_house_rent')
				
		update(data);
				
		$("#input_value_house_rent")
			.on("change", function(){
				year = document.getElementById('input_value_house_rent')
				update(data, year);
		});
		
		
		// function to update data
		function update(data) {
			
			var income_yr = "income_" + year.options[year.selectedIndex].text;
			var rent_yr = "rent_" + year.options[year.selectedIndex].text + "-07";
			var house_yr = "price_" + year.options[year.selectedIndex].text + "-07";
			var pop_yr = "POPESTIMATE" + year.options[year.selectedIndex].text;
			
			var area = d3.scaleLinear()
					.domain([d3.min(data, function(d){return d[pop_yr]}), d3.max(data, function(d){return d[pop_yr]})])
					.range([25*Math.PI, 250*Math.PI])

			var t = d3.transition().duration(1000);
			
			
			var circles = canvas.selectAll("circle") 
							.data(data, function(d){return d.city});
			

			
			tip.html(function(d){
		
				var info = "<strong>City: </strong><span style='color: grey'>" + d.city + "</span><br /></br>";
				
				info += "<strong>Population: </strong><span style='color: grey'>" + d3.format(",.0f")(d[pop_yr]) 	+ "</span><br /></br>";
				
				info += "<strong>Median Housing Price: </strong><span style='color: grey'>" + d3.format("$,.0f")(	d[house_yr]) + "</span><br /></br>";
				
				info += "<strong>Median Apartment Rent: </strong><span style='color: grey'>" + d3.format("$,.0f")(d[rent_yr]) + "</span>";
	
				return info;
				});		
			
			circles.exit()
				.attr("class", "exit")
				.remove();
				
			circles.enter()
				.append("circle")
				.attr("fill", function(d){ return regionColor(d.region) })
					.on("mouseover", tip.show)
					.on("mouseout", tip.hide)
					.merge(circles)
					.transition(t)
						.attr("cy", function(d){return y(d[rent_yr])})
						.attr("cx", function(d){return x(d[house_yr])}) 
						.attr("r", function(d){ return Math.sqrt(area(d[pop_yr])/Math.PI) })
						.attr("stroke", "grey")
						.attr("stroke-width", "2")
									

		}
	})
	
} 

// call functions and update them on change
rentHousingOverview("#rent-housing-data-chart");
