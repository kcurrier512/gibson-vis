var Periodicals = function(anthologies, periodicalObjects, tagCloud){
	per = this;
	this.tagCloud = tagCloud;
	this.anthologies = anthologies;
	this.periodicalObjects = periodicalObjects;   
	this.filterContent = d3.select('.filter').classed({'shown': true}).append("div").attr('id','filter-content').classed({'shown': true});
	this.selected = [];
	this.maxPeriodical = d3.entries(this.periodicalObjects).sort(function(a, b){
		return d3.descending(a.value.anthologies.length, b.value.anthologies.length)
	})[0];

	this.createDropdown();

	d3.select(".filter").append("div").attr("id", "unfiltered-list");
	

	this.createUnfilteredList(true);
	d3.select("#unfiltered-list").moveToBack();

	d3.select(".allPeriodicals").on("change", function(){
		d3.select("#unfiltered-list").style("display", "block");
		var toggle = this.checked;
		$(".checkbox").prop("checked", toggle);
		per.selected.length = 0;
		if(toggle){
			for(var i = 0; i < per.periodicalObjects.length; i++){
				per.selected.push(per.periodicalObjects[i].periodical_id);
			}
		}
		per.correspondingGlyphs(toggle);
		tagCloud.makeTagCloud(per.selected);
		per.createUnfilteredList(toggle);
	})

	d3.selectAll(".checkbox").on("change", function(){
		var allPeriodicals = false;
		d3.select("#unfiltered-list").style("display", "block");
		if(this.checked){
			per.selected.push(this.id);
		}else{
			per.selected.splice(per.selected.indexOf(this.id), 1)
		}
		per.correspondingGlyphs(this.checked);
		tagCloud.makeTagCloud(per.selected);
		if(per.selected.length == per.periodicalObjects.length){
			allPeriodicals = true;
		}
		per.createUnfilteredList(allPeriodicals);
		per.redrawFilteredList();
	})
}

Periodicals.prototype.createUnfilteredList = function(allPeriodicals){
	if(allPeriodicals){
		var unfilteredList = d3.select("#unfiltered-list");
		unfilteredList.selectAll("p").remove();
		unfilteredList.append("p").classed("all", true).text("All Periodicals").style("font-size", "19px");
	}else{
		d3.select("p.all").remove();
		var unfilteredList = d3.select("#unfiltered-list").selectAll("p").data(this.selected);
		unfilteredList.enter().append("p");
		unfilteredList.text(function(d){
			return per.attributeFromID(d, "periodical_title");
		})
		unfilteredList.transition().style("font-size", function(d){
			var anths = per.attributeFromID(d, "anthologies");
			return per.getFontSize(anths, per.maxPeriodical.value.anthologies.length)
		})
		unfilteredList.exit().remove();
	}
}

Periodicals.prototype.redrawFilteredList = function(){
	if(this.selected.length == 0){
		d3.select("#filter-content").selectAll("span").style("display", "inline-block");
	}else{
			var anthTitles, relevantPeriodicals = [], list;
	this.selected.forEach(function(id){
		anthTitles = per.attributeFromID(id, "anthologies");
	});
	anthTitles.forEach(function(title){
		list = per.periodicalsFromAnthology(title)
		list.forEach(function(item){
			relevantPeriodicals.push("a" + item);
		})
	});

	d3.select("#filter-content").selectAll("span").style("display", "none");
	
	relevantPeriodicals.forEach(function(periodical){
		d3.selectAll("span#" + periodical).style("display", "inline-block");
	})
	}

}

Periodicals.prototype.fillFilteredList = function(){
	d3.select("#filter-content").selectAll("span").style("display", "inline-block");
}

Periodicals.prototype.attributeFromID = function(givenID, attribute){
	var nest = d3.nest()
				.key(function(d){return d.periodical_id})
				.entries(this.periodicalObjects);
	var filterContent = nest.filter(function(d){return d.key == givenID});
	return filterContent[0].values[0][attribute];	
}

Periodicals.prototype.periodicalsFromAnthology = function(title){
	var nest = d3.nest()
				.key(function(d){return d.anthologyTitle})
				.entries(this.anthologies);
	var filterContent = nest.filter(function(d){return d.key == title});
	return filterContent[0].values[0]["periodicals"];	
}

Periodicals.prototype.toggleDropdown = function(){
	if(!this.filterContent.classed('shown')){
		this.filterContent.classed('shown', true);
		d3.select(".filter").classed("shown", true);

	}else{
		this.filterContent.classed('shown', false);	
		d3.select(".filter").classed("shown", false);	
	}
}


/*Couldn't get D3 to work with the checkboxes, so filter dropdown is created with pure javascript*/
Periodicals.prototype.createDropdown = function(){
	var filterContent = document.getElementById('filter-content');
	var checkbox = document.createElement('input');
	var max = this.maxPeriodical.value.anthologies.length;
	checkbox.type = "checkbox";
	checkbox.className = "allPeriodicals";
	checkbox.setAttribute("checked", true);
	filterContent.appendChild(checkbox);
	filterContent.appendChild(document.createTextNode("All Periodicals"));
	filterContent.appendChild(document.createElement('br'));
	filterContent.appendChild(document.createElement('br'));

	for(i = 0; i < this.periodicalObjects.length; i++){
		this.periodicalObjects[i].periodical_title = this.periodicalObjects[i].periodical_title.replace(/\//g, '\ ');
		var span = document.createElement('span');
		var description = document.createTextNode(this.periodicalObjects[i].periodical_title);
		var number = document.createTextNode(" [" + this.periodicalObjects[i].stories.length + ", " + this.periodicalObjects[i].anthologies.length +"]" );
		checkbox = document.createElement('input');
		this.selected.push(this.periodicalObjects[i].periodical_id);

		checkbox.type = "checkbox";
		checkbox.className = "checkbox";
		checkbox.setAttribute("id", this.periodicalObjects[i].periodical_id);
		checkbox.setAttribute("checked", true);
		span.setAttribute("id", "a" +this.periodicalObjects[i].periodical_id);
		span.style.fontSize = this.getFontSize(this.periodicalObjects[i].anthologies, max);

		filterContent.appendChild(span);
		span.appendChild(checkbox);
		span.appendChild(description);
		span.appendChild(number);
		filterContent.appendChild(document.createElement('br'));
	}
}

Periodicals.prototype.getFontSize = function(periodical, max){
	var scale = d3.scale.linear()
						.domain([1, max])
						.range([10, 19]);

	return scale(periodical.length) + "px";
}

Periodicals.prototype.correspondingGlyphs = function(checked){
	for(var i = 0; i < this.anthologies.length; i++){
		var glyph = d3.select(".game#a" + this.anthologies[i].anthologyID);
		glyph.classed('filtered', true);
		glyph.classed('unfiltered', false);
		for(var j = 0; j < this.selected.length; j++){
			if(this.anthologies[i].periodicals.includes(this.selected[j])){				
				glyph.classed("filtered", false);
				glyph.classed('unfiltered', true);
			}
		}		
	}
}