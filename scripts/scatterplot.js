var Scatterplot = function(anthologies, aboutView, periodicals ){
	plot = this;
	this.about = aboutView;
	this.mapping = "relative_total.csv";
	this.periodicals = periodicals;
	this.anthologies = anthologies;

	this.currentClicked = null;
	this.currentGlyphs = [];
	
	this.maxSize = d3.max(this.anthologies, function(d){
	 	return +d.storyNumber;
	 })
	this.maxKeyword = d3.max(this.anthologies, function(d){
		return d.max;
	})

	this.details = new DetailView();
	this.glyphComp = new GlyphCompare(plot);
	

	this.dataset = [];
	for(i = 0; i < this.anthologies.length; i++){
		this.dataset.push(this.createRadarData(i));
	}
	this.draw();
}

Scatterplot.prototype.draw = function(){
	this.padding = 75;
	this.margin = {top: 30, right: 20, bottom: 35, left: 20};
	this.width = parseInt(d3.select('html').style('width'), 10) * .75;
	this.height = parseInt(d3.select('html').style('height'), 10) - 20;
	this.createScales();
	this.createZoom();
	svg = d3.select("body")
			.append("div")
				.classed("svg-container", true)
				.attr("width", plot.width)
				.attr("height", plot.height)
			.append("svg")
				.classed("svg-content", true)
				.attr("width", plot.width)				
				.attr("height", plot.height)
				.call(plot.zoom);

	container = svg.append("g").classed("container", true);
	this.chart = RadarChart.chart();

	this.chart.config({axisText: false, levels: 0, circles: false, minValue: -3, maxValue: plot.maxSize, transitionDuration: 1000});
	
	this.drawAll();

	this.tooltip = new Tooltip(this.zoom);
	
	d3.selectAll("button[data-zoom]")
    	.on("click", plot.zoomClicked);

    d3.selectAll("#filter-button")
    	.on("click", function() {plot.periodicals.toggleDropdown(); });
    d3.select('#about-btn')
    	.on("click", function(){plot.showAbout();});
}

Scatterplot.prototype.drawAll = function(){
	this.createScales();
	for(var i = 0; i < this.dataset.length; i++){
		var index = getAnthologyIndexByTitle(this.dataset[i][0].className, this.anthologies);
		var classed = 'g#a' + this.anthologies[index].anthologyID;
		var scaleSize = plot.scaleSize(plot.anthologies[index].storyNumber);
		plot.chart.config({w: scaleSize, h: scaleSize, maxValue: plot.anthologies[index].storyNumber});
		if(this.currentGlyphs.includes(this.anthologies[index].anthologyTitle) ){
			var maxAxis = d3.max(this.dataset[i][0]["axes"], function(d){
	 			return +d.value;
	 		});
	 		plot.chart.config({maxValue: maxAxis});
		}
			
		this.renderChart([this.dataset[i]], null, null, classed, index);		
	}
}

Scatterplot.prototype.renderChart = function(dataset, transform, style, givenID, index){
	var charts = d3.select('g.container').selectAll(givenID).data(dataset);	
	charts.exit().remove();
	charts.enter().append('g')
		.classed('game',true)
		.each(function(d){
			d3.select(this).attr("id", "a" + plot.anthologies[index].anthologyID);
		});
	charts.transition().duration(1500).attr('transform', function(d, i){
			if(transform){return transform};
			return ('translate(' + plot.centerPosition(index) +')');
		})
		.call(plot.chart);

	charts.select('.area')
			.style('fill', function(d, i){if(style) {return style;} return plot.getFillColor(index);})
			.style('stroke', function(d, i){return plot.getStrokeColor()})
			.on("click", function(d) {plot.clicked(d, this)})
			.on('mouseover', function(d) {
				plot.tooltip.createTooltip(d[0].className, this.parentNode);
				d3.select(this).classed('focused', true);
			})
			.on('mouseout', function(d){
				d3.select(this).classed('focused', false);
				plot.tooltip.remove();
			});
	return charts;
}

