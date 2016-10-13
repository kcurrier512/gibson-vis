var AboutView = function(){}

AboutView.prototype.show =function(mapping){
	var message =this.createMessage(mapping);
	d3.select("body").append('div').classed("about",true).append("p").text(message[0]).append("p").text(message[1]);

}

AboutView.prototype.createMessage = function(mapping){
	var message = "The Gibson Collection is a collection of hand-curated early science fiction anthologies created by Bob Gibson. This visualization represents a selection of the anthologies in the collection as colored glyphs.  Each glyph begins as a nine-sided figure, its radius determined by the number of stories included in the anthology. When a glyph is clicked on, it changes its shape to reflect the thematic content of the stories within the anthology.  The content was classified using Everett Bleiler’s hierarchy of nine major science fiction motifs, each branch containing more specific motifs also used to describe the stories.  Bleiler keywords were assigned to each story as themes and motifs were touched upon within the stories. These anthology glyphs' positions are determined by a statistical technique called Multidimensional Scaling. Each anthology is given a set of 'scores' based on its properties.  The Multidimensional Scaling determines coordinates for each glyph in relation to its similarity to the other glyphs. The closer a glyph is to another, the more similar they are based on their scores. We developed five different ways to calculations of an anthology score, and thus have five different mappings available for the glyphs to discover similarities and differences between the glyphs depending on the calculations. ";
	
	var message2 = "In this mapping: ";

	switch(mapping){
		case "relative_total.csv":
			message2 += "Relative Total, we calculated the scores by adding 1 to each thematic branch for every corresponding keyword in every story. ";
			message2 += "We then divided each branch's score by the total number of keywords in the anthology to create a percentage for each branch that would add up to 100% of the anthology. ";
		break;
		case "absolute_total.csv":
			message2 += "Absolute Total, we calculated the scores by adding 1 to each thematic branch for every corresponding keyword in every story. ";
			message2 += "The amount of stories in an anthology affects its scores."
		break;
		case "relative_branches.csv":
			message2 += "Relative Branches, we calculated the scores by adding 1 to each thematic branch for every story that contains any keyword in that branch. The number of keywords a story contains in that branch does not affect its scores. ";
			message2 += "We divided each branch's score by the total number of keywords in the anthology to create a percentage for each branch that would add up to 100% of the anthology. ";
		break;
		case "relative_branchesSize.csv":
			message2 += "Relative Branches and Size, we calculated the scores by adding 1 to each thematic branch for every story that contains any keyword in that branch. The number of keywords a story contains in that branch does not affect its scores. ";
			message2 += "We divided each branch's score by the total number of keywords in the anthology to create a percentage for each branch that would add up to 100% of the anthology. ";
			message2 += "In addition to the branches' scores, there is a score for the total number of stories in the anthology. ";
		break;
		case "absolute_branches.csv":
			message2 +=  "Absolute Branches, we calculated the scores by adding 1 to each thematic branch for every story that contains any keyword in that branch. The number of keywords a story contains in that branch does not affect its scores. ";
			message2 += "The amount of stories in an anthology affects its scores.";
		break;
		default:
		break;
	}
	return [message, message2];
}

AboutView.prototype.remove = function(){
	d3.select("div.about").remove();
}