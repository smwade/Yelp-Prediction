import React from 'react';
import classNames from 'classnames';
import {TRAFFIC_PASTELS} from "../../common/constants.js";

require('./PercentVis.css');

export default class Card extends React.Component {
  render() {
    const {
      percent,
      big
    } = this.props;
    var divStyle = {
      color: TRAFFIC_PASTELS[parseInt(3 - percent/33)]
    };
    var percent_classes = classNames({
      'percent--container' : true,
      'big' : (big == "true"),
    });
    return (
      <div className={percent_classes}>
        <div className='percent--text' style={divStyle}>
          {percent}%
        </div>
      </div>
    );
  }
}
