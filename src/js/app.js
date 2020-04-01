import { select } from 'd3-selection'
// import { set } from 'd3-collection'
import ScrollyTeller from "./scrollyteller"
import { updateMap } from './globe.js'
// import countriesLow from '../assets/countries__.json'
import customPoints from '../assets/customPoints'
import pointsWithFeature from '../assets/data'

updateMap(pointsWithFeature[0], pointsWithFeature[0].cases)
// import * as topojson from 'topojson'

customPoints.forEach(d => {
  let div = select(".scroll-text")
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

pointsWithFeature.forEach((d, i) => scrolly.addTrigger({ num: i + 1, do: () => updateMap(d, d.cases) }))

scrolly.watchScroll()