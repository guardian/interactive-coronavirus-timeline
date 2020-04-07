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
    
    /* NIKOS SCRIPT */
    const totals = json.sheets.totals

    const out = []

    const keys = []

    totals.forEach(row => {
        keys.push(row.day)
    })

    const fakeKeys = Object.keys(totals[0]).filter(k => k !== 'day')

    const withoutHeader = fakeKeys.map(k => {
        return totals.map(row => row[k])
    })

    const withHeader = withoutHeader.map((arr, i) => {

        const out = { day: i + 1 }

        arr.forEach((el, i) => {

            out[keys[i]] = el

        })

        return out

    })

    /* NIKOS SCRIPT */ 


    // const dates = json.sheets.output.map(d => d.displayDate)
    const dates = withHeader.map(d => d.displayDate)

    const canada = json.sheets.places.filter(place => place['Country/Region'] === 'Canada');
    const aussie = json.sheets.places.filter(place => place['Country/Region'] === 'Australia');

    const places = json.sheets.places
    .filter(place => place['Country/Region'] !== 'Canada')
    .filter(place => place['Country/Region'] !== 'Australia')
    .map(place => ({
            province: place['Province/State'],
            country: place['Country/Region'],
            lat: place.Lat,
            lon: place.Long,
            iso:place.ISO_A3,
            cases: dates.map(date => ({ date, cases: place[date] }))
    }))
    .concat({
        province: 'Canada',
        country: 'Canada',
        lat: '59.980158',
        lon: '-109.9936007',
        iso:'CAN',
        cases: dates.map(date => ({ date, cases: canada.map(region => Number(region[date])).reduce((a, b) => a + b) }))
    })
    .concat({
        province: 'Australia',
        country: 'Australia',
        lat: '-24.649542',
        lon: '133.0017953',
        iso:'AUS',
        cases: dates.map(date => ({ date, cases: aussie.map(region => Number(region[date])).reduce((a, b) => a + b) }))
    })

    const datesWithLocalisedCases = withHeader.map(d => {
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
                cases.push({ iso:p.iso, lat: p.lat, lon: p.lon, cases: currentCases.cases })
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