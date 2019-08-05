function generateTimeSeriesChart(DropAreaId){   
    var chart = c3.generate({
        bindto: "#"+DropAreaId,
        data: {
          columns: [
            ['data1', 1, 2, 3, 4, 5, 6],
            ['data2', 2, 4, 5, 6, 7, 9]
          ]
        }
    });
}

function generateChart(locator) {
    var margin = {top: 40, right: 20, bottom: 30, left: 40},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    var format = d3.format("123");

    var x = d3.scale.ordinal()
        .rangeRoundBands([10, width], 0.2);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(format);

    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        return "<strong>Temperatura:</strong> <span style='color:red'>" + d.temperature + "</span>";
      })

    var svg = d3.select(locator).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.call(tip);

    // The new data variable.
    var data = [
      {letter: "20:21", temperature: 16},
      {letter: "20:19", temperature: 17},
      {letter: "20:17", temperature: 16},
      {letter: "20:15", temperature: 16},
      {letter: "20:13", temperature: 16},
      {letter: "20:11", temperature: 17},
      {letter: "20:09", temperature: 17},
      {letter: "20:07", temperature: 17},
      {letter: "20:05", temperature: 17},
      {letter: "20:03", temperature: 17},
      {letter: "20:01", temperature: 18},
      {letter: "19:59", temperature: 18},
      {letter: "19:57", temperature: 17},
      {letter: "19:55", temperature: 17},
      {letter: "19:53", temperature: 16},
      {letter: "19:51", temperature: 15},
      {letter: "19:49", temperature: 14},
      {letter: "19:47", temperature: 16},
      {letter: "19:45", temperature: 16},
      {letter: "19:43", temperature: 16}
    ];

    // The following code was contained in the callback function.
    x.domain(data.map(function(d) { return d.letter; }));
    y.domain([0, d3.max(data, function(d) { return d.temperature; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("temperature");

    svg.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.letter); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.temperature); })
        .attr("height", function(d) { return height - y(d.temperature); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)

    function type(d) {
      d.temperature = +d.temperature;
      return d;
    }
}

$( "#myModal" ).on('show.bs.modal', function(){
    d3.select("#chart svg").remove();
    generateChart("#chart");
});

$( "#myModal" ).on('hidden.bs.modal', function(){
    d3.select("#chart svg").remove();
});

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    generateTimeSeriesChart(ev.target.id);
 }

