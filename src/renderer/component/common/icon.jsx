// @flow
import React from 'react';
import classnames from 'classnames';
import * as icons from 'constants/icons';
import * as Icons from 'react-feather';

type Props = {
  icon: string,
  color: string,
  size: number,
};

class Icon extends React.PureComponent<Props> {
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
    const { icon, color = "black", size = 14 } = this.props;
    // const iconClassName = icon.startsWith('icon-') ? icon : `icon-${icon}`;
    // const title = this.getIconTitle();
    //
    // const spanClassName = classnames(
    //   {
    //     'icon--fixed-width': fixed,
    //     'icon--padded': padded,
    //   },
    //   iconClassName
    // );



    const Icon = Icons[icon];

    return Icon ? (
      <Icon size={size}/>
    ) : null; // throw an error if no icon?
    // return <span className={spanClassName} title={title} />;
  }
}

export default Icon;
