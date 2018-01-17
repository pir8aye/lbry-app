import { createSelector } from 'reselect';
import { parseQueryParams, toQueryString } from 'util/query_params';
import Lbryuri from 'lbryuri';

export const selectState = state => state.navigation || {};

export const selectCurrentPath = createSelector(selectState, state => state.currentPath);

export const computePageFromPath = path => path.replace(/^\//, '').split('?')[0];

export const selectCurrentPage = createSelector(selectCurrentPath, path =>
  computePageFromPath(path)
);

export const selectCurrentParams = createSelector(selectCurrentPath, path => {
  if (path === undefined) return {};
  if (!path.match(/\?/)) return {};

  return parseQueryParams(path.split('?')[1]);
});

export const makeSelectCurrentParam = param =>
  createSelector(selectCurrentParams, params => (params ? params[param] : undefined));

export const selectPathAfterAuth = createSelector(selectState, state => state.pathAfterAuth);

export const selectIsBackDisabled = createSelector(selectState, state => state.index === 0);

export const selectIsForwardDisabled = createSelector(
  selectState,
  state => state.index === state.stack.length - 1
);

export const selectIsHome = createSelector(
  selectCurrentPage,
  (page) => page === 'discover'
)

export const selectHistoryIndex = createSelector(selectState, state => state.index);

export const selectHistoryStack = createSelector(selectState, state => state.stack);

// returns current page attributes (scrollY, path)
export const selectActiveHistoryEntry = createSelector(
  selectState,
  state => state.stack[state.index]
);

export const selectPageTitle = createSelector(
  selectCurrentPage,
  selectCurrentParams,
  (page, params) => {
    switch (page) {
      case 'show': {
        const parts = [Lbryuri.normalize(params.uri)];
        // If the params has any keys other than "uri"
        if (Object.keys(params).length > 1) {
          parts.push(toQueryString(Object.assign({}, params, { uri: null })));
        }
        return parts.join('?');
      }
      // case 'discover':
      //   return __('Explore New Content');
      // case 'subscriptions':
      //   return __('Your Subscriptions');
      // case 'wallet':
      //   return __('Your Wallet');
      // case 'settings':
      //   return __('Settings');
      // case 'help':
      //   return __('Help');
      // case 'send':
      //   return __('Send LBRY Credits');
      // case 'getcredits':
      //   return __('Get LBRY Credits');
      default:
        return '';
    }
  }
);

export const selectNavLinks = createSelector(
  selectCurrentPage,
  selectHistoryStack,
  (page, historyStack) => {
    // check to see if they've recently been on a wallet sub-link
    const previousStack = historyStack.slice().reverse();
    let walletLink;
    if (page === 'wallet' || page === 'send' || page === 'getcredits') {
      walletLink = '/wallet';
    } else {
      for (let i = 0; i < previousStack.length; i += 1) {
        const currentStackItem = previousStack[i];
        if (
          currentStackItem.path === '/wallet' ||
          currentStackItem.path === '/send' ||
          currentStackItem.path === '/getcredits'
        ) {
          walletLink = currentStackItem.path;
          break;
        }
      }
    }

    const walletSubLinks = [
      {
        label: 'Overview',
        path: '/wallet',
        active: page === 'wallet',
      },
      {
        label: 'Send & Recieve',
        path: '/send',
        active: page === 'send',
      },
      {
        label: 'Get Credits',
        path: '/getcredits',
        active: page === 'getcredits',
      },
      {
        label: 'Rewards',
        path: '/rewards',
        active: page === 'rewards',
      },
      {
        label: 'My Transactions',
        path: '/history',
        active: page === 'history',
      },
    ];

    const navLinks = {
      primary: [
        {
          label: 'Explore',
          path: '/discover',
          active: page === 'discover',
          icon: 'Compass',
        },
        {
          label: 'Subscriptions',
          path: '/subscriptions',
          active: page === 'subscriptions',
          icon: 'AtSign',
        },
      ],
      secondary: [
        {
          label: 'Wallet',
          path: walletLink || '/wallet',
          active: page === 'wallet' || !!walletSubLinks.find(({ path }) => page === path.slice(1)),
          subLinks: walletSubLinks,
          icon: 'CreditCard',
        },
        {
          label: 'Publish',
          path: '/publish',
          active: page === 'publish',
          icon: 'UploadCloud',
        },
        {
          label: 'Settings',
          path: '/settings',
          active: page === 'settings',
          icon: 'Settings',
        },
        {
          label: 'Help',
          path: '/help',
          active: page === 'help',
          icon: 'HelpCircle',
        },
      ],
    };
    return navLinks;
  }
);
