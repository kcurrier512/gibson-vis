/* Compare glyphs on same axes. In bottom left corner */
var GlyphCompare = function(plot){
	obj = this;
	this.div = d3.select('body').append('div').attr('id', "glyph-compare");
	this.dataset = []; //Branch data
	this.dataID = []; //Associates data with glyph id; corresponds with this.dataset
	this.key = 0; //Number of current glyphs. Used to match this.dataset and this.dataID
	this.tabSVG = this.div.append('svg').attr("height", 25).classed('tabs', true);
	this.svg = this.div.append('div').classed('glyph-outline', true).append("svg").attr("viewBox", "0 0 200 200");
	this.maxList = [];
	this.chart = RadarChart.chart();
	var	cfg = this.chart.config();
	this.chart.config({w: 200, h: 200, levels: 0, circles: false, radius: 1, axisText: true, minValue: 0, maxValue: plot.maxKeyword, transitionDuration: 1000});
	obj.createLabels();
	obj.interaction();
}

/* Create an empty glyph to have labels appear behind glyphs*/
GlyphCompare.prototype.createLabels = function(){
	var d = [{
			axes: [
				{axis: "Ultimates", value: 0},
				{axis: "Physics/chemistry", value: 0, xOffset: -20},
				{axis: "Astronomy/Astrophysics", value: 0},
				{axis: "Geology/Geography", value: 0, xOffset: -7},
				{axis: "Biology", value: 0, xOffset: -5},
				{axis: "Mankind", value: 0, xOffset: 10},
				{axis: "Technology", value: 0},
				{axis: "Miscellaneous", value: 0},
				{axis: "Supernatural", value: 0, xOffset: 20}
			]
		}];
	var comp = this.svg.selectAll('g.labels')
		  .data([d])
	comp.enter()
		.append('g')
		.classed('labels', true)
		.style('font-size', "10px")
		.call(this.chart);
	/* Set config settings for real glyphs created by data */ 	
	this.chart.config({ axisText: false, circles: true})
}

/* Add a glyph to compare */
GlyphCompare.prototype.add = function(newData, style, max) {
	var color;
	this.maxList.push(max);
	this.key++;
	this.dataID.push({
	 	key: "a" + obj.correspondingAnthology(newData).anthologyID,
	 	value: newData
	});
	this.dataset.push(newData);
	var comp = this.draw();

	
	
	this.drawTabs();
}


GlyphCompare.prototype.setAreaAttributes = function(comp){
	//LATER ADD COLOR TO DATAID 
	comp.select('.area')
		.style('fill', function(d){ 
			var i = getAnthologyIndexByTitle(d[0].className, plot.anthologies)
			color = plot.getFillColor(i)
			return color;
		})
		.style('stroke', function(d){
			var i = getAnthologyIndexByTitle(d[0].className, plot.anthologies)
			return plot.getFillColor(i);})

		.on("dblclick", function(d){
			obj.removeGlyph(this, d);
		})
		.on("click", function(d){
			obj.clicked(this, d);
		})
		.on("mouseover", function(d){
			obj.correspondingGlyph(this, d, true);
			var anth = obj.correspondingAnthology(d);
			plot.tooltip.createTooltip(d[0].className, d3.select('g.game#a' + anth.anthologyID)[0][0]);
		})
		.on("mouseout", function(d){
			obj.correspondingGlyph(this, d);
			plot.tooltip.remove();
		});


	comp.selectAll('.circle')
		.style('fill', function(d){
			var color;
			//Get color by finding corresponding glyph in mds and aquire appropriate color
			d3.select(this.parentNode.parentNode).each(function(dd){
				var i = getAnthologyIndexByTitle(dd[0].className, plot.anthologies);
				color = plot.getFillColor(i);
			})
			return color;
		})
}

