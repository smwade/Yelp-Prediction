// inventory main.es6

import * as appActions from './components/actions/app';
import React from 'react';
import ReactDOM from 'react-dom';
import drawLineChart from './components/InfoBar/LineChart.js';
import drawBarGraph from './components/InfoBar/BarChart.js';
import Card from './components/card.js';
import PercentVis from './components/PercentVis.js';
import SetimentSearch from './components/SetimentSearch.js';
import RefinedRatings from './components/RefinedRatings.js';
import L from 'leaflet';
import axios from 'axios';
import {COLORS} from "../common/constants.js";
import Header from './components/Header/Header';
import {Provider} from 'react-redux';
import {createStore, combineReducers} from 'redux';
import allReducers from './reducers';
import googleGeocoding from 'google-geocoding';
import {getCompetitorsAndStars, getComperitiveRadius, getRefinedRatings, getPercentAboveAverage, getStarDistrobution} from '../common/api';


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
window.store = store;

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

var leaf_map;
var radius_circle, current_comp_radius, current_biz_circle;
var current_biz;

var current_competitors;
var biz_circles = {};
var starsOverTimeChart;
var barGraph;

function update_map(){
  var event = store.getState();
  var to_lookup = "";
  if (event.viewState.currentBusinessSelection == null){
    if(event.viewState.currentStateSelection !== null){
      to_lookup += event.viewState.currentStateSelection;
    }
    if(event.viewState.currentCitySelection !== null){
      to_lookup += ", ";
      to_lookup += event.viewState.currentCitySelection;
    }
    if (to_lookup != "") {
      googleGeocoding.geocode(to_lookup, function(err, location){
        if( err ) {
          console.log('Error: ' + err);
        } else if (!location){
          console.log('No result.');
        } else {
          if (to_lookup.includes(", ")){
            leaf_map.setView(new L.LatLng(location.lat, location.lng), 12);
          }
          else {
            leaf_map.setView(new L.LatLng(location.lat, location.lng), 7);
          }
        }
      });
    }
  }

  if (event.viewState.compDistance != current_comp_radius){
    current_comp_radius = event.viewState.compDistance;
    radius_circle.setRadius(current_comp_radius*1609.34);
  };

  if (event.viewState.currentBusinesses != current_competitors){
    starsOverTimeChart.animateOff();
    var i = 0; //(Object.keys(current_competitors).filter(function(n) {return Object.keys(event.viewState.currentBusinesses).indexOf(n) !== -1; })).length;
    for(var key in current_competitors){
      if (key != current_biz){
        leaf_map.removeLayer(biz_circles[key]);
        delete biz_circles[key];
      }
    }
    current_competitors = event.viewState.currentBusinesses;
    for (var key in current_competitors){
      var coordinate = [current_competitors[key]['latitude'], current_competitors[key]['longitude']];
      if (key != current_biz){
        biz_circles[key] = L.circleMarker(coordinate, {color: COLORS[i], fill: COLORS[i], fillOpacity: 1});
        biz_circles[key].addTo(leaf_map);
        biz_circles[key]._key = key;
        biz_circles[key].bindPopup('');
        console.log(current_competitors[key]);
        biz_circles[key].bindTooltip(current_competitors[key]['name']);
        i++;
      }
      else {
        current_biz_circle = L.circleMarker(coordinate, {color: COLORS[COLORS.length-1], fill: COLORS[COLORS.length-1], fillOpacity: 1});
        current_biz_circle.addTo(leaf_map);
        current_biz_circle._key = key;
        current_biz_circle.bindPopup('');
        current_biz_circle.bindTooltip(current_competitors[key]['name']);
      }
    }
    starsOverTimeChart.reDrawLines(current_competitors);
  }

  if (event.viewState.currentBusinessSelection!=null && event.viewState.currentBusinessSelection != current_biz){
    current_biz = event.viewState.currentBusinessSelection;

    getComperitiveRadius(event.viewState.currentBusinessSelection).then((comperitiveRadiusInMiles) => {
      current_comp_radius = comperitiveRadiusInMiles.data;
      store.dispatch(appActions.patchCompDistance(current_comp_radius));
    });

    getRefinedRatings(event.viewState.currentBusinessSelection, null).then(function(groups) {
      store.dispatch(appActions.patchRefinedReviews(groups.data));
      store.dispatch(appActions.patchSetiment({positive: null, negative: null}));
    });


    if (!!starsOverTimeChart){
      axios.all([getCompetitorsAndStars(current_biz, store.getState().viewState.monthsToShow), getStarDistrobution(current_biz)])
        .then(axios.spread(function (competitors_star_info, barChart) {
          var averageStars = 0;
          var numReviews = 0;
          for (var i = 0; i < barChart.data.length; i++){
            let datum = barChart.data[i];
            numReviews += datum["frequency"];
            averageStars += datum["frequency"] * datum["letter"];
          }
          averageStars = averageStars/numReviews;
          for(var key in biz_circles){
            leaf_map.removeLayer(biz_circles[key]);
            delete biz_circles[key];
          }
          current_competitors = competitors_star_info.data;

          getPercentAboveAverage(current_biz).then(function(aboveAverage){
            var percentAboveAverage = (aboveAverage.data*100).toFixed(1);
            averageStars = averageStars.toFixed(1);
            ReactDOM.render(<PercentVis big="true" percent={percentAboveAverage} percentSign={true} scale={33}></PercentVis>, document.getElementById("percentUp"));
            ReactDOM.render(<PercentVis big="true" percent={averageStars} scale={5/3}></PercentVis>, document.getElementById("averageRating"));
            ReactDOM.render(
              <Provider store={store}>
                <SetimentSearch />
              </Provider>, document.getElementById("sentimentPoll")
            );
          });


          leaf_map.setView([current_competitors[current_biz]['latitude'], current_competitors[current_biz]['longitude']], 12);
          leaf_map.removeLayer(radius_circle);
          radius_circle = L.circle(new L.LatLng(current_competitors[current_biz]['latitude'], current_competitors[current_biz]['longitude']), {color: "#f2f2f2", radius: current_comp_radius*1609.34, fillOpacity: 0.5}).addTo(leaf_map);
          i = 0;
          for(var key in current_competitors){
            var coordinate = [current_competitors[key]['latitude'], current_competitors[key]['longitude']];
            if (key != current_biz){
              biz_circles[key] = L.circleMarker(coordinate, {color: COLORS[i], fill: COLORS[i], fillOpacity: 1});
              biz_circles[key].addTo(leaf_map);
              biz_circles[key]._key = key;
              biz_circles[key].bindPopup('');
              biz_circles[key].bindTooltip(current_competitors[key]['name']);
              i++;
            }
            else {
              leaf_map.removeLayer(current_biz_circle);
              current_biz_circle = L.circleMarker(coordinate, {color: COLORS[COLORS.length-1], fill: COLORS[COLORS.length-1], fillOpacity: 1});
              current_biz_circle.addTo(leaf_map);
              current_biz_circle._key = key;
              current_biz_circle.bindPopup('');
              current_biz_circle.bindTooltip(current_competitors[key]['name']);
            }
          }

          starsOverTimeChart.animateOff();
          starsOverTimeChart.reDrawLines(competitors_star_info.data);

          barGraph.animateOff();
          barGraph.reDraw(barChart.data);

          store.dispatch(appActions.patchBuisnesses(current_competitors));
        }));
    }
    else{
      bootStrap(event.viewState.currentBusinessSelection);
    }
  }
}

