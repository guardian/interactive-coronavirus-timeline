import * as d3 from 'd3'
import ScrollyTeller from "./scrollyteller"
import { updateMap } from './globe.js'
// import customPoints from '../assets/customPoints'
import pointsWithFeature from '../assets/data'
const casesCt = d3.select('.gv-ticker__cases')
const deathsCt = d3.select('.gv-ticker__deaths')
const dayCt = d3.select('.gv-ticker__day')
const dateCt = d3.select('.gv-ticker__date')

casesCt.text(pointsWithFeature[0].totalCases);
deathsCt.text(pointsWithFeature[0].totalDeaths);

updateMap(pointsWithFeature[0], pointsWithFeature[0].cases)

pointsWithFeature.forEach((d, i) => {
  const div = d3.select(".scroll-text")
  .append('div')
  .attr('class', d.keyDay === "TRUE" ? 'scroll-text__inner' : 'scroll-text__inner scroll-text__inner--half')
  
  if (d.keyDay === "TRUE") {
    div.html(
      `<div class="scroll-text__div div-key">
        <div class='date-bullet'>&nbsp;</div>
        <h2 class='h2-key-date'>
          <span>Day ${i + 1}</span> /
          <span>Case ${d.totalCases}</span>
        </h2>
        <h3 class='h3-key-date'>${d.displayDate}</h3>
        <p>${d.keyDayCopy}</p>
      </div>`
    )
  } else {
    div.html(
      `<div class="scroll-text__div">
        <div class='date-bullet date-bullet--small'>&nbsp;</div>
      </div>`
    )
  }
})

const scrolly = new ScrollyTeller({
  parent: document.querySelector("#scrolly-1"),
  triggerTop: 1/3, // percentage from the top of the screen that the trigger should fire
  triggerTopMobile: 0.75,
  transparentUntilActive: false

});

const bullets = document.querySelectorAll('.date-bullet')

pointsWithFeature.forEach((d, i) => scrolly.addTrigger({ num: i + 1, do: () => {
  bullets.forEach(b => b.classList.remove('date-bullet--full'))
  bullets[i].classList.add('date-bullet--full')
  const displayDate = d.displayDate.split(" ")
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
      const i = d3.interpolate(currentVal, parseInt(d.totalDeaths))

      return (t) => {
        deathsCt.text(parseInt(i(t)));
      }
    });

  dayCt
    .transition()
    .duration(500)
    .tween('text', function () {


      const currentVal = parseInt(this.textContent.split(" ")[1].replace(/,/g, ""));

      const i = d3.interpolate(currentVal, parseInt(d.day))

      return (t) => {
        dayCt.text(`Day ${parseInt(i(t))}`);
      }
    });

  dateCt
    .transition()
    .duration(500)
    .tween('text', function () {

      const currentDay = parseInt(this.textContent.split(" ")[0].replace(/,/g, ""));
      // const currentYear = parseInt(this.textContent.split(" ")[2].replace(/,/g, ""));

      const i = d3.interpolate(currentDay, parseInt(d.displayDate.split(" ")[0]))

      return (t) => {
        dateCt.text(`${parseInt(i(t))} ${displayDate[1]} ${displayDate[2]}`);
      }
    });





  updateMap(d, d.cases) 
}}))

scrolly.watchScroll()