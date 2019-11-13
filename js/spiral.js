async function makeSpiral(device, sensor_code, data) {
  var width = 330,
      height = 330,
      start = 0,
      end = 2.80,
      numSpirals = 3

    var theta = function(r) {
      return numSpirals * Math.PI * r;
    };

    // used to assign nodes color by group
    var color = d3version4.scaleOrdinal(d3version4.schemeCategory10);

    var r = d3version4.min([width, height]) / 2 - 40;

    var radius = d3version4.scaleLinear()
      .domain([start, end])
      .range([40, r]);

    var svg = d3version4.select("#spiral-chart").append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var points = d3version4.range(start, end + 0.001, (end - start) / 1000);

    var spiral = d3version4.radialLine()
      .curve(d3version4.curveCardinal)
      .angle(theta)
      .radius(radius);

    var path = svg.append("path")
      .datum(points)
      .attr("id", "spiral")
      .attr("d", spiral)
      .style("fill", "none")
      .style("stroke", "steelblue");

    var spiralLength = path.node().getTotalLength(),
        N = 364,
        barWidth = (spiralLength / N) - 1;
    var someData = [];

    // Dados do Heatmap
    spiralData = data;
    
    let dataWithFullDate = spiralData.filter(obj => {
      return obj.fullDate !== '';
    });
    
    const currentYear = moment(dataWithFullDate[dataWithFullDate.length -1].fullDate).format("YYYY");

    for (var i = 0; i < N; i++) {
      
      var currentDate = new Date(currentYear, 0, 1);
      
      currentDate.setMonth(currentDate.getMonth());
      currentDate.setDate(currentDate.getDate() + i);

      someData.push({
        date: currentDate,
        value: spiralData[i].value,
        group: currentDate.getMonth()
      });
    }
    var timeScale = d3version4.scaleTime()
      .domain(d3version4.extent(someData, function(d){
        return d.date;
      }))
      .range([0, spiralLength]);
    
    // yScale for the bar height
    var yScale = d3version4.scaleLinear()
      .domain([0, d3version4.max(someData, function(d){
        return d.value;
      })])
      .range([0, (r / numSpirals) - 30]);
    
    svg.selectAll("rect")
      .data(someData)
      .enter()
      .append("rect")
      .attr("x", function(d,i){
        
        var linePer = timeScale(d.date),
            posOnLine = path.node().getPointAtLength(linePer),
            angleOnLine = path.node().getPointAtLength(linePer - barWidth);
      
        d.linePer = linePer; // % distance are on the spiral
        d.x = posOnLine.x; // x postion on the spiral
        d.y = posOnLine.y; // y position on the spiral
        
        d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180 / Math.PI) - 90; //angle at the spiral position

        return d.x;
      })
      .attr("y", function(d){
        return d.y;
      })
      .attr("id", function(d){
        return "b" + moment(d.date).format("YYYY-MM-DD")
      })
      .attr("width", function(d){
        return barWidth;
      })
      .attr("height", function(d){
        return yScale(d.value);
      })
      .attr("class", "spiral")
      .style("fill", function(d){return color(d.group);})
      .style("stroke", "none")
      .attr("transform", function(d){
        return "rotate(" + d.a + "," + d.x  + "," + d.y + ")"; // rotate the bar
      });
    
    // add date labels
    var tF = d3version4.timeFormat("%b %Y"),
        firstInMonth = {};

    svg.selectAll("text")
      .data(someData)
      .enter()
      .append("text")
      .attr("dy", 10)
      .style("text-anchor", "start")
      .style("font", "10px arial")
      .append("textPath")
      // only add for the first of each month
      .filter(function(d){
        var sd = tF(d.date);
        if (!firstInMonth[sd]){
          firstInMonth[sd] = 1;
          return true;
        }
        return false;
      })
      .text(function(d){
        return tF(d.date);
      })
      // place text along spiral
      .attr("xlink:href", "#spiral")
      .style("fill", "grey")
      .attr("startOffset", function(d){
        return ((d.linePer / spiralLength) * 100) + "%";
      });


    var tooltip = d3version4.select("#spiral-chart")
    .append('div')
    .attr('class', 'tooltip');

    tooltip.append('div')
    .attr('class', 'date');
    tooltip.append('div')
    .attr('class', 'value');

    svg.selectAll("rect")
    .on('mouseover', function(d) {
        const date = moment(d.date).format('YYYY-MM-DD');        

        d3version4.select(this)
        .style("fill","#FFFFFF")
        .style("stroke","#000000")
        .style("stroke-width","2px");

        d3version4.select("#a"+ date)
        .style("stroke","#000000")
        .style("stroke-width","4px");

    })
    .on('mouseout', function(d) {
      const date = moment(d.date).format('YYYY-MM-DD');

      if(!d3version4.select("#a"+ date).classed("selected")){  
          d3version4.select(this)
          .style("fill", function(d){return color(d.group);})
          .style("stroke", "none")
          
          d3version4.select("#a"+ date)
          .style("stroke","#E6E6E6")
          .style("stroke-width","2px");
      }
    });

    $('svg rect.spiral').tipsy({ 
      gravity: 'w', 
      html: true, 
      title: function() {
          const d = this.__data__;

        return "Data: "+ moment(d.date.toDateString()).format('DD/MM/YYYY') +"\nValor: " + Math.round(d.value*100)/100; 
      }
  });
}
  