store.subscribe(update_map);
//store.dispatch(appActions.patchBusinessSelection('tstimHoMcYbkSC4eBA1wEg')); //For a default demo


setTimeout(function() {
  leaf_map = L.map('map').setView([39.8282, -98.5795], 4);

  L.tileLayer('http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey={apikey}', {
      maxZoom: 15,
      attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      apikey: "ab82ff1717e8480ba638ab6be9f86955"
  }).addTo(leaf_map);
}, 200);


function bootStrap(biz_id){
  axios.all([getCompetitorsAndStars(biz_id, store.getState().viewState.monthsToShow), getStarDistrobution(biz_id)])
    .then(axios.spread(function (competitors_star_info, barChart) {
      var averageStars = 0;
      var numReviews = 0;
      for (var i = 0; i < barChart.data.length; i++){
        let datum = barChart.data[i];
        numReviews += datum["frequency"];
        averageStars += datum["frequency"] * datum["letter"];
      }
      averageStars = averageStars/numReviews;
      current_competitors = competitors_star_info.data;
      store.dispatch(appActions.patchBuisnesses(current_competitors));

      const sentimentStyle = {
        alignItems: 'flex-start'
      };


      let cards = (
        <div>
          <Card title="Average Rating Over Time" id="linechart"></Card>
          <Card title="Rating Distribution" id="bargraph"></Card>
          <div className="cards-container">
            <Card title="Percent of Reviews Above Average" id="percentUp" numOnLine="2"></Card>
            <Card title="Average Rating" id="averageRating" numOnLine="2"></Card>
          </div>
          <div className="cards-container">
          <Card title="What About This Business Concerns You?" style={sentimentStyle} id="sentimentPoll" numOnLine="1"></Card>
          </div>
          <div className="cards-container">
            <Card title="Refined Ratings" id="refindRating" style={sentimentStyle} numOnLine="1"></Card>
          </div>
        </div>
      );


      getPercentAboveAverage(biz_id).then(function(aboveAverage){
        var percentAboveAverage = (aboveAverage.data*100).toFixed(1);
        averageStars = averageStars.toFixed(1);
        ReactDOM.render(<PercentVis big="true" percent={percentAboveAverage} percentSign={true} scale={33}></PercentVis>, document.getElementById("percentUp"));
        ReactDOM.render(<PercentVis big="true" percent={averageStars} scale={5/3}></PercentVis>, document.getElementById("averageRating"));
        ReactDOM.render(
          <Provider store={store}>
            <SetimentSearch />
          </Provider>, document.getElementById("sentimentPoll")
        );
        ReactDOM.render(
          <Provider store={store}>
            <RefinedRatings />
          </Provider>, document.getElementById("refindRating")
        );
      });


      ReactDOM.render(cards, document.getElementById("info"));

      leaf_map.setView([current_competitors[current_biz]['latitude'], current_competitors[current_biz]['longitude']], 12);

      radius_circle = L.circle(new L.LatLng(current_competitors[current_biz]['latitude'], current_competitors[current_biz]['longitude']), {color: "#f2f2f2", radius: current_comp_radius*1609.34, fillOpacity: 0.5}).addTo(leaf_map);
      i = 0;
      for(var key in current_competitors){
        var coordinate = [current_competitors[key]['latitude'], current_competitors[key]['longitude']];
        if (key != current_biz){
          biz_circles[key] = L.circleMarker(coordinate, {color: COLORS[i], fill: COLORS[i], fillOpacity: 1});
          biz_circles[key].addTo(leaf_map);
          biz_circles[key]._key = key;
          biz_circles[key]._name = current_competitors[key]['name'];
          biz_circles[key].bindPopup('');
          biz_circles[key].bindTooltip(current_competitors[key]['name']);
          i++;
        }
        else {
          current_biz_circle = L.circleMarker(coordinate, {color: COLORS[COLORS.length-1], fill: COLORS[COLORS.length-1], fillOpacity: 1});
          current_biz_circle.addTo(leaf_map);
          current_biz_circle._key = key;
          current_biz_circle.bindPopup('');
          current_biz_circle.bindTooltip(current_competitors[key]['name']);
        }
      }

      starsOverTimeChart = drawLineChart('linechart', current_competitors);

      barGraph = drawBarGraph('bargraph', barChart.data);

      leaf_map.on('popupopen', function (e) {
        var key = e.popup._source._key;
        starsOverTimeChart.fadeAllButOne(key);
      });

      leaf_map.on('popupclose', function (e) {
        starsOverTimeChart.unfadeAll(key);
      });

    }));
};
