function getCoverColors(){
    var covers,
        images = [],
        imageColors = [];
     d3.json("scripts/coverColors/fetchCovers.php", function(error, data){
        covers = data;
        var colorThief = new ColorThief();
        covers.forEach(function(cover, i){
            var img = document.createElement('img');
            img.src = 'http://136.159.24.60/gibson/vis/anthCovers/' + covers[i].coverUrl;
            images.push(img);
        })
        images.forEach(function(img){
            var svg = d3.select("body")
                .append("svg")
                .attr("width", 200)
                .attr("height", 100); 
            var coverColor = colorThief.getPalette(img, 5);
            imageColors.push({
                source: img.src,
                color1: coverColor[0],
                color2: coverColor[1],
                color3: coverColor[2],
                color4: coverColor[3],
                color5: coverColor[4]
            })
        })
         $.ajax({
            type: "POST",
            url: "./scripts/coverColors/exportCovers.php",
            data: {json: JSON.stringify(imageColors)},
            error: function(error){
                console.log(error);
            },
            success: function(json){
                console.log(json);
            }
          });
    })
}