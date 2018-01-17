import { connect } from 'react-redux';
import {
  selectPageTitle,
  selectHistoryIndex,
  selectActiveHistoryEntry,
} from 'redux/selectors/navigation';
import { doNavigate, doHistoryBack, doHistoryForward } from 'redux/actions/navigation';
import {
  selectIsBackDisabled,
  selectIsForwardDisabled,
  selectIsHome,
  selectCurrentPage,
  selectNavLinks,
} from 'redux/selectors/navigation';
import { selectUser } from 'redux/selectors/user';
import { selectIsUpgradeAvailable } from 'redux/selectors/app';
import { formatCredits } from 'util/formatCredits';
import { selectBalance } from 'redux/selectors/wallet';
import { doAlertError } from 'redux/actions/app';
import { doRecordScroll } from 'redux/actions/navigation';
import App from './view';

const select = (state, props) => ({
  pageTitle: selectPageTitle(state),
  navLinks: selectNavLinks(state),
  isBackDisabled: selectIsBackDisabled(state),
  isForwardDisabled: selectIsForwardDisabled(state),
  isHome: selectIsHome(state)
});

const perform = dispatch => ({
  navigate: path => dispatch(doNavigate(path)),
  back: () => dispatch(doHistoryBack()),
  forward: () => dispatch(doHistoryForward()),
});

export default connect(select, perform)(App);
