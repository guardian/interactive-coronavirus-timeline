import * as topojson from 'topojson'
import * as geo from 'd3-geo-projection'
import * as d3B from 'd3'
import { $ } from './util'
// import countries from '../assets/countries.json'
import countriesLow from '../assets/countries__.json'

// const countriesFC = topojson.feature(countries, countries.objects.countries);
const countriesLowFC = topojson.feature(countriesLow, countriesLow.objects.countries);

const d3 = Object.assign({}, d3B, geo);

const atomEl = $('.scroll-inner');

let isMobile = window.matchMedia('(max-width: 620px)').matches;

let width = atomEl.getBoundingClientRect().width;
let height = isMobile ? width * 1.6 : 752 * width / 1260;

const canvas = d3.select("canvas")
.attr("width", width)
.attr("height", height);

let context = canvas.node().getContext("2d");

let projection = d3.geoOrthographic()
.translate([width / 2, height / 2])
.clipAngle(90);

let path = d3.geoPath()
.projection(projection)
.context(context);

let colorLand = "#f6f6f6";
let lineLand = "#cccccc";
let colorGlobe = "#fffff3";
let textColors = "#333";

let sphere = { type: "Sphere" };

let feature;
let bounds;

let timer = d3.timer( (i) => {

            projection.rotate([0.01 * i - 120, -30, 0]);

            path.projection(projection);

            context.clearRect(0, 0, width, height);

            context.fillStyle = colorGlobe;
            context.beginPath();
            path(sphere);
            context.fill();

            context.fillStyle = colorLand;
            context.beginPath();
            path(countriesLowFC);
            context.fill();

            context.strokeStyle = lineLand;
            context.lineWidth = 0.5;
            context.stroke();


        });
timer.stop()

const radius = d3.scaleSqrt()
    .range([10, 100])
    .domain([0, 1000])

const updateMap = (d, cases) => {

    feature = d.features
    let point = d3.geoCentroid(feature);
    let currentRotate = projection.rotate();
    let currentScale = projection.scale();

    projection.rotate([-point[0], -point[1]]);
    path.projection(projection);

    bounds = path.bounds(feature);

    let nextScale = currentScale * (1.5 / Math.max((bounds[1][0] - bounds[0][0]) / (width/2), (bounds[1][1] - bounds[0][1]) / (height/2)));
    let nextRotate = projection.rotate();

    d3.transition()
    .duration(500)
    .tween('tween', () => {

        let r = d3.interpolate(currentRotate, nextRotate);
        let s = d3.interpolate(currentScale, nextScale);

        return (t) => {

            projection
            .rotate(r(t))
            .scale(s(t));

            path.projection(projection);

            context.clearRect(0, 0, width, height);

            context.fillStyle = colorGlobe;
            context.beginPath();
            path(sphere);
            context.fill();

            context.fillStyle = colorLand;
            context.beginPath();
            path(countriesLowFC);
            context.fill();

            context.strokeStyle = lineLand;
            context.lineWidth = 0.5;
            context.stroke();

            updateCases(cases)
        }
    })
}


const updateCases = (cases) =>{
    cases.forEach(c => {
            let posX = projection([c.lon, c.lat])[0];
            let posY = projection([c.lon, c.lat])[1];

            context.fillStyle = 'red';
            context.beginPath()
            context.arc(posX, posY, radius(c.cases), 0, Math.PI*2)
            context.fill();
    })
}


export { updateMap }


