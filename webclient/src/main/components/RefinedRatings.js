import React from 'react';
import classNames from 'classnames';
import {TRAFFIC_PASTELS} from "../../common/constants.js";
import {getRefinedRatings} from "../../common/api.js";
import { default as OverflowEllipsis } from 'react-overflow-ellipsis';
import SearchInput, {createFilter} from 'react-search-input';
import * as appActions from './actions/app';
import axios from 'axios';
import {connect} from 'react-redux';
import {sprintf} from 'sprintf-js';
import Loading from 'react-loading';
import ReactStars from 'react-stars';



require('./RefinedRatings.css');

var value;

class RefinedRatings extends React.Component{
  constructor(props) {
    super(props);
    this.state = {loading: false, };
    this.updateChosen = this.updateChosen.bind(this);
  }
  componentWillMount(){
    const {viewState, dispatch} = this.props;
    getRefinedRatings(viewState.currentBusinessSelection, null).then(function(groups) {
      dispatch(appActions.patchRefinedReviews(groups.data));
    });
  }
  updateChosen() {
    const {viewState, dispatch} = this.props;
    var that = this;
    this.setState({loading: true});
    this.render();
    getSetimentReport(viewState.currentBusinessSelection, value).then(function(setiment){
      that.setState({loading: false});
      dispatch(appActions.patchSetiment(setiment.data));
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
      <div className='refined-ratings--outer'>
        <div className='refined-ratings--report'>
          <div className='refined-ratings--categories'>
            <div className='refined-ratings--title'>
              Words Used
            </div>
            <div className='refined-ratings--content'>
              {viewState.wordsUsedInRefinedReviews.map((group, indexX) =>{
                return(
                  <div className="refined-ratings--line" key={indexX}>
                    <OverflowEllipsis>
                      {group}
                    </OverflowEllipsis>
                  </div>
                );
              })}
            </div>
          </div>
          <div className='refined-ratings--ratings'>
            <div className='refined-ratings--title'>
              Average Rating
            </div>
            <div className='refined-ratings--content'>
              {viewState.ratingsForGroups.map((rating, indexX) =>{
                console.log(Math.round(rating*2)/2);
                return(
                  <div className="refined-ratings--stars" key={indexX}>
                    <ReactStars
                      count={5}
                      size={24}
                      edit={false}
                      value={Math.round(rating*2)/2}
                      color2={'#ffd700'}
                      color1={'#808080'} />
                  </div>
                );
              })}
            </div>
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


export default connect(select)(RefinedRatings);
