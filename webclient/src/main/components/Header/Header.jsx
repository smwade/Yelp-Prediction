import React from 'react';
import * as appActions from '../actions/app';
import Select from 'react-select';
import axios from 'axios';
import {connect} from 'react-redux';
import {sprintf} from 'sprintf-js';
import Slider, { Handle } from 'rc-slider';
import Tooltip from 'rc-tooltip';
import {getCompetitorsByRadius} from '../../../common/api';

require('../../css/rc-slider/index.css');
require('../../css/rc-tooltip/bootstrap.css');

var all_states;


function getAllCitiesForState(state) {
  return axios.get(sprintf('/api/all-cities/%s/', state));
}

class Header extends React.Component{
  constructor(props) {
    super(props);
    this.updateState = this.updateState.bind(this);
    this.updateCity = this.updateCity.bind(this);
    this.updateCompetitiveRadius = this.updateCompetitiveRadius.bind(this);
    this.updateSelectedBusinesses = this.updateSelectedBusinesses.bind(this);
    this.updateBusiness = this.updateBusiness.bind(this);
    this.state = {businessOptions: null };
  }

  updateCompetitiveRadius (newValue) {
    const {dispatch} = this.props;
    console.log(newValue);
    dispatch(appActions.patchCompDistance(newValue));
  }

  updateState (newValue) {
    const {dispatch} = this.props;
    if (newValue === null){
      dispatch(appActions.patchCurrentStateSelection(null));
    }
    else{
      dispatch(appActions.patchBusinessSelection(null));
      dispatch(appActions.patchCurrentCitySelection(null));
      dispatch(appActions.patchCurrentStateSelection(newValue.value));
    }
    axios.get(sprintf('/api/all-cities/%s/', newValue.value)).then(cities => {
      dispatch(appActions.patchCurrentCityOptions(cities.data));
    });
  }

  updateCity (newValue) {
    const {dispatch} = this.props;
    var that = this;
    if (newValue === null){
      dispatch(appActions.patchCurrentCitySelection(null));
    }
    else{
      dispatch(appActions.patchBusinessSelection(null));
      dispatch(appActions.patchCurrentCitySelection(newValue.value));
    }
    axios.get(sprintf('/api/all-businesses/?city=%s', newValue.value)).then(business => {
      console.log(business);
      that.setState({businessOptions : business.data});
    });
  }

  updateBusiness(newValue) {
    const {dispatch} = this.props;
    if (newValue === null){
      dispatch(appActions.patchBusinessSelection(null));
    }
    else{
      dispatch(appActions.patchBusinessSelection(newValue.value));
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

  updateSelectedBusinesses(newValue) {
    const {dispatch, viewState} = this.props;
    getCompetitorsByRadius(viewState.currentBusinessSelection, viewState.compDistance, viewState.monthsToShow).then( competitors => {
      console.log(competitors);
      dispatch(appActions.patchBuisnesses(competitors.data));
    });
  }

  render () {
    const handle = (props) => {
      const { value, dragging, index, ...restProps} = props;
      return (
        <Tooltip
        prefixCls="rc-slider-tooltip"
        overlay={value}
        visible={dragging}
        placement="top"
        key={index}
        >
          <Handle {...restProps} />
        </Tooltip>
      );
    };

    const {viewState} = this.props;
    return (
      <div className="outer-header">
        <div className="header-city-selector-container">
          <div className="selector">
            <h3 className="section-heading"> States: </h3>
            <Select.Async loadOptions={this.getAllStates} name="selected-state" value={viewState.currentStateSelection} onChange={this.updateState} searchable />
          </div>
          <div className="selector">
            <h3 className="section-heading"> Cities: </h3>
            <Select options={viewState.allCurrentCityOptions} clearable={false} name="selected-city" disabled={(viewState.currentStateSelection === null)} value={viewState.currentCitySelection} onChange={this.updateCity} />
          </div>
        </div>
        <div className="slider-container">
          <div className="selector">
            <h3 className="section-heading"> Competitive Radius: </h3>
            <Slider min={0} max={10} step={.1} value={viewState.compDistance} handle={handle} onChange={this.updateCompetitiveRadius} onAfterChange={this.updateSelectedBusinesses}/>
          </div>
          <div className="selector">
            <h3 className="section-heading"> Business: </h3>
            <Select options={this.state.businessOptions} clearable={false} name="selected-buinesses" disabled={(viewState.currentCitySelection === null)} value={viewState.currentBusinessSelection} onChange={this.updateBusiness} />
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
