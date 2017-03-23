import React from 'react';
import classNames from 'classnames';
import {TRAFFIC_PASTELS} from "../../common/constants.js";

require('./PercentVis.css');

export default class Card extends React.Component {
  render() {
    const {
      percent,
      percentSign,
      big,
      scale
    } = this.props;
    var divStyle = {
      color: (percent > 0) ? TRAFFIC_PASTELS[Math.round(3 - (percent)/scale)] : TRAFFIC_PASTELS[2]
    };
    var percent_classes = classNames({
      'percent--container' : true,
      'big' : (big == "true"),
    });
    return (
      <div className={percent_classes}>
        <div className='percent--text' style={divStyle}>
          {percent} {(percentSign) ? '%' : ''}
        </div>
      </div>
    );
  }
}
