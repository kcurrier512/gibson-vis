/* Detailed view of the anthologies.  Appears when glyph is selected. */
var DetailView = function(){

};
/* A new detail view is created everytime the glyph is selected. 
The detail view is deleted when the glyph is unselected. */

DetailView.prototype.show = function(anthology){
	object = this;
	var yearSpan = anthology.startYear + " - " + anthology.endYear
	var detail = d3.select("#detail-view")
		.classed('show', true)

	detail.style('background-image', "url(" +anthology.cover.source.replace("icon", "high") +")");
	var detailContent = detail.append('div').attr('id', 'detailContent');
	detailContent.append('p')
		.text(anthology.anthologyTitle).style({"font-weight": "bold", "font-size": "14px"});

	detailContent.append('p')
		.text(yearSpan).style({"font-weight": "bold", "font-size": "14px"});

	detailContent.selectAll('li')
		.data(anthology.stories)
		.enter()
		.append('li')
		.text(function(d){
			return d.story_title;
		})
		.style('font-size', '13px')
		.on('click', function(d){
			if(!d3.select(this).classed('open')){
				d3.select(this).classed('open', true);
				object.showBleilerList(d, d3.select(this))
			}else{
				d3.select(this).classed('open', false);
				d3.select(this).style("font-weight", "normal");
				d3.select(this).select('g').remove();
			}
		});
}

DetailView.prototype.hide = function(){
	d3.select("#detail-view")
		.classed('show', false)
		.select('div').remove();
}

/* Create story detail list when story item is clicked on */
DetailView.prototype.showBleilerList = function(story, listItem){
	listItem.style("font-weight", "bold");
	var d = listItem.append('g').append("p");
	d.selectAll('p')
		.data(story.author)
		.enter()
		.append('p')
		.text(function(d){ return d;})
		.style({"font-weight": "normal", "font-size": "12px"});
	d.append('ol')
		.selectAll('li')
		.data(story.story_terms)
		.enter()
		.append('li')
		.text(function(d){return d.bleiler_term})
		.style({"font-weight": "normal", "font-size": "12px"});

}