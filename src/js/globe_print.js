import * as topojson from "topojson";
import * as geo from "d3-geo-projection";
import * as d3B from "d3";
import { $ } from "./util";
// import countries from '../assets/countries.json'
import countriesLow from '../assets/ne_10m_admin_0_countries.json'

// const countriesFC = topojson.feature(countries, countries.objects.countries);
const countriesLowFC = topojson.feature(countriesLow, countriesLow.objects.ne_10m_admin_0_countries);

// const countriesFC = topojson.feature(countries, countries.objects.countries);

const d3 = Object.assign({}, d3B, geo);

const atomEl = $(".scroll-inner");

let isMobile = window.matchMedia("(max-width: 640px)").matches;
let isTablet = window.matchMedia("(max-width: 979px)").matches;


let width = 3600;

let height = width;

const svg = d3.select('.key')
.append('svg')
.attr('width', 50)
.attr('height', 50)

let circle = d3.geoCircle();

const canvas = d3.select("canvas").attr("width", width).attr("height", height);

let context = canvas.node().getContext("2d");

let projection = d3
  .geoOrthographic()
  .translate([width / 2, height / 2])
  .clipAngle(90);

let projection2 = d3
  .geoOrthographic()
  .translate([50 / 2, 50 / 2])
  .clipAngle(90);

projection.fitExtent(
  [
    [0, 0],
    [width, height],
  ],
  countriesLowFC
);

let path = d3.geoPath().projection(projection).context(context);

let path2 = d3.geoPath().projection(projection2);

let colorLand = "#ffffff";
let colorLandSelected = "#fab0cf";
let graticuleColor = "#9cb4be";
let lineLand = "#9cb4be";
let colorGlobe = "#e2e7ea";
let textColors = "#333";
let blobColor = "#e1058c";

let sphere = { type: "Sphere" };

let graticule = d3.geoGraticule();


let point;

const radius = d3.scaleSqrt().range([0, 30]).domain([0, 400000]);

/*let r1 = d3.geoCircle().center([0,0]).radius(radius(10000));
let r2 = d3.geoCircle().center([0,0]).radius(radius(1000));

svg.append('path')
.attr('d', path2(r1()))
.attr('fill',blobColor)
.attr('fill-opacity',0.2)
.style('stroke', blobColor)
.style('stroke-width', 1)
.style('stroke-opacity',1)

let line1 = svg
.append('path')
.attr('class', 'legend-line')
.attr('d', "M25 45 H25 50 Z" )
.attr('stroke', 'black')

let txt1 = svg
.append('text')
.attr('class', 'legend-text')
.attr('x', 55 )
.attr('y', 50)
.text('10,000')

svg.append('path')
.attr('d', path2(r2()))
.attr('fill',blobColor)
.attr('fill-opacity',0.2)
.style('stroke', blobColor)
.style('stroke-width', 1)
.style('stroke-opacity',1)

let line2 = svg
.append('path')
.attr('class', 'legend-line')
.attr('d', "M25 25 H25 50 Z" )
.attr('stroke', 'black')

let txt2 = svg
.append('text')
.attr('class', 'legend-text')
.attr('x', 55 )
.attr('y', 30)
.text('1,000')*/

const updateMap = (d, cases) => {

    console.log(d)

        if (d.fLengthPos)
            {
                point = d.point
            }

        let currentRotate = projection.rotate();

        projection.rotate([- point[0], - point[1]]);
        path.projection(projection);

        let nextRotate = projection.rotate();

        d3.transition()
        .duration(500)
        .tween('tween', () => { 


            let r = d3.interpolate(currentRotate, nextRotate);

            return(t) => {
                projection.rotate(r(t))
                path.projection(projection);
                updateCases(cases, d.cases)
            }
        })            
        
}


const updateCases = (cases, countries) =>{

    context.clearRect(0, 0, width, height);

    context.fillStyle = colorGlobe;
    context.globalAlpha =1;

    context.beginPath();
    path(sphere);
    context.fill();
    context.closePath();

    context.beginPath();
    context.strokeStyle = graticuleColor;
    context.lineWidth = 4;
    path(graticule());
    context.stroke();
    context.closePath();

    context.fillStyle = colorLand;
    context.beginPath();
    path(countriesLowFC);
    context.fill();
    context.closePath();

    context.strokeStyle = lineLand;
    context.lineWidth = 4;
    context.stroke();


        countries.map(coun => {
        const feature = topojson.feature(countriesLow, {
            type: "GeometryCollection",
            geometries: countriesLow.objects.ne_10m_admin_0_countries.geometries.filter(c => c.properties.ISO_A3 === coun.iso)
        })


        context.fillStyle = colorLandSelected;
        context.beginPath();
        path(feature);
        context.fill();
        context.closePath();

        context.strokeStyle = lineLand;
        context.beginPath();
        path(feature);
        context.stroke();
        context.closePath();
    })

    cases.forEach(c => {
            let posX = projection([c.lon, c.lat])[0];
            let posY = projection([c.lon, c.lat])[1];

            let circleFill = d3.geoCircle().center([c.lon, c.lat]).radius(radius(c.cases))
            context.beginPath();
            context.fillStyle = blobColor;
            context.globalAlpha = 0.3;
            path(circleFill());
            context.fill();
            context.closePath();

            let circleStroke = d3.geoCircle().center([c.lon, c.lat]).radius(radius(c.cases))
            context.beginPath();
            context.strokeStyle = blobColor;
            context.globalAlpha = 1;
            context.lineWidth = 2 ;
            path(circleStroke());
            context.stroke();
            context.closePath();
    })

}


export { updateMap }

