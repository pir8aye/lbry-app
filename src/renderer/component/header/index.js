import React from 'react';
import { connect } from 'react-redux';
import {
  selectPageTitle,
  selectHistoryIndex,
  selectActiveHistoryEntry,
} from 'redux/selectors/navigation';
import { selectIsUpgradeAvailable } from 'redux/selectors/app';
import { selectUser } from 'redux/selectors/user';
import { doAlertError } from 'redux/actions/app';
import { doRecordScroll } from 'redux/actions/navigation';
import { formatCredits } from 'util/formatCredits';
import { selectBalance } from 'redux/selectors/wallet';
import Header from './view';

const select = (state, props) => ({
  isUpgradeAvailable: selectIsUpgradeAvailable(state),
  balance: formatCredits(selectBalance(state) || 0, 2),
});

const perform = dispatch => ({
  navigate: path => dispatch(doNavigate(path)),
});

export default connect(select, perform)(Header);
