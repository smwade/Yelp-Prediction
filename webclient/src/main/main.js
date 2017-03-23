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
import Header from './components/Header/Header';
import {Provider} from 'react-redux';
import {createStore, combineReducers} from 'redux';
import allReducers from './reducers';

require('./css/core.css');
require('./css/barGraph.css');
require('./css/leaflet.css');
require('./css/line_chart.css');
require('./css/react-select.css');

//import {InventoryItem} from './components/InventoryItem';
//
//console.log(Navbar);
//
const store = createStore(combineReducers(allReducers));

ReactDOM.render(
  <Provider store={store}>
    <Header />
  </Provider>, document.getElementById('header')
);

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

function getPercentAboveAverage(biz_id) {
  return axios.get(sprintf('/api/business/%s/percent-above-average/', biz_id));
}

function getStarDistrobution(biz_id) {
  return axios.get(sprintf('/api/business/%s/star-distrobution/', biz_id));
}

var current_biz = 'LTlCaCGZE14GuaUXUGbamg';

axios.all([getCompetitorsAndStars(current_biz), getComperitiveRadius(current_biz), getStarDistrobution(current_biz)])
  .then(axios.spread(function (competitors_star_info, comperitiveRadiusInMiles, barChart) {
    var lineChart = [];
    var latitude_longitude_pairs = [];
    var getComperitiveInMeters = 1609.34 * comperitiveRadiusInMiles.data;
    var averageStars = 0;
    var numReviews = 0;
    for (var i = 0; i < barChart.data.length; i++){
      let datum = barChart.data[i];
      numReviews += datum["frequency"];
      averageStars += datum["frequency"] * datum["letter"];
    }
    averageStars = averageStars/numReviews;
    for (var key in competitors_star_info.data){
      console.log(key);
      console.log(competitors_star_info.data[key]);
      lineChart.push(competitors_star_info.data[key]["stars"]);
      latitude_longitude_pairs.push([competitors_star_info.data[key]["latitude"], competitors_star_info.data[key]["longitude"]]);
    }

    var percentAboveAverage;
    let cards = (
      <div>
        <Card title="Average Rating Over Time" id="linechart"></Card>
        <Card title="Rating Distrobution" id="bargraph"></Card>
        <div className="cards-container">
          <Card title="Percent of Reviews Above Average" id="percentUp" numOnLine="2"></Card>
          <Card title="Average Rating" id="averageRating" numOnLine="2"></Card>
        </div>
        <div className="cards-container">
          <Card title="Rating Distrobution" id="percentDown" numOnLine="3"></Card>
          <Card title="Rating Distrobution" id="percenBlak" numOnLine="3"></Card>
          <Card title="Rating Distrobution" id="better" numOnLine="3"></Card>
        </div>
      </div>
    );


    getPercentAboveAverage(current_biz).then(function(aboveAverage){
      percentAboveAverage = (aboveAverage.data*100).toFixed(1);
      averageStars = averageStars.toFixed(1);
      ReactDOM.render(<PercentVis big="true" percent={percentAboveAverage} percentSign={true} scale={33}></PercentVis>, document.getElementById("percentUp"));
      ReactDOM.render(<PercentVis big="true" percent={averageStars} scale={5/3}></PercentVis>, document.getElementById("averageRating"));
      console.log(percentAboveAverage);
    });


    ReactDOM.render(cards, document.getElementById("info"));

    console.log(lineChart);

    setTimeout(function(){

      var leaf_map = L.map('map').setView([competitors_star_info.data[current_biz]['latitude'], competitors_star_info.data[current_biz]['longitude']], 12);

      L.circle([competitors_star_info.data[current_biz]['latitude'], competitors_star_info.data[current_biz]['longitude']], {color: "#f2f2f2", radius: getComperitiveInMeters, fillOpacity: 0.5}).addTo(leaf_map);
      for(var i = 0; i < latitude_longitude_pairs.length; i++){
        L.circleMarker(latitude_longitude_pairs[i], {color: COLORS[i], fill: COLORS[i], fillOpacity: 1}).addTo(leaf_map);
      }

      drawLineChart('linechart', lineChart);

      drawBarGraph('bargraph', barChart.data);

      L.tileLayer('http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey={apikey}', {
          maxZoom: 15,
          attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          apikey: "ab82ff1717e8480ba638ab6be9f86955"
      }).addTo(leaf_map);
    }, 100);

    console.log(L);
  }));

