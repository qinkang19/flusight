/**
 * Script for downloading actual data files
 * Files are kept in ./scripts/assets/<season-id>-actual.json
 */

const utils = require('./utils')
const path = require('path')
const fs = require('fs')
const fct = require('flusight-csv-tools')
const mmwr = require('mmwr-week')

// Variables and paths
const dataDir = './data'
const outputDir = './scripts/assets'

console.log(' Downloading actual data from delphi epidata API')
console.log(' -----------------------------------------------')
console.log(' Messages overlap due to concurrency. Don\'t read too much.\n')

// Look for seasons in the data directory
let seasons = utils.getSubDirectories(dataDir)

// Stop if no folder found
if (seasons.length === 0) {
  console.log(' ✕ No seasons found in data directory!')
  process.exit(1)
}

// Print seasons
console.log(` Found ${seasons.length} seasons:`)
seasons.forEach(s => console.log(' ' + s))
console.log('')

function getActual (season, callback) {
  let seasonId = parseInt(season.split('-')[0])
  fct.truth.getSeasonDataAllLags(seasonId)
    .then(d => {
      // Transfer data for the format used in flusight
      // TODO: Use the standard format set in fct
      fct.meta.regionIds.forEach(rid => {
        d[rid].forEach(({ epiweek, wili, lagData }, idx) => {
          d[rid][idx] = {
            week: epiweek,
            actual: wili,
            lagData: lagData.map(ld => {
              return { lag: ld.lag, value: ld.wili }
            })
          }
        })
      })

      // Fill in nulls for weeks not present in the data
      let epiweeks = fct.utils.epiweek.seasonEpiweeks(seasonId)
      fct.meta.regionIds.forEach(rid => {
        let availableWeeks = d[rid].map(({ week }) => week)
        epiweeks.forEach(ew => {
          if (availableWeeks.indexOf(ew) === -1) {
            d[rid].push({
              week: ew,
              actual: null,
              lagData: []
            })
          }
        })
      })

      callback(d)
    })
    .catch(e => {
      console.log(`Error while processing ${season}`)
      console.log(e)
      process.exit(1)
    })
}

seasons.forEach(season => {
  let seasonOutFile = path.join(outputDir, `${season}-actual.json`)

  console.log(` Downloading data for ${season}`)
  getActual(season, actualData => {
    fs.writeFile(seasonOutFile, JSON.stringify(actualData), (err) => {
      if (err) throw err
      console.log(` ✓ File written at ${seasonOutFile}`)
    })
  })
})
