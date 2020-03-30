//import rotating from './rotating-globe.js'
import globe from './globe.js'
import loadJson from '../components/load-json'
import * as d3 from 'd3'

import ScrollyTeller from "./scrollyteller"

import { updateMap } from './globe.js'



const points = [{
    area: ['China'],
    date:'Jan 21'
}, {
    area: ['China', 'United States of America'],
    date:'Jan 22'
}, {
    area: ['Macao', 'South Korea'],
    date:'Jan 23'
}, {
    area: ['China', 'Singapore', 'Vietnam'],
    date:'Jan 24'
}, {
    area: ['France'],
    date:'Jan 25'
}, {
    area: ['Malaysia', 'Nepal'],
    date:'Jan 26'
}, {
    area: ['Australia', 'Canada'],
    date:'Jan 27'
}, {
    area: ['Cambodia', 'Germany', 'Sri Lanka'],
    date:'Jan 28'
}, {
    area: ['Finland', 'United Arab Emirates'],
    date:'Jan 29'
}, {
    area: ['India', 'Philippines'],
    date:'Jan 30'
}, {
    area: ['Italy', 'Russia', 'Sweden', 'United Kingdom'],
    date:'Jan 31'
}, {
    area: ['Spain'],
    date:'Feb 1'
}, {
    area: ['Belgium'],
    date:'Feb 4'
}];

loadJson('https://interactive.guim.co.uk/docsdata-test/1QIw3MRZDHT2xsLpZ1p9pa0nH1XydmGx7U3n9B2pESmI.json')
.then(fileRaw => {


  let data = [];
  let currentDate =  points[0].date;


  let places = []

  fileRaw.sheets.main_cases.map((place, i) => {

        //data.push([place.Lat,place.Long])

        places.push({province:place['Province/State'], country:place['Country/Region'], lat:place.Lat, lon:place.Long, cases:[]})

        Object.getOwnPropertyNames(place).map(name =>{
          if(name.indexOf(' ') > -1)
          {
            places[i].cases.push({date:name, cases:+place[name]})
          }
        })
  })


  //console.log(places)


  //console.log(places)

  //  rotating(data)

  //globe()

  points.map( (d,i) => {

    let div = d3.select(".scroll-text")
    .append('div')
    .attr('class', 'scroll-text__inner')

    div.html(
            '<div class="scroll-text__div">' +
              '<p>'+ d.area +'</p>' +
              '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur non ligula eu magna luctus venenatis. Vestibulum eu auctor enim</p>' +
            '</div>'
            )

  })

  const scrolly = new ScrollyTeller({

    parent: document.querySelector("#scrolly-1"),
    triggerTop: 1/3, // percentage from the top of the screen that the trigger should fire
    triggerTopMobile: 0.75,
    transparentUntilActive: true

  });

  points.map( (d,i) => {

    scrolly.addTrigger({num: i+1 , do: () => {

      currentDate = points[i].date;

      let cases = []

      places.map(p => {

        let currentCases = (p.cases.find(c => c.date === currentDate))

        if(currentCases.cases > 0)
        {
          cases.push({lat:p.lat, lon:p.lon, cases:currentCases.cases})
        }

      });

      console.log(d)

     updateMap(d, cases);

    }});

  })
  
  scrolly.watchScroll();

})