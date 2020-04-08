import * as topojson from "topojson";
import * as geo from "d3-geo-projection";
import * as d3B from "d3";
import { $ } from "./util";
// import countries from '../assets/countries.json'
import countriesLow from '../assets/ne_10m_admin_0_countries.json'

import pointsWithFeature from '../assets/data'

// const countriesFC = topojson.feature(countries, countries.objects.countries);
const countriesLowFC = topojson.feature(countriesLow, countriesLow.objects.ne_10m_admin_0_countries);

const stored = pointsWithFeature.map( o => {

  return {
    type : 'FeatureCollection',
    
    features : topojson.feature(countriesLow, countriesLow.objects.ne_10m_admin_0_countries)
      .features
      .filter(c => o.cases.some(coun => c.properties.ISO_A3 === coun.iso)) }
})

// const countriesFC = topojson.feature(countries, countries.objects.countries);

const d3 = Object.assign({}, d3B, geo);

const atomEl = $(".scroll-inner");

let isMobile = window.matchMedia("(max-width: 640px)").matches;
let isTablet = window.matchMedia("(max-width: 979px)").matches;

let width =
  isTablet && isMobile === false
    ? window.innerWidth - 50
    : isMobile
    ? window.innerWidth
    : window.innerHeight - 200;

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
    [20, 20],
    [width - 20, height - 20],
  ],
  countriesLowFC
);

let path = d3.geoPath().projection(projection).context(context);

let path2 = d3.geoPath().projection(projection2);

let colorLand = "#eaeaea";
let colorLandSelected = "#fff1f4";
let graticuleColor = "#333333";
let lineLand = "#e4e4e4";
let colorGlobe = "#ffffff";
let textColors = "#333";
let blobColor = "#c70000";

let sphere = { type: "Sphere" };

let graticule = d3.geoGraticule();


let point;

const radius = d3.scaleSqrt().range([0, 30]).domain([0, 400000]);

let r1 = d3.geoCircle().center([0,0]).radius(radius(10000));
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
.text('1,000')

let lastRotate;

const updateMap = (d, i) => {

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
                updateCases(d, stored[i])
            }
        })            
        
}


const updateCases = (d, storedEntry) =>{

    context.clearRect(0, 0, width, height);

    context.fillStyle = colorGlobe;
    context.globalAlpha =1;

    context.beginPath();
    path(sphere);
    context.fill();
    context.closePath();

    context.beginPath();
    context.strokeStyle = graticuleColor;
    context.lineWidth = 0.1;
    path(graticule());
    context.stroke();
    context.closePath();

    context.fillStyle = colorLand;
    context.beginPath();
    path(countriesLowFC);
    context.fill();
    context.closePath();

    context.strokeStyle = lineLand;
    context.lineWidth = 0.5;
    context.stroke();

    context.fillStyle = colorLandSelected;
    context.strokeStyle = lineLand;
    context.beginPath();
    path(storedEntry);
    context.fill();
    context.stroke();
    context.closePath();

       
    

    d.cases.forEach(c => {
            let posX = projection([c.lon, c.lat])[0];
            let posY = projection([c.lon, c.lat])[1];

            let circle = d3.geoCircle().center([c.lon, c.lat]).radius(radius(c.cases))
            context.beginPath();
            context.fillStyle = blobColor;
            context.globalAlpha = 0.1;
            path(circle());
            context.fill();
            context.closePath();

            context.beginPath();
            context.strokeStyle = blobColor;
            context.globalAlpha = 1;
            context.lineWidth = 1 ;
            path(circle())
            context.stroke();
            context.closePath();
    })

}


export { updateMap }

