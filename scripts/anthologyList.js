var AnthologyList = function(exportURL=null){
	al = this;
	d3.queue().defer(d3.json, "scripts/php/fetchAnthologies.php")
       .defer(d3.json, "scripts/php/fetchBleilerTerms.php")
       .defer(d3.json, "scripts/php/fetchPeriodicals.php")
       .defer(d3.csv, "data/mds_mappings/relative_total.csv")
       .defer(d3.json, "data/covers.json")
       .awaitAll(function(error , result){
	       	if (error) throw error;
	       	al.prepareData(result[0], result[1], result[2], result[3], result[4], exportURL);
       });
}

AnthologyList.prototype.prepareData = function(storyInput, bleilerInput, periodicalInput, coordInput, colorInput, exportURL){
	this.mappingInputs = [];
	this.storyInput = storyInput;
	this.bleilerInput = bleilerInput;
	this.coordInput = coordInput;
	this.colorInput = colorInput;
	this.mappingInputs["relative_total.csv"] = coordInput;

	this.periodicalInput = [];
	for(var i = 0; i < periodicalInput.length; i++){
		periodicalInput[i]["anthologies"] = [];
		periodicalInput[i]["stories"] = [];
		this.periodicalInput = periodicalInput;
	}
	this.periodicalInput.sort(function(a, b){
		return d3.ascending(a.periodical_title, b.periodical_title);
	});

	this.storyByID = d3.nest()
		.key(function(d) {return d.story_id})
		.entries(this.storyInput);
	this.keywordByID = d3.nest()
		.key(function(d){return d.bleiler_id})
		.entries(this.bleilerInput);

	var anthologyResult = this.prepareAnthology();
	this.anthologies = anthologyResult[0];
	this.stories = anthologyResult[1];
	
	this.addCoords();
	this.addColors();
	if(exportURL){
		this.exportAnthologies(exportURL)
	}
	var tc = new TagCloud(this.periodicalInput, this.bleilerInput, this.stories);
	this.plot = new Scatterplot(this.anthologies, new AboutView(), new Periodicals(this.anthologies, this.periodicalInput, tc));
}

AnthologyList.prototype.prepareAnthology = function(){
	var countedAnthologies = [], stories = [];
	this.storyByID.forEach(function(s){
		var story = s.values[0],
			storyAuthors = [],		
			storyKeywords = [];

		s.values.forEach(function(story_values){
			if(!storyAuthors.includes(story_values.author)){
				storyAuthors.push(story_values.author);
			}
		})
		story.author = storyAuthors;
		if(story.story_terms){
			var keyword_ids = story.story_terms.split("~");
			keyword_ids = keyword_ids.slice(1, keyword_ids.length-1);
			storyKeywords = al.getKeywordObjects(keyword_ids);
			for(var i = 0; i < storyKeywords.length; i++){
				if("anthologies" in storyKeywords[i]){
					if(!storyKeywords[i].anthologies.includes(story.anthology_id)){
						storyKeywords[i].anthologies.push(story.anthology_id);
					}
				}else{
					storyKeywords[i].anthologies = [story.anthology_id];
				}

			}
		}
		story.anthology = story.anthology.replace(/\\/g, "");
		var branchcount = al.getBranchCount(storyKeywords);
		story.story_terms = storyKeywords;
		var anthologyIndex = getAnthologyIndexByTitle(story.anthology, countedAnthologies);

		al.countPeriodicals(story.story_title, story.periodical, story.anthology);

		if(anthologyIndex === -1){
			al.makeNewAnthology(story, branchcount, countedAnthologies)
		}else{
			al.addToAnthology(story, branchcount, countedAnthologies[anthologyIndex])
		}
		stories.push(story);
	})
	return [countedAnthologies, stories];
}

AnthologyList.prototype.getKeywordObjects = function(id_list){
	var objectList = [],
		filterNest = this.keywordByID.filter(function(d){if(id_list.includes(d.key)) return d});
	filterNest.forEach(function(d){
		objectList.push(d.values[0])
	})
	return objectList;
}

AnthologyList.prototype.getBranchCount = function(storyKeywords, output = false){
	var branchcount = [0, 0, 0, 0, 0, 0, 0, 0, 0];
	if(storyKeywords.length === 0){
		return branchcount;
	}
	if(!output){
		var termsByLevel = d3.nest()
			.key(function(d){return d.level})
			.entries(storyKeywords);
		var mainKeywords = termsByLevel[0].values;
	}else{
		var mainKeywords = storyKeywords;
	}
	mainKeywords.forEach(function(term){
		var label = term.description.split(".");
		switch(label[0]) {
    		case "I":
        		branchcount[0]++;
        	break;
    		case "II":
        		branchcount[1]++;
        	break;
        	case "III":
        		branchcount[2]++;
        	break;
        	case "IV":
        		branchcount[3]++;
        	break;
        	case "V":
        		branchcount[4]++;
        	break;
        	case "VI":
        		branchcount[5]++;
        	break;
        	case "VII":
        		branchcount[6]++;
        	break;
        	case "VIII":
        		branchcount[7]++;
        	break;
        	case "IX":
        		branchcount[8]++;
        	break;
    		default:
        	break;
		}
	})
	return branchcount;
}

function getAnthologyIndexByTitle(title, countedAnthologies){
	for(i = 0; i < countedAnthologies.length; i++){
		if(countedAnthologies[i].anthologyTitle === title){
			return i;
		}
	}
	return -1;
}


function getAnthologyIndexByID(id, countedAnthologies){
	for(i = 0; i < countedAnthologies.length; i++){
		if(countedAnthologies[i].anthologyID === id){
			return i;
		}
	}
	return -1;
}

