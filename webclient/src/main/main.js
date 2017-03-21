// inventory main.es6

import React from 'react';
import ReactDOM from 'react-dom';
import drawLineChart from './components/InfoBar/LineChart.js';
import drawBarGraph from './components/InfoBar/BarChart.js';
import Card from './components/card.js';
import PercentVis from './components/PercentVis.js';
import L from 'leaflet';
import axios from 'axios';
import {sprintf} from 'sprintf-js';
import {COLORS} from "../common/constants.js";

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
  return axios.get(sprintf('/api/business/%s/competitor-stars/', biz_id));
}

function getComperitiveRadius(biz_id) {
  return axios.get(sprintf('/api/business/%s/get-competitive-radius/', biz_id));
}

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

var current_biz = 'LTlCaCGZE14GuaUXUGbamg';

axios.all([getCompetitorsAndStars(current_biz), getComperitiveRadius(current_biz)])
  .then(axios.spread(function (competitors_star_info, comperitiveRadiusInMiles) {
    var lineChart = [];
    var latitude_longitude_pairs = [];
    var getComperitiveInMeters = 1609.34 * comperitiveRadiusInMiles.data;
    for (var key in competitors_star_info.data){
      console.log(key);
      console.log(competitors_star_info.data[key]);
      lineChart.push(competitors_star_info.data[key]["stars"]);
      latitude_longitude_pairs.push([competitors_star_info.data[key]["latitude"], competitors_star_info.data[key]["longitude"]]);
    }
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

    console.log(lineChart);

    setTimeout(function(){

      var leaf_map = L.map('map').setView([competitors_star_info.data[current_biz]['latitude'], competitors_star_info.data[current_biz]['longitude']], 12);

      L.circle([competitors_star_info.data[current_biz]['latitude'], competitors_star_info.data[current_biz]['longitude']], {color: "#f2f2f2", radius: getComperitiveInMeters, fillOpacity: 0.5}).addTo(leaf_map);
      for(var i = 0; i < latitude_longitude_pairs.length; i++){
        L.circleMarker(latitude_longitude_pairs[i], {color: COLORS[i], fill: COLORS[i], fillOpacity: 1}).addTo(leaf_map);
      }

      drawLineChart('linechart', lineChart);

      drawBarGraph('bargraph', barChart);

      L.tileLayer('http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey={apikey}', {
          maxZoom: 15,
          attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          apikey: "ab82ff1717e8480ba638ab6be9f86955"
      }).addTo(leaf_map);
    }, 100);

    console.log(L);
  }));

