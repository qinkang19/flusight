// Utilities

/**
 * Return values scaled by baseline
 */
export const baselineScale = (values, baseline) => {
  return values.map(d => {
    return {
      week: d.week,
      data: baseline ? ((d.data / baseline) - 1) * 100 : -1
    }
  })
}

/**
 * Get data with maximum lag
 * First element of the lag array
 */
export const getMaxLagData = actual => {
  return actual.map(d => {
    let dataToReturn = -1
    // Handle zero length values
    if (d.data.length !== 0) {
      dataToReturn = d.data[0].value
    }
    return {
      week: d.week,
      data: dataToReturn
    }
  })
}

/**
 * Return data for choropleth using actual values
 */
export const actualChoroplethData = (state, getters) => {
  let seasonId = getters.selectedSeason
  let relative = getters.choroplethRelative

  let output = {
    data: [],
    type: relative ? 'diverging' : 'sequential',
    decorator: relative ? x => x + ' % (baseline)' : x => x + ' %'
  }

  state.data.map(r => {
    let values = getMaxLagData(r.seasons[seasonId].actual)

    if (relative) values = baselineScale(values, r.seasons[seasonId].baseline)

    output.data.push({
      region: r.subId,
      states: r.states,
      value: values
    })
  })

  output.data = output.data.slice(1) // Remove national data

  return output
}

/**
 * Trim history data to fit in length 'numWeeks'
 */
export const trimHistory = (historyActual, numWeeks) => {
  let historyTrimmed = historyActual.slice()

  if (numWeeks === 52) {
    // Clip everyone else to remove 53rd week
    historyTrimmed = historyTrimmed.filter(d => d.week % 100 !== 53)
  } else if (historyTrimmed.length === 52) {
    // Expand to add 53rd week
    // Adding a dummy year 1000, this will also help identify the adjustment
    historyTrimmed.splice(23, 0, {
      week: 100053,
      data: (historyTrimmed[22].data + historyTrimmed[23].data) / 2.0
    })
  }

  return historyTrimmed
}

/**
 * Return range for choropleth color scale
 */
export const choroplethDataRange = (state, getters) => {
  let maxVals = []
  let minVals = []

  state.data.map(region => {
    region.seasons.map(season => {
      let actual = getMaxLagData(season.actual).map(d => d.data).filter(d => d !== -1)

      if (getters.choroplethRelative) {
        // Use baseline scaled data
        maxVals.push(Math.max(...actual.map(d => ((d / season.baseline) - 1) * 100)))
        minVals.push(Math.min(...actual.map(d => ((d / season.baseline) - 1) * 100)))
      } else {
        maxVals.push(Math.max(...actual))
        minVals.push(Math.min(...actual))
      }
    })
  })

  return [Math.min(...minVals), Math.max(...maxVals)]
}

/**
 * Return mean absolute error between preds and actual data
 * Assumes `preds` weeks are in actual
 */
export const maeStats = (preds, actual) => {
  let diffs = [
    [], // oneWk
    [], // twoWk
    [], // threeWk
    []  // fourWk
  ]

  let keys = ['oneWk', 'twoWk', 'threeWk', 'fourWk']

  preds.forEach(p => {
    let actualIndex = actual.map(d => d.week).indexOf(p.week)

    keys.forEach((key, idx) => {
      let actualData = actual[actualIndex + 1 + idx].data
      if (actualData !== -1) diffs[idx].push(Math.abs(actualData - p[key].point))
    })
  })

  return diffs.map(d => d.reduce((a, b) => a + b) / d.length)
}
