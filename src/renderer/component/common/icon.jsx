// @flow
import React from 'react';
import classnames from 'classnames';
import * as icons from 'constants/icons';
import * as Icons from 'react-feather';

type Props = {
  icon: string,
  color?: string,
  size?: number,
};

class IconComponent extends React.PureComponent<Props> {
  // getIconTitle() {
  //   const { icon } = this.props;
  //
  //   switch (icon) {
  //     case icons.FEATURED:
  //       return __('Watch this and earn rewards.');
  //     case icons.LOCAL:
  //       return __('You have a copy of this file.');
  //     default:
  //       return '';
  //   }
  // }

  render() {
    const { icon, size = 14, color } = this.props;
    const Icon = Icons[icon];
    return Icon ? <Icon size={size} color={color} className="icon" /> : null;
  }
}

export default IconComponent;