Scatterplot.prototype.centerPosition = function(index){
	var scaleSize = this.scaleSize(this.anthologies[index].storyNumber);
	var xPos = this.xScale(this.anthologies[index].coords[0]);
	var yPos = this.yScale(this.anthologies[index].coords[1]);

	return (xPos - scaleSize/2) + "," + (yPos - scaleSize/2);
}

Scatterplot.prototype.createGlyph = function(anthology){

	this.currentGlyphs.push(anthology.className);

	var index = getAnthologyIndexByTitle(anthology.className, this.anthologies);
	var glyphData = this.createGlyphData(index), classed = 'g#a' + this.anthologies[index].anthologyID, style, transform, points;
	this.dataset[index] = glyphData;

	var maxAxis = d3.max(glyphData[0]["axes"], function(d){
	 	return +d.value;
	 });
	var scaleSize = this.scaleSize(this.anthologies[index].storyNumber);
	this.chart.config({w: scaleSize, h: scaleSize, maxValue: maxAxis, minValue: 0});
	
	var charts = d3.select('g.container').selectAll(classed);
	charts.each(function(d){
			style = d3.select(this).select('.area').style('fill');	
			transform = d3.select(this).attr('transform');	
		});
	this.renderChart([glyphData], transform, style, classed, index);

	this.glyphComp.add(glyphData, style, maxAxis);
}

Scatterplot.prototype.scaleSize = function(storyNumber){
	var scaleAmt = d3.scale.linear()
						.domain([1, this.maxSize])
						.range([10, 70]);
	return scaleAmt(storyNumber);
}

Scatterplot.prototype.hideGlyph = function(anthology){
	var gIndex = this.currentGlyphs.indexOf(anthology.className);
	if(gIndex > -1 ){
		this.currentGlyphs.splice(gIndex, 1)
	}

	var index = getAnthologyIndexByTitle(anthology.className, this.anthologies);
	var radarData = this.createRadarData(index), classed = 'g#a' + this.anthologies[index].anthologyID, style, transform;

	this.dataset[index] = radarData;

	var scaleSize = this.scaleSize(this.anthologies[index].storyNumber);
	this.chart.config({w: scaleSize, h: scaleSize, maxValue: plot.anthologies[index].storyNumber});
	d3.select('g.container')
		.select(classed)
		.each(function(d){
			style = d3.select(this).select('.area').style('fill');
			transform = d3.select(this).attr('transform');
		})
	this.renderChart([radarData], transform, style, classed, index)
	this.glyphComp.removeData(radarData);
}

Scatterplot.prototype.createGlyphData = function(i){
		return [{
			className: this.anthologies[i].anthologyTitle,
			axes: [
				{axis: "Ultimates", value: this.anthologies[i].branchSpread[0]+1},
				{axis: "Physics/chemistry", value: this.anthologies[i].branchSpread[1]+1, xOffset: -20},
				{axis: "Astronomy/Astrophysics", value: this.anthologies[i].branchSpread[2]+1, yOffset: 5},
				{axis: "Geology and Geography", value: this.anthologies[i].branchSpread[3]+1, xOffset: -7},
				{axis: "Biology", value: this.anthologies[i].branchSpread[4]+1, xOffset: -5},
				{axis: "Mankind", value: this.anthologies[i].branchSpread[5]+1, xOffset: 10},
				{axis: "Technology", value: this.anthologies[i].branchSpread[6]+1},
				{axis: "Miscellaneous", value: this.anthologies[i].branchSpread[7]+1},
				{axis: "Supernatural", value: this.anthologies[i].branchSpread[8]+1, xOffset: 20}
			]
		}]
}

