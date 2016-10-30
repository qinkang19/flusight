// Markers for time chart

import * as util from '../utils/timechart'

export class Prediction {
  constructor(parent, id, color) {

    // Prediction group
    let predictionGroup = parent.svg.append('g')
        .attr('class', 'prediction-group')
        .attr('id', id + '-marker')

    predictionGroup.append('path')
      .attr('class', 'area-prediction')
      .style('fill', color)

    predictionGroup.append('path')
      .attr('class', 'line-prediction')
      .style('stroke', color)

    predictionGroup.selectAll('.point-prediction')
      .enter()
      .append('circle')
      .attr('class', 'point-prediction')
      .style('stroke', color)

    this.predictionGroup = predictionGroup

    // Create onset group
    let onsetGroup = parent.svg.append('g')
        .attr('class', 'onset-group')
        .attr('id', id + '-marker')

    let stp = 10,
        cy = parent.height - 15

    onsetGroup.append('line')
      .attr('y1', cy)
      .attr('y2', cy)
      .attr('class', 'range onset-range')

    onsetGroup.append('line')
      .attr('y1', cy - stp / 2)
      .attr('y2', cy + stp / 2)
      .attr('class', 'stopper onset-stopper onset-low')

    onsetGroup.append('line')
      .attr('y1', cy - stp / 2)
      .attr('y2', cy + stp / 2)
      .attr('class', 'stopper onset-stopper onset-high')

    onsetGroup.append('circle')
      .attr('r', 4)
      .attr('cy', cy)
      .attr('class', 'onset-mark')
      .style('stroke', util.hexToRgba(color, 0.3))
      .style('fill', color)

    this.onsetGroup = onsetGroup

    // Peak group
    let peakGroup = parent.svg.append('g')
        .attr('class', 'peak-group')
        .attr('id', id + '-marker')

    peakGroup.append('line')
      .attr('class', 'range peak-range peak-range-x')

    peakGroup.append('line')
      .attr('class', 'range peak-range peak-range-y')

    peakGroup.append('line')
      .attr('class', 'stopper peak-stopper peak-low-x')

    peakGroup.append('line')
      .attr('class', 'stopper peak-stopper peak-high-x')

    peakGroup.append('line')
      .attr('class', 'stopper peak-stopper peak-low-y')

    peakGroup.append('line')
      .attr('class', 'stopper peak-stopper peak-high-y')

    peakGroup.append('circle')
      .attr('r', 4)
      .attr('class', 'peak-mark')
      .style('stroke', util.hexToRgba(color, 0.3))
      .style('fill', color)

    this.peakGroup = peakGroup

    this.color = color
    this.id = id
    this.d3 = parent.d3
  }

  plot(parent, data, actual) {
    this.data = data
    this.actual = actual
    this.xScale = parent.xScaleWeek
    this.yScale = parent.yScale
    this.weeks = parent.weeks
  }

  update(idx) {
    let week = this.weeks[idx]

    let localPosition = this.data.map(d => d.week % 100).indexOf(week)

    if (localPosition == -1) {
      this.hide()
    } else {
      this.show()

      // Move things
      let onset = this.data[localPosition].onsetWeek

      this.onsetGroup.select('.onset-mark')
        .transition()
        .duration(200)
        .attr('cx', this.xScale(onset.point))

      this.onsetGroup.select('.onset-range')
        .transition()
        .duration(200)
        .attr('x1', this.xScale(onset.low))
        .attr('x2', this.xScale(onset.high))

      this.onsetGroup.select('.onset-low')
        .transition()
        .duration(200)
        .attr('x1', this.xScale(onset.low))
        .attr('x2', this.xScale(onset.low))

      this.onsetGroup.select('.onset-high')
        .transition()
        .duration(200)
        .attr('x1', this.xScale(onset.high))
        .attr('x2', this.xScale(onset.high))

    let pw = this.data[localPosition].peakWeek,
        pp = this.data[localPosition].peakPercent

      let leftW = this.xScale(pw.point),
          leftP = this.yScale(pp.point)
      this.peakGroup.select('.peak-mark')
        .transition()
        .duration(200)
        .attr('cx', leftW)
        .attr('cy', leftP)

      this.peakGroup.select('.peak-range-x')
        .transition()
        .duration(200)
        .attr('x1', this.xScale(pw.low))
        .attr('x2', this.xScale(pw.high))
        .attr('y1', this.yScale(pp.point))
        .attr('y2', this.yScale(pp.point))

      this.peakGroup.select('.peak-range-y')
        .transition()
        .duration(200)
        .attr('x1', this.xScale(pw.point))
        .attr('x2', this.xScale(pw.point))
        .attr('y1', this.yScale(pp.low))
        .attr('y2', this.yScale(pp.high))

      this.peakGroup.select('.peak-low-x')
        .transition()
        .duration(200)
        .attr('x1', this.xScale(pw.low))
        .attr('x2', this.xScale(pw.low))
        .attr('y1', this.yScale(pp.point) - 5)
        .attr('y2', this.yScale(pp.point) + 5)

      this.peakGroup.select('.peak-high-x')
        .transition()
        .duration(200)
        .attr('x1', this.xScale(pw.high))
        .attr('x2', this.xScale(pw.high))
        .attr('y1', this.yScale(pp.point) - 5)
        .attr('y2', this.yScale(pp.point) + 5)

      leftW = this.xScale(pw.point)
      this.peakGroup.select('.peak-low-y')
        .transition()
        .duration(200)
        .attr('x1', (!leftW ? 0 : leftW) - 5)
        .attr('x2', (!leftW ? 0 : leftW) + 5)
        .attr('y1', this.yScale(pp.low))
        .attr('y2', this.yScale(pp.low))

      this.peakGroup.select('.peak-high-y')
        .transition()
        .duration(200)
        .attr('x1', (!leftW ? 0 : leftW) - 5)
        .attr('x2', (!leftW ? 0 : leftW) + 5)
        .attr('y1', this.yScale(pp.high))
        .attr('y2', this.yScale(pp.high))

      // Move main pointers
      let predData = this.data[localPosition]

      let startWeek = predData.week,
          startData = this.actual.filter(d => d.week == startWeek)[0].data

      let data = [{
        week: startWeek % 100,
        data: startData,
        low: startData,
        high: startData
      }]

      let names = ['oneWk', 'twoWk', 'threeWk', 'fourWk']
      let nextWeeks = util.getNextWeeks(startWeek, this.weeks)

      nextWeeks.forEach((item, idx) => {
        data.push({
          week: item,
          data: predData[names[idx]].point,
          low: predData[names[idx]].low,
          high: predData[names[idx]].high
        })
      })

      let circles = this.predictionGroup.selectAll('.point-prediction')
          .data(data)

      circles.exit().remove()

      circles.enter().append('circle')
        .merge(circles)
        .attr('class', 'point-prediction')
        .transition()
        .duration(200)
        .ease(this.d3.easeQuadOut)
        .attr('cx', d => this.xScale(d.week))
        .attr('cy', d => this.yScale(d.data))
        .attr('r', 3)
        .style('stroke', this.color)

      let line = this.d3.line()
          .x(d => this.xScale(d.week % 100))
          .y(d => this.yScale(d.data))

      this.predictionGroup.select('.line-prediction')
        .datum(data)
        .transition()
        .duration(200)
        .attr('d', line)

      let area = this.d3.area()
          .x(d => this.xScale(d.week % 100))
          .y1(d => this.yScale(d.low))
          .y0(d => this.yScale(d.high))

      this.predictionGroup.select('.area-prediction')
        .datum(data)
        .transition()
        .duration(200)
        .attr('d', area)
    }
  }

