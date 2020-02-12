import loadJson from '../components/load-json'
import * as topojson from 'topojson'
import * as geo from 'd3-geo-projection'
import * as d3B from 'd3'
import { $ } from './util'
import countries from '../assets/countries.json'

const d3 = Object.assign({}, d3B, geo);

const atomEl = $('.interactive-wrapper');

let width = atomEl.getBoundingClientRect().width;
let height = width * 0.5;

let points = [{
    type: "Point",
    coordinates: [102.4475613, 34.2710744],
    zoom: 6,
    location: "China",
    icon: "\uF015"
}, {
    type: "Point",
    coordinates: [138.9170553, 35.9780493],
    zoom: 12,
    location: "Japan",
    icon: "\uF236"
}, {
    type: "Point",
    coordinates: [128.4074583, 36.2336453],
    zoom: 14,
    location: "South Korea",
    icon: "\uF236"
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
.text(d => d.location)
.on('click', d => {

    let feature = topojson.feature(countries, countries.objects.countries).features.find(c => c.properties.CNTRY_NAME === d.location)


    let interpolationR = interpolateRotation(projection.rotate(), [-d3.geoCentroid(feature)[0], -d3.geoCentroid(feature)[1]]);


    let scale = getScale(feature)


    let interpolationS = interpolateScale(projection.scale(), scale)


    d3.transition()
    .duration(1000)
    .tween('tween', d => (t) => {

        projection.rotate(interpolationR(t));

        projection.scale(interpolationS(t))

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


    })
})


const canvas = d3.select(".interactive-wrapper").append("canvas")
.attr("width", width)
.attr("height", height);

let context = canvas.node().getContext("2d");

let point = d3.geoCentroid(points[0]);

let chinaFeature = topojson.feature(countries, countries.objects.countries).features.find(c => c.properties.CNTRY_NAME === 'China')

let projection = d3.geoOrthographic()
.rotate([-point[0], -point[1]]);

let path = d3.geoPath()
.projection(projection)
.context(context);


projection.scale(getScale(chinaFeature))
.rotate([-point[0], -point[1]]);

let colorLand = "#f6f6f6";
let lineLand = "#cccccc";
let colorGlobe = "#fffff3";
let textColors = "#333";

let sphere = { type: "Sphere" };
let land = topojson.feature(countries, countries.objects.countries);
let i = 0;

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





