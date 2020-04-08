import * as d3 from 'd3'
import ScrollyTeller from "./scrollyteller"
import { updateMap } from './globe.js'
import { numberWithCommas, $$ } from './util.js'
// import customPoints from '../assets/customPoints'
import pointsWithFeature from '../assets/data'
const casesCt = d3.select('.gv-ticker__cases')
const deathsCt = d3.select('.gv-ticker__deaths')
const dayCt = d3.select('.gv-ticker__day')
const dateCt = d3.select('.gv-ticker__date')

casesCt.text(pointsWithFeature[0].totalCases);
deathsCt.text(pointsWithFeature[0].totalDeaths);

updateMap(pointsWithFeature[0], 0)

const scrollText = d3.select(".scroll-text")

pointsWithFeature
.concat([{}, {}, {}])
.forEach((d, i) => {
    if (i <= 99) {
    const div = scrollText
    .append('div')
    .attr('class', d.keyDay === "TRUE" ? 'scroll-text__inner' : 'scroll-text__inner scroll-text__inner--half')
    


    if (d.keyDay === "TRUE") {
      div.html(
        `<div class="scroll-text__div div-key">
          <div class='date-bullet ${i === 0 ? 'date-bullet--full' : ''}'>&nbsp;</div>
          <h2 class='h2-key-date'>
            <span>Day ${d.day}</span> /
            <span>Case ${numberWithCommas(d.totalCases)}</span>
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
  } else {
      scrollText
        .append('div')
        .attr('class', 'scroll-text__inner inner-spacer')
  }
})

const scrolly = new ScrollyTeller({
  parent: document.querySelector("#scrolly-1"),
  triggerTop: 0.4, // percentage from the top of the screen that the trigger should fire
  triggerTopMobile: 0.8,
  triggerTopTablet: 0.8,
  transparentUntilActive: false,
  bigBoxHeight: 35,
  smallBoxHeight: 10
});

const bullets = $$('.date-bullet')

pointsWithFeature
.concat([{}, {}, {}])
.forEach((d, i) => scrolly.addTrigger({ num: i, do: () => {


  if (i <= 99) {
  if (true) {
  
  // bullets.forEach(b => b.classList.remove('date-bullet--full'))
  bullets.forEach((b, j) => j <= i ? b.classList.add('date-bullet--full') : b.classList.remove('date-bullet--full'))


  // bullets[i].classList.add('date-bullet--full')

  // const displayDate = d.displayDate.split(" ")
  casesCt
    .transition()
    .duration(500)
    .tween('text', function () {
      const currentVal = parseInt(this.innerText.replace(/,/g, ""));
      const i = d3.interpolate(currentVal, parseInt(d.totalCases))
      return (t) => {
        // if (i(t) !== 1) {
        //   moreThan.style.display = "inline";
        //   lessThan.style.display = "none";
        // } else {
        //   moreThan.style.display = "none";
        //   lessThan.style.display = "inline";
        // }
        casesCt.text(numberWithCommas(parseInt(i(t))));
      }
    });
  deathsCt
    .transition()
    .duration(500)
    .tween('text', function () {
      const currentVal = parseInt(this.innerText.replace(/,/g, ""));
      const i = d3.interpolate(currentVal, parseInt(d.totalDeaths))

      return (t) => {
        deathsCt.text(numberWithCommas(parseInt(i(t))));
      }
    });

  dayCt
    .transition()
    .duration(500)
    .tween('text', function () {
      const currentVal = parseInt(this.innerText.split(" ")[1].replace(/,/g, ""));
      
      const i = d3.interpolate(currentVal, parseInt(d.day))


      return (t) => {
        dayCt.text(`Day ${parseInt(i(t))}`);
      }
    });

  dateCt
    .transition()
    .duration(500)
    .tween('text', function () {

      const currentDay = parseInt(this.innerText.split(" ")[0].replace(/,/g, ""));
      const splitDate = d.displayDate ? d.displayDate.split(" ") : []
      const i = d3.interpolate(currentDay, parseInt(splitDate[0]))

      return (t) => {
        dateCt.text(`${parseInt(i(t))} ${splitDate[1]} ${splitDate[2]}`);
      }
    });
    

  updateMap(d, i)

  
}

  }
  
}}))

scrolly.watchScroll()