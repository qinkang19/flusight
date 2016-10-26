// Chart plotting functions

export default class Chart {
  constructor(d3, elementId) {
    this.d3 = d3
    this.elementId = elementId
    this.setup()
  }

  /**
   * Setup scales, axes, markers etc.
   */
  setup() {
    // Sugar !!
    let d3 = this.d3
    // Get div dimensions
    let chartDiv = document.getElementById(this.elementId),
        divWidth = chartDiv.offsetWidth,
        divHeight = 330

    // Create blank chart
    let margin = {
      top: 10, right: 50, bottom: 70, left: 40
    },
        width = divWidth - margin.left - margin.right,
        height = divHeight - margin.top - margin.bottom

    // Initialize values
    let xScale = d3.scaleLinear()
        .range([0, width]),
        yScale = d3.scaleLinear()
        .range([height, 0]),
        xScaleDate = d3.scaleTime()
        .range([0, width])

    // Add svg
    let svg = d3.select('#' + this.elementId).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    // Save variables
    this.svg = svg
    this.xScale = xScale
    this.yScale = yScale
    this.xScaleDate = xScaleDate
    this.height = height
    this.width = width

    this.setupTimeRect()
    this.setupAxes()
    this.setupBaseline()
    this.setupActual()
    this.setupPrediction()
    this.setupOnset()
    this.setupPeak()

    // Add overlays and other mouse interaction items
    this.setupOverlay()
    this.setupLegend()
  }

  // Markers initialization
  // ----------------------

  /**
   * Setup axes
   */
  setupAxes() {
    let svg = this.svg,
        width = this.width,
        height = this.height

    svg.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', 'translate(0,' + height + ')')

    svg.append('g')
      .attr('class', 'axis axis-x-date')
      .attr('transform', 'translate(0,' + (height + 25) + ')')
      .append('text')
      .attr('class', 'title')
      .attr('text-anchor', 'middle')
      .attr('transform', 'translate(' + width / 2 + ',' + 40 + ')')
      .text('Epidemic Week')

    svg.append('g')
      .attr('class', 'axis axis-y')
      .append('text')
      .attr('class', 'title')
      .attr('transform', 'translate(-40 ,' + height / 2 + ') rotate(-90)')
      .attr('dy', '.71em')
      .style('text-anchor', 'middle')
      .text('Weighted ILI (%)')
  }

