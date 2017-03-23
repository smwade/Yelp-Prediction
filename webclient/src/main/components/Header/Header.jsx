import React from 'react';
import * as appActions from '../actions/app';
import Select from 'react-select';
import axios from 'axios';
import {connect} from 'react-redux';
import {sprintf} from 'sprintf-js';

var all_states;
var all_cities;


function getAllCitiesForState(state) {
  return axios.get(sprintf('/api/all-cities/%s/', state));
}

class Header extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      disabled: false,
      selectedState: null,
    };
    this.getAllCities = this.getAllCities.bind(this);
    this.updateState = this.updateState.bind(this);
    this.updateCity = this.updateCity.bind(this);
  }

  updateState (newValue) {
    const {dispatch} = this.props;
    if (newValue === null){
      dispatch(appActions.patchCurrentStateSelection(null));
    }
    else{
      dispatch(appActions.patchCurrentStateSelection(newValue.value));
    }
  }

  updateCity (newValue) {
    const {dispatch} = this.props;
    if (newValue === null){
      dispatch(appActions.patchCurrentCitySelection(null));
    }
    else{
      dispatch(appActions.patchCurrentCitySelection(newValue.value));
    }
  }

  focusStateSelect () {
    this.refs.stateSelect.focus();
  }

  getAllStates(input, callback) {
    all_states = axios.get('/api/states/').then(states => {
      callback(null, {
        options: states.data,
        complete: true
      });
    });
  };

  getAllStates(input, callback) {
    all_states = axios.get('/api/states/').then(states => {
      callback(null, {
        options: states.data,
        complete: true
      });
    });
  };

  getAllCities(input, callback){
    if (this.state.selectedState === null){
      return Promise.resolve();
    }
    all_cities = axios.get(sprintf('/api/all-cities/%s/', this.state.selectedState)).then(cities => {
      callback(null, {
        options: cities.data,
        complete: true
      });
    });
  };

  render () {
    const {viewState} = this.props;
    return (
      <div>
      <div className="header-city-selector-container">
        <div className="selector">
          <h3 className="section-heading"> States: </h3>
          <Select.Async loadOptions={this.getAllStates} name="selected-state" value={viewState.currentStateSelection} onChange={this.updateState} searchable />
        </div>
        <div className="selector">
          <h3 className="section-heading"> Cities: </h3>
          <Select.Async loadOptions={this.getAllCities} clearable={false} name="selected-city" disabled={(viewState.currentStateSelection === null)} value={this.state.selectedCity} onChange={this.updateCity} />
        </div>
      </div>
      </div>
    );
  }
};

function select(state) {
  return {
    viewState: state.viewState
  };
}


export default connect(select)(Header);
