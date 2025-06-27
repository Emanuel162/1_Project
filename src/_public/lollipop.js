import * as d3 from 'd3';

const draw_lollipop = (data, active_tab = 0) => {
  console.log('draw lollipop');
  console.log(data);
  data.sort((a, b) => b.rating - a.rating);

  /**
   * Margins of the visualization.
   */
  const margin = {
    top: 50,
    bottom: 200,
    left: 100,
    right: 50,
  };

  /**
   * Selection of svg and groups to be drawn on.
   */
  let svg = d3.select('#lollipop_svg' + `_${active_tab}`);

  let g_lollipop = d3.select('#g_lollipop' + `_${active_tab}`);
  let g_x_axis_lollipop = d3.select('#g_x_axis_lollipop' + `_${active_tab}`);
  let g_y_axis_lollipop = d3.select('#g_y_axis_lollipop' + `_${active_tab}`);

  /**
   * Getting the current width/height of the whole drawing pane.
   */
  let width = parseInt(svg.style('width'));
  let height = parseInt(svg.style('height'));

  /**
   * Setting the viewBox for automatic rescaling when the window is resized.
   */
  svg.attr('viewBox', `0 0 ${width} ${height}`);

  /**
   * Scale function for the x-axis
   */
  const xScale = d3
    .scaleBand()
    .range([margin.left, width - margin.right])
    .domain(data.map((boardgame) => boardgame.title))
    .padding(1);
   
  g_x_axis_lollipop
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(xScale))
    .selectAll('text')
    .attr('transform', 'translate(-10,0)rotate(-45)')
    .style('text-anchor', 'end')
    .style('opacity', 0);
 
  const yScale = d3.scaleLinear().domain([0, 1]).range([height, 0]);

  g_y_axis_lollipop
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale));

  svg
    .selectAll('myline')
    .data(data)
    .enter()
    .append('line')
    .attr('x1', (d) => xScale(d.title))
    .attr('x2', (d) => xScale(d.title))
    .attr('y1', (d) => yScale(d.rating))
    .attr('y2', yScale(0))
    .attr('stroke', 'grey');

  svg
    .selectAll('mycircle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', (d) => xScale(d.title))
    .attr('cy', (d) => yScale(d.rating))
    .attr('r', '4')
    .style('fill', '#69b3a2')
    .attr('stroke', 'black')
    .on("mouseover", function (event, d) {
      d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .html(`Title: ${d.title}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 20) + "px");
      d3.select(this).attr("r", 7);
    })
    .on("mouseout", function () {
      d3.selectAll(".tooltip").remove();
      d3.select(this).attr("r", 5);
    });
};

export { draw_lollipop };
