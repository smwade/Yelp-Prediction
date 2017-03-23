import React from 'react';
import Select from 'react-select';
import axios from 'axios';

function getAllStates() {
  return axios.get('/api/states/');
}

var StatesField = React.createClass({
  displayName: 'StatesField',
  propTypes: {
    label: React.PropTypes.string,
    searchable: React.PropTypes.bool,
  },
  getDefaultProps () {
    getAllStates().then(function(states){
      return {
        label: 'States:',
        options: states.data,
        searchable: true,
      };
    });
  },
  getInitialState () {
    return {
      disabled: false,
      searchable: this.props.searchable,
      selectValue: 'new-south-wales',
    };
  },
  /*updateValue (newValue) {
    console.log('State changed to ' + newValue);
    this.setState({
      selectValue: newValue
    });
  },*/
  focusStateSelect () {
    this.refs.stateSelect.focus();
  },
  render () {
    return (
      <div className="section">
        <h3 className="section-heading">{this.props.label}</h3>
        <Select ref="stateSelect" autofocus options={this.props.options} simpleValue clearable={false} name="selected-state" disabled={this.state.disabled} value={this.state.selectValue} onChange={this.props.updateValue} searchable={this.state.searchable} />
      </div>
    );
  }
});


module.exports = StatesField;
