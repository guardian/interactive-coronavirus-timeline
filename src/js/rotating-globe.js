import loadJson from '../components/load-json'
import * as topojson from 'topojson'
import * as geo from 'd3-geo-projection'
import * as d3B from 'd3'
import { $ } from './util'
import countries from '../assets/countries.json'

export default (data) => {

    const d3 = Object.assign({}, d3B, geo);

    const atomEl = $('.interactive-wrapper');

    let isMobile = window.matchMedia('(max-width: 620px)').matches;

    let width = isMobile ? 300 : 400;
    let height = width;

    const canvas = d3.select(".interactive-wrapper").append("canvas")
    .attr("width", width)
    .attr("height", height);

    const context = canvas.node().getContext("2d");

    const center = [width/2, height/2];

    const projection = d3.geoOrthographic()
    .rotate([-102,-20])
    .translate(center);

    projection.fitExtent([[10,10], [width-10,height-10]], topojson.feature(countries, countries.objects.countries));

    //let data =[];

    let path = d3.geoPath()
    .projection(projection)
    .context(context);

    let sphere = { type: "Sphere" };
    let land = topojson.feature(countries, countries.objects.countries);

    const drawMap = () =>{

        context.clearRect(0, 0, width, height);

        context.fillStyle = "#fffff3";
        context.beginPath();
        path(sphere);
        context.fill();

        context.fillStyle = "#f6f6f6";
        context.beginPath();
        path(land);
        context.fill();

        context.strokeStyle = "#cccccc";
        context.lineWidth = 0.5;
        context.stroke();

        data.map(d => {

            let posX = projection([d[1], d[0]])[0];
            let posY = projection([d[1], d[0]])[1];

            let coordinate = [+d[1], +d[0]];

            let gdistance = d3.geoDistance(coordinate, projection.invert(center));

            context.fillStyle = 'red';

            if( gdistance < 1.57)
            {
                context.beginPath()
                context.arc(posX, posY, 3, 0, Math.PI*2)
                context.fill();
            }
        })
    }




        let timer = d3.timer( (i) => {

            projection.rotate([0.01 * i - 120, -30, 0]);

            drawMap()

        });

}