AnthologyList.prototype.makeNewAnthology = function(story, branchcount, countedAnthologies){
	countedAnthologies.push({
		anthologyID: story.anthology_id,
		anthologyTitle: story.anthology,
		startYear: +story.story_year,
		endYear: +story.story_year, 
		stories: [story],
		branchSpread: branchcount,
		storyNumber: 1,
		max: al.maxBranchCounts(branchcount, 0),
		periodicals: [story.periodical]
	});
}

AnthologyList.prototype.addToAnthology = function(story, branchcount, anthology){
	if((+story.story_year < anthology.startYear && story.story_year.length === 4) || anthology.startYear === 0)
		anthology.startYear = +story.story_year;
	if(+story.story_year > anthology.endYear && story.story_year.length === 4)
		anthology.endYear = +story.story_year
	if(!anthology.periodicals.includes(story.periodical)){
		anthology.periodicals.push(story.periodical);
	}
	anthology.stories.push(story);
	anthology.branchSpread = this.sumBranchCounts(anthology.branchSpread, branchcount);
	anthology.storyNumber++;
	anthology.max = this.maxBranchCounts(anthology.branchSpread, anthology.max);	
}

AnthologyList.prototype.countPeriodicals = function(title, periodical, anthology){
	for(var i = 0; i < this.periodicalInput.length; i++){
		if(this.periodicalInput[i]["periodical_id"] === periodical){
			this.periodicalInput[i]["stories"].push(title);
			if(!this.periodicalInput[i]['anthologies'].includes(anthology)){
				this.periodicalInput[i]["anthologies"].push(anthology);
			}
		}
	}
}

AnthologyList.prototype.addCoords = function(){
	for(var i = 0; i < this.coordInput.length; i++){
		var anthIndex = getAnthologyIndexByTitle(this.coordInput[i].title, this.anthologies);
		this.anthologies[anthIndex].coords = [+this.coordInput[i].V1, +this.coordInput[i].V2];
	}
}

AnthologyList.prototype.sumBranchCounts = function(anthologyCount, newCount){
	for(var i = 0; i < 9; i++){
		anthologyCount[i]+= newCount[i];
	}
	return anthologyCount;
}

AnthologyList.prototype.maxBranchCounts = function(branchcount, max){
	for(var i = 0; i < 9; i++){
		if(branchcount[i] > max){
			max = branchcount[i];
		}
	}
	return max;
}

AnthologyList.prototype.addColors = function(){
	var anthologyCopy = this.createAnthologiesCopy();
	this.colorInput.forEach(function(cover){
		picture = cover.source.split("/")[6];
		num = picture.split("_")[0];
		anthologyCopy.forEach(function(d, index){
			if(d.anthology.anthologyTitle.toUpperCase().includes(num.toUpperCase())){
				al.anthologies[d.index].cover = cover;
				d = null;
			}
		})
	})
}

AnthologyList.prototype.createAnthologiesCopy = function(){
	var copy = [];
	this.anthologies.forEach(function(d, index){
		copy.push({
			anthology: d,
			index: index
		})
	})
	return copy;
}

AnthologyList.prototype.sortAnthologyCopy = function(copy){
	copy.sort(function(a, b){
		var t1 = a.anthology.anthologyTitle.split(" "),
			t2 = b.anthology.anthologyTitle.split(" ");
		var n1 = t1[t1.length-1],		
			n2 = t2[t2.length-1];
		if(n1 < n2) return 1;
		if(n1 > n2) return -1;
		return 0;
	});
}

AnthologyList.prototype.importMappings = function(mapping){
	d3.csv("data/mds_mappings/" + mapping, function(data){
		al.mappingInputs[mapping] = data;
		al.coordInput = data;
		al.addCoords(data);
		this.plot.drawAll();
	})
}

AnthologyList.prototype.changeMapping = function(mapping){
	if(mapping != this.plot.mapping){
		this.plot.mapping = mapping;
		
		if(d3.select(".about")[0][0]){
			this.plot.about.remove();
			this.plot.about.show(mapping);
		}
		
		if(mapping in this.mappingInputs){
			al.coordInput = this.mappingInputs[mapping];
			al.addCoords(this.mappingInputs[mapping]);
			this.plot.drawAll();
			
		}else{
			this.importMappings(mapping);			
		}
	}
}

AnthologyList.prototype.exportAnthologies = function(exportURL){
	console.log(exportURL)
	var anthJSON = [];
	this.anthOutput.forEach(function(d){
		var keywordNumber = 0;
		for(i = 0; i < 9; i++){
			keywordNumber += d.branchSpread[i];
		}
		if(keywordNumber === 0){
			keywordNumber = 1;
		}
		anthJSON.push({
			anthologyTitle: d.anthologyTitle,
			ultimates: d.branchSpread[0] / keywordNumber,
			physics: d.branchSpread[1] / keywordNumber,
			astronomy: d.branchSpread[2] / keywordNumber,
			geology: d.branchSpread[3] / keywordNumber,
			biology: d.branchSpread[4] / keywordNumber,
			mankind: d.branchSpread[5] / keywordNumber,
			technology: d.branchSpread[6] / keywordNumber,
			miscellaneous: d.branchSpread[7] / keywordNumber,
			supernatural: d.branchSpread[8] / keywordNumber
		})
	})

	$.ajax({
	 	type: 'POST',
	 	url: exportURL,
	 	data: { json : JSON.stringify(anthJSON)},
	 	error: function(error){
	 		console.log(error);
	 	},
	 	success: function(json){
	 		console.log(json);
	 	}
	 });
}