// inventory main.es6

import React from 'react';
import ReactDOM from 'react-dom';
import drawLineChart from './components/InfoBar/LineChart.js';
import drawBarGraph from './components/InfoBar/BarChart.js';
import Card from './components/card.js';
import PercentVis from './components/PercentVis.js';
import L from 'leaflet';
import axios from 'axios';

require('./css/core.css');
require('./css/barGraph.css');
require('./css/leaflet.css');
require('./css/line_chart.css');

//import {InventoryItem} from './components/InventoryItem';
//
//console.log(Navbar);

var map = document.createElement('div');
map.id = 'map';
map.className = 'map';

var info_div = document.createElement('div');
info_div.id = 'info';
info_div.className = 'info';

var app = document.getElementById("app");

app.appendChild(map);
app.appendChild(info_div);

function getCompetitorsAndStars(biz_id) {
  return axios.get('/user/12345');
}

axios.get(var lineChart =

var barChart = [
  {
    letter: 1,
    frequency: 100
  },
  {
    letter: 2,
    frequency: 300
  },
  {
    letter: 3,
    frequency: 500
  },
  {
    letter: 4,
    frequency: 1000
  },
  {
    letter: 5,
    frequency: 900
  }
];

let cards = (
  <div>
    <Card title="Average Rating Over Time" id="linechart"></Card>
    <Card title="Rating Distrobution" id="bargraph"></Card>
    <div className="cards-container">
      <Card title="Percent of Reviews Above Average" id="percentUp" numOnLine="2"><PercentVis big="true" percent="20.0"></PercentVis></Card>
      <Card title="Rating Distrobution" id="skill" numOnLine="2"></Card>
    </div>
    <div className="cards-container">
      <Card title="Rating Distrobution" id="percentDown" numOnLine="3"></Card>
      <Card title="Rating Distrobution" id="percenBlak" numOnLine="3"></Card>
      <Card title="Rating Distrobution" id="better" numOnLine="3"></Card>
    </div>
  </div>
);


ReactDOM.render(cards, document.getElementById("info"));

setTimeout(function(){
  var leaf_map = L.map('map').setView([51.505, -0.09], 13);

  drawLineChart('linechart', lineChart);

  drawBarGraph('bargraph', barChart);

  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(leaf_map);
}, 100);

console.log(L);
