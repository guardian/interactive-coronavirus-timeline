import templateHTML from "./src/templates/main.html!text"
import rp from 'request-promise'
import { writeFileSync } from 'fs'
import * as topojson from 'topojson'
import countriesLow from './assets/countries__.json'
import * as d3B from 'd3'
import * as geo from 'd3-geo-projection'
// import customPoints from './assets/customPoints'
import { set } from 'd3-collection'

const d3 = Object.assign({}, d3B, geo);

export async function render() {
    // const data = await rp('https://interactive.guim.co.uk/docsdata-test/1QIw3MRZDHT2xsLpZ1p9pa0nH1XydmGx7U3n9B2pESmI.json')
    const data = await rp('https://interactive.guim.co.uk/docsdata-test/1KVnPUoUDkracHpXlQapzIjsHOs9DtnrvNM8gsWarR3Q.json')
    const json = await JSON.parse(data)
    
    // const dates = Object.keys(json.sheets.places[0]).filter(key => key.indexOf(' ') > -1)
    // const dates = Object.keys(json.sheets.place).filter(key => key.indexOf(' ') > -1)
    const dates = json.sheets.output.map(d => d.displayDate)

    const places = json.sheets.places.map(place => {
        return {
            province: place['Province/State'],
            country: place['Country/Region'],
            lat: place.Lat,
            lon: place.Long,
            cases: dates.map(date => ({ date, cases: place[date] }))
        }
    })

    const datesWithLocalisedCases = json.sheets.output.map(d => {
        d.totalCases = d.cases
        d.totalDeaths = d.deaths
        delete d.cases
        delete d.deaths
        return d
    })
    .map(d => {
        const currentDate = d.displayDate;
        let cases = []

        places.forEach(p => {
            let currentCases = p.cases.find(c => c.date === currentDate)

            if (currentCases.cases > 0) {
                cases.push({ lat: p.lat, lon: p.lon, cases: currentCases.cases })
            }

        });

        return Object.assign({}, d, { cases })
    })


    const pointsWithFeature = datesWithLocalisedCases.map(d => {
        const cSet = set(d.areas ? JSON.parse(d.areas) : [])

        const features = topojson.feature(countriesLow, {
            type: "GeometryCollection",
            geometries: countriesLow.objects.countries.geometries.filter(c => cSet.has(c.properties.ISO_A3))
        })

        return Object.assign({}, d, {
            cSet,
            point: d3.geoCentroid(features),
            fLengthPos: features.features.length > 0
        })
    })
    // console.log(pointsWithFeature)
    writeFileSync('src/assets/data.json', JSON.stringify(pointsWithFeature))

    return templateHTML;
}