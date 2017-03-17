import React, {PropTypes} from 'react';
import Menu, {Item as MenuItem} from 'rc-menu';

import styles from './navbar.css';


class NavbarTemplate extends React.Component{
  render() {
    const {categroies} = this.props;
    return (
      <Menu mode={'horizontal'}>
        {categroies.map((category, index) =>
          <MenuItem key={index}>
            {category}
          </MenuItem>
        )}
      </Menu>
    );
  }
};

NavbarTemplate.propTypes = {
  categroies: PropTypes.array.isRequired
};

export default NavbarTemplate;
