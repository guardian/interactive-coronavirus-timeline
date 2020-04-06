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

let isMobile = window.matchMedia('(max-width: 740px)').matches;

let width = isMobile ? window.innerWidth : window.innerHeight - 100;
let height = width;

const canvas = d3.select("canvas")
.attr("width", width)
.attr("height", height);

let context = canvas.node().getContext("2d");

let projection = d3.geoOrthographic()
.translate([width / 2, height / 2])
.clipAngle(90);

projection.fitExtent([[0, 0], [width, height - 50]], countriesLowFC);

let path = d3.geoPath()
.projection(projection)
.context(context);

let colorLand = "#f6f6f6";
let colorLandSelected = "#bababa";
let lineLand = "#cccccc";
let colorGlobe = "#fffff3";
let textColors = "#333";

let sphere = { type: "Sphere" };

let graticule = d3.geoGraticule();

// let feature;
// let bounds;

let point

const radius = d3.scaleSqrt()
.range([0, 30])
.domain([0, 200000]);

const updateMap = (d, cases) => {

    if (d.fLengthPos)
    {
        point = d.point

        let currentRotate = projection.rotate();
        let currentScale = projection.scale();

        projection.rotate([- point[0], - point[1]]);
        path.projection(projection);

        let nextRotate = projection.rotate();

        d3.transition()
        .duration(500)
        .tween('tween', () => {

            let r = d3.interpolate(currentRotate, nextRotate);

            return (t) => {

                projection
                .rotate(r(t))

                path.projection(projection);

                updateCases(cases, d.cases)
            }
        })

    }
    else
    {
        updateCases(cases, d.cases)
    }

    
}


const updateCases = (cases, countries) =>{

    context.clearRect(0, 0, width, height);

    context.fillStyle = colorGlobe;
    context.globalAlpha =1;
    context.beginPath();
    path(sphere);
    context.fill();

    context.beginPath();
    context.strokeStyle = '#ccc';
    path(graticule());
    context.stroke();

    context.fillStyle = colorLand;
    context.beginPath();
    path(countriesLowFC);
    context.fill();

    context.strokeStyle = lineLand;
    context.lineWidth = 0.5;
    context.stroke();

    countries.map(coun => {

        const feature = topojson.feature(countriesLow, {
            type: "GeometryCollection",
            geometries: countriesLow.objects.countries.geometries.filter(c => c.properties.ISO_A3 === coun.iso)
        })


        context.fillStyle = colorLandSelected;
        context.beginPath();
        path(feature);
        context.fill();
    })

    cases.forEach(c => {
            let posX = projection([c.lon, c.lat])[0];
            let posY = projection([c.lon, c.lat])[1];

            /*context.fillStyle = 'red';
            context.globalAlpha =0.3;
            context.beginPath()
            context.arc(posX, posY, radius(c.cases), 0, Math.PI*2)
            context.fill();*/

            //console.log(c.cases, radius(c.cases))

            let circle = d3.geoCircle().center([c.lon, c.lat]).radius(radius(c.cases))
            context.beginPath();
            context.strokeStyle = 'red';
            path(circle());
            context.stroke();
    })
}


export { updateMap }


