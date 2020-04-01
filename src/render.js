import templateHTML from "./src/templates/main.html!text"
import rp from 'request-promise'
import { writeFileSync } from 'fs'
import * as topojson from 'topojson'
import countriesLow from './assets/countries__.json'
import { set } from 'd3-collection'

export async function render() {
    const data = await rp('https://interactive.guim.co.uk/docsdata-test/1QIw3MRZDHT2xsLpZ1p9pa0nH1XydmGx7U3n9B2pESmI.json')
    const json = await JSON.parse(data)
    
    const points = [{
        area: ['China'],
        date: 'Jan 21'
    }, {
        area: ['China', 'United States of America'],
        date: 'Jan 22'
    }, {
        area: ['Macao', 'South Korea'],
        date: 'Jan 23'
    }, {
        area: ['China', 'Singapore', 'Vietnam'],
        date: 'Jan 24'
    }, {
        area: ['France'],
        date: 'Jan 25'
    }, {
        area: ['Malaysia', 'Nepal'],
        date: 'Jan 26'
    }, {
        area: ['Australia', 'Canada'],
        date: 'Jan 27'
    }, {
        area: ['Cambodia', 'Germany', 'Sri Lanka'],
        date: 'Jan 28'
    }, {
        area: ['Finland', 'United Arab Emirates'],
        date: 'Jan 29'
    }, {
        area: ['India', 'Philippines'],
        date: 'Jan 30'
    }, {
        area: ['Italy', 'Russia', 'Sweden', 'United Kingdom'],
        date: 'Jan 31'
    }, {
        area: ['Spain'],
        date: 'Feb 1'
    }, {
        area: ['Belgium'],
        date: 'Feb 4'
    }];

    
    const dates = Object.keys(json.sheets.main_cases[0]).filter(key => key.indexOf(' ') > -1)



    // console.log(data.sheets.main_cases)
    const places = json.sheets.main_cases.map(place => {
        return {
            province: place['Province/State'],
            country: place['Country/Region'],
            lat: place.Lat,
            lon: place.Long,
            cases: dates.map(date => ({ date, cases: place[date] }))
        }
    })

    const pointsWithCases = points.map(d => {
        const currentDate = d.date;
        let cases = []

        places.forEach(p => {
            let currentCases = p.cases.find(c => c.date === currentDate)

            if (currentCases.cases > 0) {
                cases.push({ lat: p.lat, lon: p.lon, cases: currentCases.cases })
            }

        });

        return Object.assign({}, d, { cases })
    })


    const pointsWithFeature = pointsWithCases.map(d => {
        const cSet = set(d.area)
        return Object.assign({}, d, {
            cSet,
            features: topojson.feature(countriesLow, {
                type: "GeometryCollection",
                geometries: countriesLow.objects.countries.geometries.filter(c => cSet.has(c.properties.NAME))
            })
        })
    })
    // console.log(pointsWithFeature)
    writeFileSync('src/assets/data.json', JSON.stringify(pointsWithFeature))

    return templateHTML;
}