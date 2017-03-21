import React from 'react';
import getMenuItems from '../../common/api';

import NavbarTemplate from './NavbarTemplate';

export class Navbar extends React.Component{
  render() {
    return React.createElement(NavbarTemplate, {categroies:['This', 'That', 'The Other']});
  }
};

