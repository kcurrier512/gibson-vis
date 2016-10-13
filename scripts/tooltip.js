var Tooltip = function(){
	this.g = d3.select('.container').append('g').classed({'tooltip': true, 'exclude-from-zoom': true}).style('position', 'relative');
}

Tooltip.prototype.createTooltip = function(message, glyph){
	var tooltip = this.g.append('rect'),
		text = this.g.append('text').text(message),
		padding = 5;
	var textbbox = text.node().getBBox(),
		string = d3.select(glyph).attr('transform').toString();
  	string = string.split("(");
	var coords = string[1].split(','),
  	t = d3.transform(d3.select('.container').attr("transform"));

	this.g.select('rect')
		.attr("x", textbbox.x - padding)
    .attr("y", textbbox.y - padding)
    .attr("width", textbbox.width + (padding*2))
    .attr("height", textbbox.height + (padding*2))
    .attr("rx","5").attr("ry","5")
    .style('fill', '#555').style('opacity', '.07');

  this.g.attr('transform', 'translate(' + (parseFloat(coords[0]) + 50) + ',' + (parseFloat(coords[1])) +')scale(' + 1 / t.scale[0] + ')');

}

Tooltip.prototype.remove= function(){
	d3.selectAll('g.tooltip').select('rect').remove();
	d3.selectAll('g.tooltip').select('text').remove();
}