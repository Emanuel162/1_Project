import * as d3 from "d3";


export function draw_scatterplot_kmeans(kmeans) {
    console.log('draw scatterplot for kmeans');
    console.log(kmeans)

    const data = kmeans.data;

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
    let svg = d3.select('#scatterplot_kmeans_svg');
    let g_scatterplot_kmeans = d3.select('#g_scatterplot_kmeans');
    let g_x_axis_scatterplot_kmeans = d3.select('#g_x_axis_scatterplot_kmeans');
    let g_y_axis_scatterplot_kmeans = d3.select('#g_y_axis_scatterplot_kmeans');

    /**
     * Getting the current width/height of the whole drawing pane.
     */
    let width = +parseInt(svg.style('width'));
    let height = +parseInt(svg.style('height'));

    /**
     * Setting the viewBox for automatic rescaling when the window is resized.
     */
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    /**
     * Scale function for the x-axis
     */
    const xScale = d3
        .scaleLinear()
        .domain([d3.min(data.map((d) => d.dataPoints[1])), d3.max(data.map((d) => d.dataPoints[0]))])
        .range([0, width - margin.left - margin.right]);

    /**
     * Scale function for the y-axis
     */
    const yScale = d3
        .scaleLinear()
        .domain([d3.min(data.map((d) => d.dataPoints[1])), d3.max(data.map((d) => d.dataPoints[1]))])
        .range([height, 0]);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    /**
     * Drawing the data itself as circles
     */
    let scatterplot_kmeans_circle = g_scatterplot_kmeans
        .selectAll('.scatterplot_kmeans_circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'scatterplot_kmeans_circle')
        .attr('r', 5)
        .attr('fill', (d) => color(d.clusterIndex))
        .attr('cx', (d) => margin.left + xScale(d.dataPoints[0]))
        .attr('cy', (d) => yScale(d.dataPoints[1]) + margin.top);

    scatterplot_kmeans_circle.exit().remove();

    let scatterplot_kmeans_cluster_circle = g_scatterplot_kmeans
        .selectAll('.scatterplot_kmeans_cluster_circle')
        .data(kmeans.clusterCenters)
        .enter()
        .append('circle')
        .attr('class', 'scatterplot_kmeans_cluster_circle')
        .attr('r', 9)
        .attr('fill', (d, i) => color(i))
        .attr('cx', (d) => margin.left + xScale(d.x))
        .attr('cy', (d) => yScale(d.y) + margin.top);

    scatterplot_kmeans_cluster_circle.exit().remove();


    /**
     * Drawing the x-axis for the visualized data
     */
    let x_axis = d3.axisBottom(xScale);

    g_x_axis_scatterplot_kmeans
        .attr(
            'transform',
            'translate(' + margin.left + ',' + (height - margin.bottom) + ')'
        )
        .call(x_axis);

    /**
     * Drawing the y-axis for the visualized data
     */
    let y_axis = d3.axisLeft(yScale);

    g_y_axis_scatterplot_kmeans
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .call(y_axis);

    /**
     * Drawing the x-axis label
     */
    let x_label = g_scatterplot_kmeans
        .selectAll('.x_label')
        .data(['X (PCA 1)']);

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
    let y_label = g_scatterplot_kmeans
        .selectAll('.y_label')
        .data(['Y (PCA 2)']);

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