  /**
   * Setup current time rectangle
   */
  setupTimeRect() {
    this.svg.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 0)
      .attr('height', this.height)
      .attr('class', 'timerect')
  }

  /**
   * Setup baseline
   */
  setupBaseline() {
    let group = this.svg.append('g')
        .attr('class', 'baseline-group')

    group.append('line')
      .attr('x1', 0)
      .attr('y1', this.height)
      .attr('x2', this.width)
      .attr('y2', this.height)
      .attr('class', 'baseline')

    let text = group.append('text')
        .attr('class', 'title')
        .attr('transform', 'translate(' + (this.width + 10) + ', 0)')
    text.append('tspan')
      .text('CDC')
      .attr('x', 0)
    text.append('tspan')
      .text('Baseline')
      .attr('x', 0)
      .attr('dy', '1em')
  }

  /**
   * Setup onset marker
   * One central circle, two end line markers and a range line
   */
  setupOnset() {
    let group = this.svg.append('g').attr('class', 'onset-group')

    let stp = 10,
        cy = this.height - 15

    group.append('line')
      .attr('y1', cy)
      .attr('y2', cy)
      .attr('class', 'range onset-range')

    group.append('line')
      .attr('y1', cy - stp / 2)
      .attr('y2', cy + stp / 2)
      .attr('class', 'stopper onset-stopper onset-low')

    group.append('line')
      .attr('y1', cy - stp / 2)
      .attr('y2', cy + stp / 2)
      .attr('class', 'stopper onset-stopper onset-high')

    group.append('circle')
      .attr('r', 4)
      .attr('cy', cy)
      .attr('class', 'onset-mark')
  }

  /**
   * Setup peak marker
   * One central circle, four end line markers and two range lines
   */
  setupPeak() {
    let d3 = this.d3
    let group = this.svg.append('g').attr('class', 'peak-group')

    group.append('line')
      .attr('class', 'range peak-range peak-range-x')

    group.append('line')
      .attr('class', 'range peak-range peak-range-y')

    group.append('line')
      .attr('class', 'stopper peak-stopper peak-low-x')

    group.append('line')
      .attr('class', 'stopper peak-stopper peak-high-x')

    group.append('line')
      .attr('class', 'stopper peak-stopper peak-low-y')

    group.append('line')
      .attr('class', 'stopper peak-stopper peak-high-y')

    group.append('circle')
      .attr('r', 4)
      .attr('class', 'peak-mark')
  }

  /**
   * Setup predictions
   * Five points (with current), a path joining them and an area
   */
  setupPrediction() {
    let group = this.svg.append('g')
        .attr('class', 'prediction-group')

    group.append('path')
      .attr('class', 'area-prediction')

    group.append('path')
      .attr('class', 'line-prediction')

    // Add circles
    group.selectAll('.point-prediction')
      .enter()
      .append('circle')
      .attr('class', 'point-prediction')
  }

  /**
   * Setup actual data markers
   */
  setupActual() {
    let group = this.svg.append('g')
        .attr('class', 'actual-group')

    group.append('path')
      .attr('class', 'line-actual')

    group.selectAll('.point-actual')
      .enter()
      .append('circle')
      .attr('class', 'point-actual')
  }

  /**
   * Setup overlay for mouse events
   */
  setupOverlay() {
    let d3 = this.d3,
        xScale = this.xScale,
        yScale = this.yScale

    // Add vertical line
    let line = this.svg.append('line')
        .attr('class', 'hover-line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', this.height)
        .style('display', 'none')

    this.svg.append('rect')
      .attr('class', 'overlay')
      .attr('height', this.height)
      .attr('width', this.width)
      .on('mouseover', () => line.style('display', null))
      .on('mouseout', () => line.style('display', 'none'))
      .on('mousemove', function() {
        let mousePos = d3.mouse(this)

        // Move the follow line
        line
          .attr('x1', mousePos[0])
          .attr('x2', mousePos[0])
      })
  }

  /**
   * Setup legend
   */
  setupLegend() {
  }

  // plot data
  plotData(chartData) {
    let d3 = this.d3,
        svg = this.svg,
        xScale = this.xScale,
        yScale = this.yScale,
        xScaleDate = this.xScaleDate

    // Reset scales and axes
    yScale.domain([0, this.getChartDataMax(chartData)])
    let weeks = chartData.actual.map(d => d.week % 100)
    xScale.domain([0, weeks.length - 1])

    // Setup a scale for ticks
    let xScalePoint = d3.scalePoint()
        .domain(weeks)
        .range([0, this.width])

    // Week domain scale for easy mapping
    let xScaleWeek = (d) => xScale(weeks.indexOf(Math.floor(d))) + d % 1

    // Week to date parser
    let dateParser = d3.timeParse('%Y-%U')
    xScaleDate.domain(d3.extent(chartData.actual.map(d => {
      let formattedDate = Math.floor(d.week / 100) + '-' + d.week % 100
      return dateParser(formattedDate)
    })))

    let xAxis = d3.axisBottom(xScalePoint)
        .tickValues(xScalePoint.domain().filter((d, i) => !(i % 2)))

    let xAxisDate = d3.axisBottom(xScaleDate)
        .ticks(d3.timeMonth)
        .tickFormat(d3.timeFormat('%b %y'))

    let yAxis = d3.axisLeft(yScale)

    svg.select('.axis-x')
      .transition().duration(200).call(xAxis)

    svg.select('.axis-x-date')
      .transition().duration(200).call(xAxisDate)

    svg.select('.axis-y')
      .transition().duration(200).call(yAxis)

    // Reset baseline
    svg.select('.baseline')
      .transition().duration(300)
      .attr('y1', yScale(chartData.baseline))
      .attr('y2', yScale(chartData.baseline))

    svg.select('.baseline-group .title')
      .transition().duration(300)
      .attr('dy', yScale(chartData.baseline))

    // Move actual markers
    let group = svg.select('.actual-group')

    let line = d3.line()
        .x(d => xScaleWeek(d.week % 100))
        .y(d => yScale(d.data))

    group.select('.line-actual')
      .datum(chartData.actual)
      .transition()
      .duration(200)
      .attr('d', line)

    let circles = group.selectAll('.point-actual')
        .data(chartData.actual)

    circles.exit().remove()

    circles.enter().append('circle')
      .merge(circles)
      .attr('class', 'point-actual')
      .transition()
      .duration(200)
      .ease(d3.easeQuadOut)
      .attr('cx', d => xScaleWeek(d.week % 100))
      .attr('cy', d => yScale(d.data))
      .attr('r', 2.5)

    // Save for later
    this.chartData = chartData

    // Set pointer in prediction data (start with last)
    this.pointer = this.chartData.predictions.length - 1

    this.weeks = weeks
    this.xScaleWeek = xScaleWeek
  }

  // Marker transition functions
  // ---------------------------

  /**
   * Move time rectangle following the prediction pointer
   */
  moveTimeRect() {
    let xPoint = this.chartData.predictions[this.pointer].week % 100
    this.svg.select('.timerect')
      .transition()
      .duration(200)
      .attr('width', this.xScaleWeek(xPoint))
  }

  /**
   * Move onset marker
   */
  moveOnset() {
    let svg = this.svg,
        xScaleWeek = this.xScaleWeek
    let onset = this.chartData.predictions[this.pointer].onsetWeek

    svg.select('.onset-mark')
      .transition()
      .duration(200)
      .attr('cx', xScaleWeek(onset.point))

    svg.select('.onset-range')
      .transition()
      .duration(200)
      .attr('x1', xScaleWeek(onset.low))
      .attr('x2', xScaleWeek(onset.high))

    svg.select('.onset-low')
      .transition()
      .duration(200)
      .attr('x1', xScaleWeek(onset.low))
      .attr('x2', xScaleWeek(onset.low))

    svg.select('.onset-high')
      .transition()
      .duration(200)
      .attr('x1', xScaleWeek(onset.high))
      .attr('x2', xScaleWeek(onset.high))
  }

  /**
   * Move peak marker
   */
  movePeak() {
    let svg = this.svg,
        xScaleWeek = this.xScaleWeek,
        yScale = this.yScale
    let pw = this.chartData.predictions[this.pointer].peakWeek,
        pp = this.chartData.predictions[this.pointer].peakPercent

    let leftW = xScaleWeek(pw.point),
        leftP = yScale(pp.point)
    svg.select('.peak-mark')
      .transition()
      .duration(200)
      .attr('cx', leftW)
      .attr('cy', leftP)

    svg.select('.peak-range-x')
      .transition()
      .duration(200)
      .attr('x1', xScaleWeek(pw.low))
      .attr('x2', xScaleWeek(pw.high))
      .attr('y1', yScale(pp.point))
      .attr('y2', yScale(pp.point))

    svg.select('.peak-range-y')
      .transition()
      .duration(200)
      .attr('x1', xScaleWeek(pw.point))
      .attr('x2', xScaleWeek(pw.point))
      .attr('y1', yScale(pp.low))
      .attr('y2', yScale(pp.high))

    svg.select('.peak-low-x')
      .transition()
      .duration(200)
      .attr('x1', xScaleWeek(pw.low))
      .attr('x2', xScaleWeek(pw.low))
      .attr('y1', yScale(pp.point) - 5)
      .attr('y2', yScale(pp.point) + 5)

    svg.select('.peak-high-x')
      .transition()
      .duration(200)
      .attr('x1', xScaleWeek(pw.high))
      .attr('x2', xScaleWeek(pw.high))
      .attr('y1', yScale(pp.point) - 5)
      .attr('y2', yScale(pp.point) + 5)

    leftW = xScaleWeek(pw.point)
    svg.select('.peak-low-y')
      .transition()
      .duration(200)
      .attr('x1', (!leftW ? 0 : leftW) - 5)
      .attr('x2', (!leftW ? 0 : leftW) + 5)
      .attr('y1', yScale(pp.low))
      .attr('y2', yScale(pp.low))

    svg.select('.peak-high-y')
      .transition()
      .duration(200)
      .attr('x1', (!leftW ? 0 : leftW) - 5)
      .attr('x2', (!leftW ? 0 : leftW) + 5)
      .attr('y1', yScale(pp.high))
      .attr('y2', yScale(pp.high))
  }

  /**
   * Move prediction points + area
   */
  movePrediction() {
    let d3 = this.d3,
        xScaleWeek = this.xScaleWeek,
        yScale = this.yScale,
        svg = this.svg

    let predictionData = this.chartData.predictions[this.pointer]
    let startWeek = predictionData.week,
        startData = this.chartData.actual.filter(d => d.week == startWeek)[0].data

    let data = [{
      week: startWeek % 100,
      data: startData,
      low: startData,
      high: startData
    }]

    let names = ['oneWk', 'twoWk', 'threeWk', 'fourWk']
    let weeks = this.getNextWeeks(startWeek)

    weeks.forEach((item, idx) => {
      data.push({
        week: item,
        data: predictionData[names[idx]].point,
        low: predictionData[names[idx]].low,
        high: predictionData[names[idx]].high
      })
    })

    let group = svg.select('.prediction-group')

    // Move circles around
    let circles = group.selectAll('.point-prediction')
        .data(data)

    circles.exit().remove()

    circles.enter().append('circle')
      .merge(circles)
      .attr('class', 'point-prediction')
      .transition()
      .duration(200)
      .ease(d3.easeQuadOut)
      .attr('cx', d => xScaleWeek(d.week))
      .attr('cy', d => yScale(d.data))
      .attr('r', 3)

    let line = d3.line()
        .x(d => xScaleWeek(d.week % 100))
        .y(d => yScale(d.data))

    group.select('.line-prediction')
      .datum(data)
      .transition()
      .duration(200)
      .attr('d', line)

    let area = d3.area()
        .x(d => xScaleWeek(d.week % 100))
        .y1(d => yScale(d.low))
        .y0(d => yScale(d.high))

    group.select('.area-prediction')
      .datum(data)
      .transition()
      .duration(200)
      .attr('d', area)
  }

  /**
   * Move all prediction specific markers
   */
  moveAll() {
    this.moveTimeRect()
    this.moveOnset()
    this.movePeak()
    this.movePrediction()
  }

  /**
   * Increment pointer and redraw
   */
  stepForward() {
    this.pointer = Math.min(this.chartData.predictions.length - 1, ++this.pointer)
    this.moveAll()
  }

  /**
   * Decrement pointer and redraw
   */
  stepBackward() {
    this.pointer = Math.max(0, --this.pointer)
    this.moveAll()
  }


  // Utility functions
  // ----------------

  /**
   * Return maximum value to be displayed (y axis) in the given subset
   */
  getChartDataMax(chartData) {
    let actualMax = Math.max(...chartData.actual.map(d => d.data))
    let predictionHighMax = Math.max(...chartData.predictions.map(d => Math.max(...[
      d.oneWk.high,
      d.twoWk.high,
      d.threeWk.high,
      d.fourWk.high,
      d.peakPercent.high])))

    return 1.1 * Math.max(...[actualMax, predictionHighMax])
  }

  /**
   * Return next four week numbers for given week
   */
  getNextWeeks(currentWeek) {
    let current = this.weeks.indexOf(currentWeek % 100)
    let weeks = []
    for (let i = 0; i < 4; i++) {
      current += 1
      if (current < this.weeks.length) weeks.push(this.weeks[current])
    }
    return weeks
  }
}
