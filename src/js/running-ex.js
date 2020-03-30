import loadJson from '../components/load-json'
import * as topojson from 'topojson'
import * as geo from 'd3-geo-projection'
import * as d3B from 'd3'
import { $ } from './util'
import countries from '../assets/countries.json'

const d3 = Object.assign({}, d3B, geo);

const atomEl = $('.interactive-wrapper');

let isMobile = window.matchMedia('(max-width: 620px)').matches;

let width = atomEl.getBoundingClientRect().width;
let height = isMobile ? width * 1.6 : width * 0.5;

let points = [{
    area: ['China']
}, {
    area: ['Japan', 'Taiwan','Thailand', 'United Sates']
}, {
    area: ['Macau', 'South Korea']
}, {
    area: ['Hong Kong', 'Singapore', 'Vietnam']
}, {
    area: ['France']
}, {
    area: ['Malaysia', 'Nepal']
}, {
    area: ['Australia', 'Canada']
}, {
    area: ['Cambodia', 'Germany', 'Sri Lanka']
}, {
    area: ['Finland', 'United Arab Emirates']
}, {
    area: ['India', 'Philippines']
}, {
    area: ['Italy', 'Russia', 'Sweden', 'United Kingdom']
}, {
    area: ['Spain']
}, {
    area: ['Belgium']
}];

const interpolateRotation = (initial, end) =>{

    return d3.geoInterpolate(initial, end);

}

const interpolateScale = (initial, end) =>{

    return d3.interpolate(initial, end);

}


const getScale = (feature) => {
    let bounds  = path.bounds(feature);
    let hscale  = projection.scale() * width  / (bounds[1][0] - bounds[0][0]);
    let vscale  = projection.scale() * height / (bounds[1][1] - bounds[0][1]);
    let scale   = (hscale < vscale) ? hscale : vscale;

    return scale
}

d3.select('.interactive-wrapper').selectAll('button')
.data(points)
.enter()
.append('button')
.text(d => d.area)
.on('click', d => {


    let selected = d3.set(d.area)

    let feature = topojson.merge(countries, countries.objects.countries.geometries.filter(c => selected.has(c.properties.CNTRY_NAME)))

    let point = d3.geoCentroid(feature);

    let currentRotate = projection.rotate();
    let currentScale = projection.scale();

    projection.rotate([-point[0], -point[1]]);
    path.projection(projection);

    let bounds  = path.bounds(feature);
    let nextScale = currentScale * (1.5 / Math.max((bounds[1][0] - bounds[0][0]) / (width/2), (bounds[1][1] - bounds[0][1]) / (height/2)));
    let nextRotate = projection.rotate();

    console.log(nextScale)

    d3.transition()
    .duration(1000)
    .tween('tween', d => {

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
            path(land);
            context.fill();

            context.strokeStyle = lineLand;
            context.lineWidth = 0.5;
            context.stroke();
        }


    })
})


const canvas = d3.select(".interactive-wrapper").append("canvas")
.attr("width", width)
.attr("height", height);

let context = canvas.node().getContext("2d");

let selected = d3.set(points[0].area)

let feature = topojson.merge(countries, countries.objects.countries.geometries.filter(c => selected.has(c.properties.CNTRY_NAME)))

let point = d3.geoCentroid(feature);

let projection = d3.geoOrthographic()
.rotate([-point[0], -point[1]])
.translate([width / 2, height / 2])
.clipAngle(90);

let path = d3.geoPath()
.projection(projection)
.context(context);

let bounds = path.bounds(feature);

let scale = projection.scale() * 1 / Math.max((bounds[1][0] - bounds[0][0]) / (width/2), (bounds[1][1] - bounds[0][1]) / (height/2));

projection.scale(isMobile ? 484.1445606022003 : 755.358861794657)

let colorLand = "#f6f6f6";
let lineLand = "#cccccc";
let colorGlobe = "#fffff3";
let textColors = "#333";

let sphere = { type: "Sphere" };
let land = topojson.feature(countries, countries.objects.countries);

context.fillStyle = colorGlobe;
context.beginPath();
path(sphere);
context.fill();

context.fillStyle = colorLand;
context.beginPath();
path(land);
context.fill();

context.strokeStyle = lineLand;
context.lineWidth = 0.5;
context.stroke();