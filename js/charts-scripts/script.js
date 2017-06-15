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
    console.log(data);
    console.log(ev.target.id);
    generateTimeSeriesChart(ev.target.id);
 }
/*function drop(ev, target) {
    ev.preventDefault();
    console.log(target.id);
    generateTimeSeriesChart(ev.target.id);

    //generateChart("#div1");
}*/




////////
/*var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .x(function(d) { return x(d.time); })
    .y(function(d) { return y(d.temperature); });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var data = [
  {time: "20:21", temperature: 16.00},
  {time: "20:19", temperature: 17.00},
  {time: "20:17", temperature: 16.00},
  {time: "20:15", temperature: 16.00},
  {time: "20:13", temperature: 16.00},
  {time: "20:11", temperature: 17.00},
  {time: "20:09", temperature: 17.00},
  {time: "20:07", temperature: 17.00},
  {time: "20:05", temperature: 17.00},
  {time: "20:03", temperature: 17.00},
  {time: "20:01", temperature: 18.00},
  {time: "19:59", temperature: 18.00},
  {time: "19:57", temperature: 17.00},
  {time: "19:55", temperature: 17.00},
  {time: "19:53", temperature: 16.00},
  {time: "19:51", temperature: 15.00},
  {time: "19:49", temperature: 14.00},
  {time: "19:47", temperature: 16.00},
  {time: "19:45", temperature: 16.00},
  {time: "19:43", temperature: 16.00},
  {time: "19:41", temperature: 16.00},
  {time: "19:39", temperature: 15.00},
  {time: "19:37", temperature: 15.00},
  {time: "19:35", temperature: 16.00},
  {time: "19:33", temperature: 16.00},
  {time: "19:31", temperature: 16.00}
];

x.domain(data.map(function(d) { return d.time; }));
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
      .text("Price ($)");

  svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);

function type(d) {
  d.time = d.time;
  d.temperature = +d.temperature;
  return d;
}*/
////
/*var data = [ { label: "Data Set 1", 
               x: [0, 1, 2, 3, 4], 
               y: [0, 1, 2, 3, 4] } ] ;
var xy_chart = d3_xy_chart()
    .width(960)
    .height(500)
    .xlabel("X Axis")
    .ylabel("Y Axis") ;
var svg = d3.select("body").append("svg")
    .datum(data)
    .call(xy_chart) ;

function d3_xy_chart() {
    var width = 640,  
        height = 480, 
        xlabel = "X Axis Label",
        ylabel = "Y Axis Label" ;
    
    function chart(selection) {
        selection.each(function(datasets) {
            //
            // Create the plot. 
            //
            var margin = {top: 20, right: 80, bottom: 30, left: 50}, 
                innerwidth = width - margin.left - margin.right,
                innerheight = height - margin.top - margin.bottom ;
            
            var x_scale = d3.scale.linear()
                .range([0, innerwidth])
                .domain([ d3.min(datasets, function(d) { return d3.min(d.x); }), 
                          d3.max(datasets, function(d) { return d3.max(d.x); }) ]) ;
            
            var y_scale = d3.scale.linear()
                .range([innerheight, 0])
                .domain([ d3.min(datasets, function(d) { return d3.min(d.y); }),
                          d3.max(datasets, function(d) { return d3.max(d.y); }) ]) ;

            var color_scale = d3.scale.category10()
                .domain(d3.range(datasets.length)) ;

            var x_axis = d3.svg.axis()
                .scale(x_scale)
                .orient("bottom") ;

            var y_axis = d3.svg.axis()
                .scale(y_scale)
                .orient("left") ;

            var x_grid = d3.svg.axis()
                .scale(x_scale)
                .orient("bottom")
                .tickSize(-innerheight)
                .tickFormat("") ;

            var y_grid = d3.svg.axis()
                .scale(y_scale)
                .orient("left") 
                .tickSize(-innerwidth)
                .tickFormat("") ;

            var draw_line = d3.svg.line()
                .interpolate("basis")
                .x(function(d) { return x_scale(d[0]); })
                .y(function(d) { return y_scale(d[1]); }) ;

            var svg = d3.select(this)
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")") ;
            
            svg.append("g")
                .attr("class", "x grid")
                .attr("transform", "translate(0," + innerheight + ")")
                .call(x_grid) ;

            svg.append("g")
                .attr("class", "y grid")
                .call(y_grid) ;

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + innerheight + ")") 
                .call(x_axis)
                .append("text")
                .attr("dy", "-.71em")
                .attr("x", innerwidth)
                .style("text-anchor", "end")
                .text(xlabel) ;
            
            svg.append("g")
                .attr("class", "y axis")
                .call(y_axis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", "0.71em")
                .style("text-anchor", "end")
                .text(ylabel) ;

            var data_lines = svg.selectAll(".d3_xy_chart_line")
                .data(datasets.map(function(d) {return d3.zip(d.x, d.y);}))
                .enter().append("g")
                .attr("class", "d3_xy_chart_line") ;
            
            data_lines.append("path")
                .attr("class", "line")
                .attr("d", function(d) {return draw_line(d); })
                .attr("stroke", function(_, i) {return color_scale(i);}) ;
            
            data_lines.append("text")
                .datum(function(d, i) { return {name: datasets[i].label, final: d[d.length-1]}; }) 
                .attr("transform", function(d) { 
                    return ( "translate(" + x_scale(d.final[0]) + "," + 
                             y_scale(d.final[1]) + ")" ) ; })
                .attr("x", 3)
                .attr("dy", ".35em")
                .attr("fill", function(_, i) { return color_scale(i); })
                .text(function(d) { return d.name; }) ;

        }) ;
    }

    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };

    chart.xlabel = function(value) {
        if(!arguments.length) return xlabel ;
        xlabel = value ;
        return chart ;
    } ;

    chart.ylabel = function(value) {
        if(!arguments.length) return ylabel ;
        ylabel = value ;
        return chart ;
    } ;

    return chart;
}*/