Scatterplot.prototype.createRadarData = function(i){
	return [{
			className: this.anthologies[i].anthologyTitle,
			axes: [
				{axis: "Ultimates", value: this.anthologies[i].storyNumber},
				{axis: "Physics/chemistry", value: this.anthologies[i].storyNumber},
				{axis: "Astronomy/Astrophysics", value: this.anthologies[i].storyNumber},
				{axis: "Geology and Geography", value: this.anthologies[i].storyNumber},
				{axis: "Biology", value: this.anthologies[i].storyNumber},
				{axis: "Mankind", value: this.anthologies[i].storyNumber, xOffset: 10},
				{axis: "Technology", value: this.anthologies[i].storyNumber},
				{axis: "Miscellaneous", value: this.anthologies[i].storyNumber},
				{axis: "Supernatural", value: this.anthologies[i].storyNumber}
			]
		}];
}

Scatterplot.prototype.createScales = function(){
	this.xScale = d3.scale.linear()
					.domain([d3.min(plot.anthologies, function(d){return d.coords[0];}),
					 	d3.max(plot.anthologies, function(d){return d.coords[0];})])
					.range([plot.padding, plot.width - plot.padding * 2]);
	this.yScale = d3.scale.linear()
					.domain([d3.min(plot.anthologies, function(d){return d.coords[1];}),
					 	d3.max(plot.anthologies, function(d){return d.coords[1];})])
					.range([plot.height - plot.padding, plot.margin.bottom]);
}


Scatterplot.prototype.createZoom = function(){
	this.zoom = d3.behavior.zoom()
	    .x(plot.xScale)
	    .y(plot.yScale)
	    .scaleExtent([1, 10])
	    .center([plot.width / 2, plot.height / 2])
	    .size([plot.width, plot.height])
	    .on("zoom", zoomed);

	function zoomed() {
	 	container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	}
}

Scatterplot.prototype.clicked = function(d, shape){
	if(Array.isArray(d)){d = d[0];}
	if(!plot.currentGlyphs.includes(d.className)){		
		plot.createGlyph(d);
	}else if(plot.currentClicked === shape.parentNode){
		plot.hideGlyph(d);
	}
	if(plot.currentClicked != shape.parentNode){
		d3.select(plot.currentClicked).classed('clicked', false);
		plot.currentClicked = shape.parentNode;
		d3.select(plot.currentClicked).classed('clicked', true)
			.moveToFront();
		plot.showDetails(d);
	}else{
		d3.select(plot.currentClicked).classed({'clicked': false});
		plot.details.hide();
		plot.currentClicked = null;
	}
}

Scatterplot.prototype.showDetails = function(d){
	plot.details.hide();
	var index = getAnthologyIndexByTitle(d.className, plot.anthologies);
	plot.details.show(plot.anthologies[index]);
}

Scatterplot.prototype.zoomClicked = function(){
	zoom = plot.zoom;
	svg.call(zoom.event); // https://github.com/mbostock/d3/issues/2387
	// Record the coordinates (in data space) of the center (in screen space).
	var center0 = zoom.center();
	var translate0 = zoom.translate();
	var coordinates0 = plot.coordinates(center0);
	zoom.scale(zoom.scale() * Math.pow(2, +this.getAttribute("data-zoom")));
	// Translate back to the center.
	var center1 = plot.point(coordinates0);
	zoom.translate([translate0[0] + center0[0] - center1[0], translate0[1] + center0[1] - center1[1]]);
	svg.transition().duration(750).call(zoom.event);
}

Scatterplot.prototype.coordinates = function(point){
	  var scale = zoom.scale(), translate = zoom.translate();
	  return [(point[0] - translate[0]) / scale, (point[1] - translate[1]) / scale];
}

Scatterplot.prototype.point = function(coordinates) {
	  var scale = zoom.scale(), translate = zoom.translate();
	  return [coordinates[0] * scale + translate[0], coordinates[1] * scale + translate[1]];
}

Scatterplot.prototype.showAbout = function(){
	var aboutView = d3.select(".about");
	if(aboutView[0][0]){
		this.about.remove();
	}else{
		this.about.show(this.mapping);
	}
}

Scatterplot.prototype.getFillColor = function(index){
		var rgb = this.anthologies[index].cover.color1;
		var color = d3.rgb(rgb[0], rgb[1], rgb[2]);
		return color;
}

Scatterplot.prototype.getStrokeColor = function(){
		return "DimGrey";
}
