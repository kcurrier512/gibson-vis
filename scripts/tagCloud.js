var TagCloud = function(periodicalInput, bleiler, stories){
	tc = this;
	this.removeNumerals(bleiler);
	this.bleiler = bleiler;
	this.stories = stories;
	var nest = d3.nest()
					.key(function(d){return d.periodical_id})
					.entries(periodicalInput);
	var periodicals = [];
	nest.forEach(function(obj){
		periodicals.push(obj.key);
	})
		
	d3.select(".tagcloud").append('g').attr('id', 'tagCloudContent').classed("hidden", false);
	this.makeTagCloud(periodicals);
}

TagCloud.prototype.makeTagCloud = function(selectedPeridicals){
	var resultArray = this.collectStoryKeywords(selectedPeridicals);
	this.createKeywordDropdown(resultArray[0], resultArray[1], resultArray[2]);
}

TagCloud.prototype.collectStoryKeywords = function(selectedPeridicals){
	if(selectedPeridicals.length == 0){
		return [[], 0, 0];
	}
	var keywordList = {};
	var nest = d3.nest()
			.key(function(d){ return d.periodical})
			.entries(this.stories);
	for(var j = 0; j < selectedPeridicals.length; j++){
		var stories = nest.filter(function(d){return d.key == selectedPeridicals[j]});
		if(stories[0]){
			stories[0].values.forEach(function(story){
				for(var i = 0; i < story.story_terms.length; i++){
					var bleiler_id = story.story_terms[i].bleiler_term
					if(bleiler_id in keywordList){
						keywordList[bleiler_id]++;
					}else{
						keywordList[bleiler_id] = 1;
					}
				}
			})
		}
	}	
	var keywordArray = this.sortByLength(keywordList);
	if(keywordArray.length > 50){
		keywordArray = keywordArray.slice(0, 50);
	}
	var max = keywordArray[0][1];
	var min = keywordArray[keywordArray.length-1][1];
	return [this.sortAlphabetically(keywordArray), max, min];
}

TagCloud.prototype.sortByLength = function(keywordList){
	var sortable = [];
	for (var bleiler_id in keywordList){
		sortable.push([bleiler_id, keywordList[bleiler_id]]);
	}
	sortable.sort(function(a, b){
		return b[1] - a[1];
	})
	return sortable;
}

TagCloud.prototype.sortAlphabetically = function(keywordArray){
	
	keywordArray.sort(function(a, b) {
	    if (a[0] === b[0]) {
	        return 0;
	    }
	    else {
	        return (a[0] < b[0]) ? -1 : 1;
	    }
	})
	return keywordArray;
}

TagCloud.prototype.createKeywordDropdown = function(keywordArray, max, min) {
	var tagCloudContent = d3.select("g#tagCloudContent").selectAll("p").data(keywordArray);
	tagCloudContent.enter().append("p");
	tagCloudContent.text(function(d){
			return d[0];
		})
	tagCloudContent.exit().remove();

	tagCloudContent.on("mouseover", function(d){
		tc.highlightGlyphs(d[0], true);
		d3.select(this).style("font-weight", "bold");
	})
	.on("mouseout", function(d){
		tc.highlightGlyphs(d[0], false);
		d3.select(this).style("font-weight", "normal");
	});

	tagCloudContent.transition().style("font-size", function(d){
		return tc.getFontSize(d[1], min, max)
	});


	d3.select("#tagcloud-button")
	.on("click", function(d){
		var toggle = d3.select("g#tagCloudContent").classed("hidden");
		d3.select("g#tagCloudContent").classed("hidden", !toggle);
	})
};

TagCloud.prototype.highlightGlyphs = function(title, highlight){
	var anthologies = this.keywordAnthologies(title);
	anthologies.forEach(function(anthology){
		var polygon = d3.select('g.container').select('g#a' + anthology).select('.area');
		polygon.classed("highlight", highlight);
	})
}

TagCloud.prototype.keywordAnthologies= function(title){
	var nest = d3.nest()
		.key(function(d){ return d.bleiler_term})
		.entries(this.bleiler);
	var keyword = nest.filter(function(d){return d.key == title});
	return keyword[0].values[0].anthologies;
}

TagCloud.prototype.getFontSize = function(d, min, max){
	var scale = d3.scale.linear()
						.domain([min, max])
						.range([10, 19]);
	return scale(d) + "px";
}

TagCloud.prototype.removeNumerals = function(bleiler){
	bleiler.forEach(function(term){
		var splitArray = term.bleiler_term.split(".");
		if(!splitArray[1]){
			term.bleiler_term = "No applicable hierarchical keyword";
		}else{
			term.bleiler_term = splitArray[1];
		}	
	})
}