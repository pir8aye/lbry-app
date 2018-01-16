// @flow
import * as React from 'react';
import classnames from 'classnames';
import { BusyMessage } from 'component/common';
import Button from 'component/link';

type NavLink = {
  label: string,
  path: string,
  active: boolean,
  subLinks?: Array<NavLink>,
};

type NavLinks = {
  primary: Array<NavLink>,
  secondary: Array<NavLink>,
};

type Props = {
  children: React.Node,
  pageTitle: ?string,
  noPadding: ?boolean,
  isLoading: ?boolean,
  back: () => void,
  forward: () => void,
  isBackDisabled: boolean,
  isForwardDisabled: boolean,
  navigate: (string, ?{}) => void,
  balance: string,
  downloadUpgrade: any => void,
  isUpgradeAvailable: boolean,
  navLinks: NavLinks,
};

const Page = (props: Props) => {
  const { pageTitle, children } = props;
  return (
    <main className="main">
      <div className="page__header">
        {pageTitle && <h1 className="page__title">{pageTitle}</h1>}
      </div>
      {children}
    </main>
  );
};

export default Page;
