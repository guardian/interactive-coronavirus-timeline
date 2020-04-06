import templateHTML from "./src/templates/main.html!text"
import rp from 'request-promise'
import { writeFileSync } from 'fs'
import * as topojson from 'topojson'
import countriesLow from './assets/countries__.json'
// import customPoints from './assets/customPoints'
import { set } from 'd3-collection'


export async function render() {
    // const data = await rp('https://interactive.guim.co.uk/docsdata-test/1QIw3MRZDHT2xsLpZ1p9pa0nH1XydmGx7U3n9B2pESmI.json')
    const data = await rp('https://interactive.guim.co.uk/docsdata-test/1KVnPUoUDkracHpXlQapzIjsHOs9DtnrvNM8gsWarR3Q.json')
    const json = await JSON.parse(data)
    
    // const dates = Object.keys(json.sheets.places[0]).filter(key => key.indexOf(' ') > -1)
    // const dates = Object.keys(json.sheets.place).filter(key => key.indexOf(' ') > -1)
    const dates = json.sheets.output.map(d => d.displayDate)

    const canada = json.sheets.places.filter(place => place['Country/Region'] === 'Canada');

    let canObj = {
        province:'Canada',
        country:'Canada',
        lat:'53.1355',
        lon:'-57.6604',
        cases:[]
    }

    dates.map(d => {
        canObj.cases[d] = 0;
    })

    const canadaCases = canada.map(c => {

        let names = Object.getOwnPropertyNames(c);

        names.map( (n,i) => {

            if(i >4) canObj.cases[n] += +c[n]
            
        })

    });

    const places = json.sheets.places.map(place => {

        /*if(place['Country/Region'] != 'Canada')
        {
            */return {
                province: place['Province/State'],
                country: place['Country/Region'],
                lat: place.Lat,
                lon: place.Long,
                cases: dates.map(date => ({ date, cases: place[date] }))
            }
        /*}
        else{
            return canObj
        }*/

        
    })

    console.log('========================', places)

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
        
        return Object.assign({}, d, {
            cSet,
            features: topojson.feature(countriesLow, {
                type: "GeometryCollection",
                geometries: countriesLow.objects.countries.geometries.filter(c => cSet.has(c.properties.ISO_A3))
            }),
            // totalCases: d.cases.map(c => c.cases).reduce((a, b) => Number(a) + Number(b))
        })
    })
    // console.log(pointsWithFeature)
    writeFileSync('src/assets/data.json', JSON.stringify(pointsWithFeature))

    return templateHTML;
}