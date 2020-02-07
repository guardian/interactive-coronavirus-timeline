import loadJson from '../components/load-json'
import * as topojson from 'topojson'
import * as geo from 'd3-geo-projection'
import * as d3B from 'd3'
import { $ } from './util'
import countries from '../assets/countries.json'

const d3 = Object.assign({}, d3B, geo);

const atomEl = $('.interactive-wrapper');

let width = atomEl.getBoundingClientRect().width;
let height = width;

let svg = d3.select('.interactive-wrapper').append('svg')
.attr('width', width)
.attr('height', height);

let projection = d3.geoOrthographic()
.rotate([-102,-20]);

let data =[];

let path = d3.geoPath()
.projection(projection);

projection.fitExtent([[0,0], [width,height]], topojson.feature(countries, countries.objects.countries));



const drawMap = () =>{

	const map = svg.selectAll('path')
				.data(topojson.feature(countries, countries.objects.countries).features)

	
	map
	.enter()
	.append('path')
	.merge(map)
	.attr('d', path)
}





const drawCircles = () => {

	const markers = svg.selectAll('circle')
                    .data(data);

	markers
	.enter()
	.append('circle')
	.merge(markers)
	.attr('cx', d => projection([d[1], d[0]])[0])
	.attr('cy', d => projection([d[1], d[0]])[1])
	.attr('fill', 'red')
	.attr('r', 3)
}


loadJson('https://interactive.guim.co.uk/docsdata-test/1C7AlDFnxKzy1Tw8Rk9mP2wHNlUSEN22tfAXhN6arCNc.json')
.then(fileRaw => {

	

	fileRaw.sheets.cases.map(place => {
		data.push([place.Lat,place.Long])
	})

	drawMap();

	drawCircles(data)

	let timer = d3.timer( (i) => {
                    projection.rotate([0.005 * i - 120, -30, 0]);
                    svg.selectAll("path").attr("d", path);

                    if(i > 5000)
                    {

                    	timer.stop()

                    	svg.selectAll("path").interrupt().transition()
      					.duration(1000).ease(d3.easeLinear)
      					.attrTween("d", projectionTween(projection, projection = d3.geoEquirectangular()))

                    	
                    }

                    drawCircles();
                    drawMap()


                    


                    console.log(i)
                });
})

function projectionTween(projection0, projection1) {
  return function(d) {
    var t = 0;
    var projection = d3.geoProjection(project)
        .scale(1)
        .translate([width / 2, height / 2]);
    var path = d3.geoPath(projection);
    function project(λ, φ) {
      λ *= 180 / Math.PI, φ *= 180 / Math.PI;
      var p0 = projection0([λ, φ]), p1 = projection1([λ, φ]);
      return [(1 - t) * p0[0] + t * p1[0], (1 - t) * -p0[1] + t * -p1[1]];
    }
    return function(_) {
      t = _;
      return path(d);
    };
  };
}

