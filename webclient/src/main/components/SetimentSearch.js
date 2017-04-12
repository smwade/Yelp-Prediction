import React from 'react';
import classNames from 'classnames';
import {TRAFFIC_PASTELS} from "../../common/constants.js";
import {getSetimentReport} from "../../common/api.js";
import SearchInput, {createFilter} from 'react-search-input';
import * as appActions from './actions/app';
import axios from 'axios';
import {connect} from 'react-redux';
import {sprintf} from 'sprintf-js';
import Loading from 'react-loading';



require('./SetimentSearch.css');

var value;

class Setiment extends React.Component{
  constructor(props) {
    super(props);
    this.state = {loading: false};
    this.updateReviews = this.updateReviews.bind(this);
  }
  updateReviews() {
    const {viewState, dispatch} = this.props;
    var that = this;
    this.setState({loading: true});
    this.render();
    getSetimentReport(viewState.currentBusinessSelection, value).then(function(setiment){
      that.setState({loading: false});
      dispatch(appActions.patchSetiment(setiment.data));
    }).catch(function(e){
      that.setState({loading: false});
      dispatch(appActions.patchSetiment({positive : "<b style='align: center;'>No Results.</b>", negative : "<b style='align: center;'>No Results.</b>"}));
    });
  }
  onChange(val){
    value = val;
  }
  render() {
    const {viewState} = this.props;
    const negStyle = {
      color: TRAFFIC_PASTELS[2]
    };
    const posStyle = {
      color: TRAFFIC_PASTELS[0]
    };
    return (
      <div className='setiment--outer'>
        <SearchInput
          className = 'setiment--searchBar'
          onChange = {this.onChange}
          onBlur = {this.updateReviews}
        />
        <div className="setiment--report">
          <div className="setiment--positive">
            <div className="setiment--title" style={posStyle}>
              Most Positive Review
            </div>
            {this.state.loading && <div className="setiment--loading"> <Loading type='spinningBubbles' color='#9a9a9a' /> </div>}
            {!this.state.loading && <div className="setiment" dangerouslySetInnerHTML={{__html : viewState.mostPositiveReview}}></div>}
          </div>
          <div className="setiment--negative">
            <div className="setiment--title" style={negStyle}>
              Most Negative Review
            </div>
            {this.state.loading && <div className="setiment--loading"> <Loading className="setiment--" type='spinningBubbles' color='#9a9a9a' /> </div>}
            {!this.state.loading && <div className="setiment" dangerouslySetInnerHTML={{__html : viewState.mostNegativeReview}}></div>}
          </div>
        </div>
      </div>
    );
  }
}

function select(state) {
  return {
    viewState: state.viewState
  };
}


export default connect(select)(Setiment);
