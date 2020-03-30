import * as topojson from 'topojson'
import * as geo from 'd3-geo-projection'
import * as d3B from 'd3'
import { $ } from './util'
import countries from '../assets/countries.json'
import countriesLow from '../assets/countries__.json'


export default (data) => {

}

const d3 = Object.assign({}, d3B, geo);

const atomEl = $('.scroll-inner');

let isMobile = window.matchMedia('(max-width: 620px)').matches;

let width = atomEl.getBoundingClientRect().width;
let height = isMobile ? width * 1.6 : 752 * width / 1260;

const canvas = d3.select(".scroll-inner").append("canvas")
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
let land;

let feature;
let bounds;

const radius = d3.scaleSqrt()
.range([10, 100])
.domain([0, 1000])



const updateMap = (d, cases) => {

    let selected = d3.set(d.area)

    //feature = topojson.merge(countries, countries.objects.countries.geometries.filter(c => selected.has(c.properties.NAME)))

    
    feature = topojson.feature(countries, {
        type: "GeometryCollection",
        geometries: countries.objects.countries.geometries.filter(c => selected.has(c.properties.NAME))
    });


    let uae = topojson.feature(countries, {
        type: "GeometryCollection",
        geometries: countries.objects.countries.geometries.filter(c => c.ISO_A3 === "ARE")
    });

    let point = d3.geoCentroid(feature);

    console.log('geoBounds: ', d3.geoBounds(feature))
    console.log('uae: ', uae, 'uaeCentroid:')

    let currentRotate = projection.rotate();
    let currentScale = projection.scale();

    projection.rotate([-point[0], -point[1]]);
    path.projection(projection);

    bounds = path.bounds(feature);

    console.log(bounds)
    let nextScale = currentScale * (1.5 / Math.max((bounds[1][0] - bounds[0][0]) / (width/2), (bounds[1][1] - bounds[0][1]) / (height/2)));
    let nextRotate = projection.rotate();

    

    d3.transition()
    .duration(500)
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
    .on('start', d => {
        land = topojson.feature(countriesLow, countriesLow.objects.countries);
    })
    .on('end', d => {
        land = topojson.feature(countries, countries.objects.countries);

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

        updateCases(cases)
    })

}

const updateCases = (cases) =>{


    cases.map(c => {


        if(d3.geoContains(feature, [c.lon, c.lat]))
        {
            
            let posX = projection([c.lon, c.lat])[0];
            let posY = projection([c.lon, c.lat])[1];

            context.fillStyle = 'red';
            context.beginPath()
            context.arc(posX, posY, radius(c.cases), 0, Math.PI*2)
            context.fill();
        }
    })

    
}


export { updateMap }


