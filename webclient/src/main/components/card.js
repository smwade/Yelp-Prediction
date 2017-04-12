import React from 'react';
import classNames from 'classnames';

require('./card.css');

export default class Card extends React.Component {
  render() {
    const {
      title,
      id,
      numOnLine,
      style
    } = this.props;
    var numString;
    if (numOnLine){
      numString = 'card--' + numOnLine;
    }
    else{
      numString = 'card--1';
    }
    var outer_classes = classNames({
      'card--outer' : true,
      'card--1' : (numString == "card--1"),
      'card--2' : (numString == "card--2"),
      'card--3' : (numString == "card--3")
    });
    return (
      <div className={outer_classes}>
        <div className='card--title'>
          {title}
        </div>
        <div className='card--inner' id={id} style={style}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