GlyphCompare.prototype.drawTabs = function(){
	var tab = obj.tabSVG.selectAll('rect.tab')
		.data(this.dataID, function(d){return d.key});
	tab.enter()
		.append('rect')
		.classed('tab', true)
		.attr('height', 25)
		.attr('width', 25)
		.attr('id', function(d){
			d.key;
		})
		.attr('transform', function(d, i) {return 'translate(' + 27 * i  + ',0)'})
		.on('dblclick', function(d){
			obj.removeGlyph(null, d);
		})
		.on('mouseover', function(d){
			plot.tooltip.createTooltip(d.value[0].className, d3.select('g.game#' + d.key)[0][0]);
			d3.select('g.compare#' +d.key).moveToFront();
		})
		.on('mouseout', function(){
			plot.tooltip.remove();
		})
		.style('fill', function(d){
			var i = getAnthologyIndexByTitle(d.value[0].className, plot.anthologies)
			return plot.getFillColor(i);
		});
	tab.exit().remove();
}

GlyphCompare.prototype.removeData = function(glyphData){
	var results =  this.search(glyphData[0].className);
	if(results[0] != -1){
		this.dataset.splice(results[1], 1);
		this.dataID.splice(results[1], 1);
		this.maxList.splice(results[1], 1);
		this.svg.selectAll('g.compare').remove();
		this.tabSVG.selectAll('rect.tab').remove();
		this.draw();
		this.drawTabs();
	}
}

GlyphCompare.prototype.removeGlyph = function(glyph, d){
	if(!glyph){
		obj.correspondingGlyph(d3.select('g.compare#' +d.key).select('.area')[0][0], d.value);
		obj.removeData(d.value);
		plot.hideGlyph(d.value[0]);	
	}else{
		obj.correspondingGlyph(glyph, d); 
		obj.removeData(d); 
		plot.hideGlyph(d[0]);
	}
	plot.details.hide();
	plot.tooltip.remove();
	plot.currentClicked = null;
}

GlyphCompare.prototype.draw = function(){
	var max = d3.max(this.maxList);

	this.chart.config({maxValue: max})
	
	var comp = this.svg.selectAll('g.compare')
		  .data(this.dataset);

	comp.enter()
		.append('g')
		.classed('compare', true)
		.attr('id', function(d){
			return obj.search(d[0].className)[0];
		}).transition();
	comp.exit().remove();
	comp.call(this.chart);
	this.setAreaAttributes(comp);
}

GlyphCompare.prototype.search = function(className){
	var key = -1, index = null;
	for(i = 0; i < this.dataset.length; i++){
		if(this.dataset[i][0].className === className){
			key = this.dataID[i].key;
			index = i;
		}
	}
	return [key, index];
}

/* Set corresponding mds glyph to 'clicked,' show details*/
GlyphCompare.prototype.clicked = function(polygon, glyphData){
	d3.select('g.container').selectAll('g').classed('clicked', false);

	var anthologyID = obj.search(glyphData[0].className)[0];
	var glyph = d3.select('g.container').select('g#' + anthologyID);

	glyph.classed('clicked', true);
	plot.showDetails(glyphData[0]);
	plot.currentClicked = glyph[0][0];
}


/* Set the corresponding anthology in the MDS  to either be appear as hovered over */
GlyphCompare.prototype.correspondingGlyph = function(polygon, glyphData, show=false){
	var anthologyID = obj.search(glyphData[0].className)[0];
	var glyph = d3.select('g.container').select('g#' + anthologyID);
	if(show){
		d3.select(polygon).classed('focused', true)
		glyph.classed("focus", true);
		glyph.select('.area').classed("focused", true)
	}else{
		d3.select(polygon).classed('focused', false)
		glyph.classed("focus", false)
		glyph.classed('clicked', false)
		glyph.select('.area').classed("focused", false)
	}
}

/* Returns the anthology object of a given glyph */
GlyphCompare.prototype.correspondingAnthology = function(glyph){
	if(Array.isArray(glyph)){
		glyph = glyph[0]
	}
	return plot.anthologies[getAnthologyIndexByTitle(glyph.className, plot.anthologies)];
}


/* Uses the jquery UI library */
GlyphCompare.prototype.interaction = function(){
	(function($){
		$(document).ready( function() { 
			$(".glyph-outline").resizable({
				handles: "e",
				minHeight: 200,
				aspectRatio: true
			});
			$("#glyph-compare").draggable({
				axis: 'y',
				stop: function(event, ui){
					obj.position= ui.position.top;
				},
				containment: "parent"
			});
		});
	})(jQuery);
}