  hide() {
    this.onsetGroup
      .style('visibility', 'hidden')

    this.peakGroup
      .style('visibility', 'hidden')

    this.predictionGroup
      .style('visibility', 'hidden')
  }

  show() {
    this.onsetGroup
      .style('visibility', null)

    this.peakGroup
      .style('visibility', null)

    this.predictionGroup
      .style('visibility', null)
  }

  clear() {
    this.onsetGroup.remove();
    this.peakGroup.remove();
    this.predictionGroup.remove();
  }
}

/**
 * Time rectangle for navigation guidance
 */
export class TimeRect {
  constructor(parent) {
    this.rect = parent.svg.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 0)
      .attr('height', parent.height)
      .attr('class', 'timerect')
  }

  plot(parent, data) {
    // Save local data
    this.data = data
    this.scale = parent.xScaleWeek
  }

  update(idx) {
    this.rect
      .transition()
      .duration(200)
      .attr('width', this.scale(this.data[idx].week % 100))
  }
}

export class HistoricalLines {
  constructor(parent) {
    //
  }

  plot(parent, data) {
    //
  }

  hide() {
    //
  }

  show() {
    //
  }

  clear() {
    //
  }
}

export class Legend {
  //
}

/**
 * CDC Baseline
 */
export class Baseline {
  constructor(parent) {
    let group = parent.svg.append('g')
      .attr('class', 'baseline-group')

    group.append('line')
      .attr('x1', 0)
      .attr('y1', parent.height)
      .attr('x2', parent.width)
      .attr('y2', parent.height)
      .attr('class', 'baseline')

    let text = group.append('text')
        .attr('class', 'title')
        .attr('transform', 'translate(' + (parent.width + 10) + ', 0)')
    text.append('tspan')
      .text('CDC')
      .attr('x', 0)
    text.append('tspan')
      .text('Baseline')
      .attr('x', 0)
      .attr('dy', '1em')

    this.group = group
  }

  plot(parent, data) {
    this.group.select('.baseline')
      .transition()
      .duration(300)
      .attr('y1', parent.yScale(data))
      .attr('y2', parent.yScale(data))

    this.group.select('.title')
      .transition()
      .duration(300)
      .attr('dy', parent.yScale(data))
  }
}

/**
 * Actual line
 */
export class Actual {
  constructor(parent) {
    let group = parent.svg.append('g')
        .attr('class', 'actual-group')

    group.append('path')
      .attr('class', 'line-actual')

    group.selectAll('.point-actual')
      .enter()
      .append('circle')
      .attr('class', 'point-actual')

    this.group = group
  }

  plot(parent, data) {
    let line = parent.d3.line()
        .x(d => parent.xScaleWeek(d.week % 100))
        .y(d => parent.yScale(d.data))

    // Save data for queries
    this.data = data

    this.group.select('.line-actual')
      .datum(this.data.filter(d => d != -1))
      .transition()
      .duration(200)
      .attr('d', line)

    // Only plot non -1
    let circles = this.group.selectAll('.point-actual')
        .data(this.data.filter(d => d != -1))

    circles.exit().remove()

    circles.enter().append('circle')
      .merge(circles)
      .attr('class', 'point-actual')
      .transition(200)
      .ease(parent.d3.easeQuadOut)
      .attr('cx', d => parent.xScaleWeek(d.week % 100))
      .attr('cy', d => parent.yScale(d.data))
      .attr('r', 2)
  }

  query(idx) {
    // TODO: handle NAs
    return this.data[idx].data
  }
}
