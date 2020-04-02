import * as d3 from 'd3'
import ScrollyTeller from "./scrollyteller"
import { updateMap } from './globe.js'
import customPoints from '../assets/customPoints'
import pointsWithFeature from '../assets/data'
const casesCt = d3.select('.gv-ticker__cases')
const deathsCt = d3.select('.gv-ticker__deaths')
const recoveredCt = d3.select('.gv-ticker__recovered')

casesCt.text(pointsWithFeature[0].totalCases);
deathsCt.text(pointsWithFeature[0].totalDeathsMOCKDATA);
recoveredCt.text(pointsWithFeature[0].totalRecoveriesMOCKDATA);

updateMap(pointsWithFeature[0], pointsWithFeature[0].cases)

customPoints.forEach(d => {
  const div = d3.select(".scroll-text")
  .append('div')
  .attr('class', d.keyDay === true ? 'scroll-text__inner' : 'scroll-text__inner scroll-text__inner--half')
  
  if (d.keyDay === true) {
    div.html(
      '<div class="scroll-text__div">' +
        '<p>' + d.area + '</p>' +
        '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur non ligula eu magna luctus venenatis. Vestibulum eu auctor enim</p>' +
      '</div>'
    )
  } else {
    div.html('<div class="scroll-text__div">' + '</div>')
  }
})

const scrolly = new ScrollyTeller({
  parent: document.querySelector("#scrolly-1"),
  triggerTop: 1/3, // percentage from the top of the screen that the trigger should fire
  triggerTopMobile: 0.75,
  transparentUntilActive: true

});

pointsWithFeature.forEach((d, i) => scrolly.addTrigger({ num: i + 1, do: () => {
  casesCt
    .transition()
    .duration(500)
    .tween('text', function () {
      const currentVal = parseInt(this.textContent.replace(/,/g, ""));
      const i = d3.interpolate(currentVal, parseInt(d.totalCases))
      return (t) => {
        // if (i(t) !== 1) {
        //   moreThan.style.display = "inline";
        //   lessThan.style.display = "none";
        // } else {
        //   moreThan.style.display = "none";
        //   lessThan.style.display = "inline";
        // }
        casesCt.text(parseInt(i(t)));
      }
    });
  deathsCt
    .transition()
    .duration(500)
    .tween('text', function () {
      const currentVal = parseInt(this.textContent.replace(/,/g, ""));
      const i = d3.interpolate(currentVal, parseInt(d.totalDeathsMOCKDATA))

      return (t) => {
        deathsCt.text(parseInt(i(t)));
      }
    });
  recoveredCt
    .transition()
    .duration(500)
    .tween('text', function () {
      const currentVal = parseInt(this.textContent.replace(/,/g, ""));
      const i = d3.interpolate(currentVal, parseInt(d.totalRecoveriesMOCKDATA))
      return (t) => {
        recoveredCt.text(parseInt(i(t)));
      }
    });


  updateMap(d, d.cases) 
}}))

scrolly.watchScroll()