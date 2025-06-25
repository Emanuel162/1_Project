import * as d3 from 'd3';

export function draw_scatterplot(data, active_tab = 0, relative_size = true) {
  console.log('draw scatterplot');
  let plot_data = data.lda;

  let above_mean_dots = [];

  for (let i = 0; i < data.labels.length; i++) {
    if (data.labels[i] === 'Above Mean') {
      above_mean_dots.push(data.lda[i]);
    }
  }

  /**
   * Margins of the visualization.
   */
  const margin = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50,
  };

  /**
   * Selection of svg and groups to be drawn on.
   */
  let svg = d3.select('#scatterplot_svg' + `_${active_tab}`);
  let g_scatterplot = d3.select('#g_scatterplot' + `_${active_tab}`);
  let g_x_axis_scatterplot = d3.select('#g_x_axis_scatterplot' + `_${active_tab}`);
  let g_y_axis_scatterplot = d3.select('#g_y_axis_scatterplot' + `_${active_tab}`);

  svg.on('click', function () {
    if (relative_size) {
      draw_scatterplot(data, false);
    } else {
      draw_scatterplot(data, true);
    }
  });
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

  let min_domain_x = relative_size ? d3.min(plot_data.map((d) => d[0])) : 0;
  let min_domain_y = relative_size ? d3.min(plot_data.map((d) => d[1])) : 0;
  const xScale = d3
    .scaleLinear()
    .domain([min_domain_x, d3.max(plot_data.map((d) => d[0]))])
    .range([0, width - margin.left - margin.right]);

  /**
   * Scale unction for the y-axis
   */
  const yScale = d3
    .scaleLinear()
    .domain([min_domain_y, d3.max(plot_data.map((d) => d[1]))])
    .range([height - margin.top - margin.bottom, 0]);

  /**
   * Drawing the data itself as circles
   */
  let scatterplot_circle = g_scatterplot
    .selectAll('.scatterplot_circle')
    .data(plot_data);

  scatterplot_circle
    .enter()
    .append('circle')
    .attr('class', 'scatterplot_circle')
    .merge(scatterplot_circle)
    .attr('fill', (d) => {
      if (above_mean_dots.includes(d)) {
        return 'green';
      } else {
        return 'red';
      }
    })
    .attr('r', 5)
    .attr('cx', (d) => margin.left + xScale(d[0]))
    .attr('cy', (d) => yScale(d[1]) + margin.top);

  scatterplot_circle.exit().remove();

  /**
   * Drawing the x-axis for the visualized data
   */
  let x_axis = d3.axisBottom(xScale);

  g_x_axis_scatterplot
    .attr(
      'transform',
      'translate(' + margin.left + ',' + (height - margin.bottom) + ')'
    )
    .call(x_axis);

  /**
   * Drawing the y-axis for the visualized data
   */
  let y_axis = d3.axisLeft(yScale);

  g_y_axis_scatterplot
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .call(y_axis);

  /**
   * Drawing the x-axis label
   */
  let x_label = g_scatterplot
    .selectAll('.x_label')
    .data(['X (Linear Discriminant 1)']);

  x_label
    .enter()
    .append('text')
    .attr('class', 'x_label')
    .merge(x_label)
    .attr('x', width / 2)
    .attr('y', height - margin.bottom / 4)
    .attr('text-anchor', 'middle')
    .text((d) => d);

  x_label.exit().remove();

  /**
   * Drawing the y-axis label
   */
  let y_label = g_scatterplot
    .selectAll('.y_label')
    .data(['Y (Linear Discriminant 2)']);

  y_label
    .enter()
    .append('text')
    .attr('class', 'y_label')
    .merge(y_label)
    .attr('x', -height / 2)
    .attr('y', margin.left / 4)
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .text((d) => d);

  y_label.exit().remove();
}