/*var data = [
  {time: "24-Apr-07", temperature: 16.00},
  {time: "23-Apr-07", temperature: 17.00},
  {time: "22-Apr-07", temperature: 16.00},
  {time: "21-Apr-07", temperature: 16.00},
  {time: "20-Apr-07", temperature: 16.00},
  {time: "19-Apr-07", temperature: 17.00},
  {time: "18-Apr-07", temperature: 17.00},
  {time: "17-Apr-07", temperature: 17.00},
  {time: "16-Apr-07", temperature: 17.00},
  {time: "15-Apr-07", temperature: 17.00},
  {time: "14-Apr-07", temperature: 18.00},
  {time: "13-Apr-07", temperature: 18.00},
  {time: "12-Apr-07", temperature: 17.00},
  {time: "11-Apr-07", temperature: 17.00},
  {time: "10-Apr-07", temperature: 16.00},
  {time: "09-Apr-07", temperature: 15.00},
  {time: "08-Apr-07", temperature: 14.00},
  {time: "07-Apr-07", temperature: 16.00},
  {time: "06-Apr-07", temperature: 16.00},
  {time: "05-Apr-07", temperature: 16.00},
  {time: "04-Apr-07", temperature: 16.00},
  {time: "03-Apr-07", temperature: 15.00},
  {time: "02-Apr-07", temperature: 15.00},
  {time: "01-Apr-07", temperature: 16.00}
];

var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var formatDate = d3.time.format("%d-%b-%y");

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .x(function(d) { return x(d.time); })
    .y(function(d) { return y(d.temperature); });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//d3.tsv("data.tsv", type, function(error, data) {
//  if (error) throw error;

//x.domain(d3.extent(data, function(d) { return d.time; }));
//y.domain(d3.extent(data, function(d) { return d.temperature; }));
x.domain(d3.extent(data, function(d) { return d.time; }));
y.domain(d3.extent(data, function(d) { return d.temperature; }));
//x.domain(data.map(function(d) { return d.time; }));
//y.domain([0, d3.max(data, function(d) { return d.temperature; })]);

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
  .text("Price ($)");

svg.append("path")
  .datum(data)
  .attr("class", "line")
  .attr("d", line);


function type(d) {
  d.time = formatDate.parse(d.time);
  d.temperature = +d.temperature;
  return d;
}*/

