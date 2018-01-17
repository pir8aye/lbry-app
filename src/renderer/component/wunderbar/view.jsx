// @flow
import React from 'react';
import lbryuri from 'lbryuri';
import classnames from 'classnames';
import Autocomplete from './internal/autocomplete';
import throttle from 'util/throttle';
import Icon from "component/common/icon";

type Props = {
  updateSearchQuery: string => void,
  getSearchSuggestions: string => void,
  onSearch: string => void,
  onSubmit: string => void,
  searchQuery: ?string,
  isActive: boolean,
  address: ?string,
  suggestions: Array<string>,
};

class WunderBar extends React.PureComponent<Props> {
  constructor() {
    super();
    (this: any).handleSubmit = this.handleSubmit.bind(this);
    (this: any).handleChange = this.handleChange.bind(this);
    (this: any).focus = this.focus.bind(this);
    (this: any).throttledGetSearchSuggestions = throttle(this.getSearchSuggestions, 1000);
    this.input = undefined;
  }

  input: ?HTMLInputElement;
  throttledGetSearchSuggestions: (string) => void;

  handleChange(e: SyntheticInputEvent<*>) {
    const { updateSearchQuery, getSearchSuggestions } = this.props;
    const { value } = e.target;

    updateSearchQuery(value);
    this.throttledGetSearchSuggestions(value);
  }

  getSearchSuggestions(value: string) {
    const { getSearchSuggestions } = this.props;
    getSearchSuggestions(value);
  }

  focus() {
    const { input } = this;
    if (input) {
      input.focus();
    }
  }

  handleSubmit(value: string) {
    if (!value) {
      return;
    }

    const { onSubmit, onSearch } = this.props;

    // if they choose the "search for {value}" in the suggestions
    // it will contain the {query}?search
    const choseDoSuggestedSearch = value.endsWith('?search');

    let searchValue = value;
    if (choseDoSuggestedSearch) {
      searchValue = value.slice(0, -7); // trim off ?search
    }

    if (this.input) {
      this.input.blur();
    }

    try {
      const uri = lbryuri.normalize(value);
      onSubmit(uri);
    } catch (e) {
      // search query isn't a valid uri
      onSearch(searchValue);
    }
  }

  render() {
    const { searchQuery, isActive, address, suggestions } = this.props;

    // if we are on the file/channel page
    // use the address in the history stack
    const wunderbarValue = isActive ? searchQuery : searchQuery || address;

    return (
      <div
        className={classnames('header__wunderbar', {
          'header__wunderbar--active': isActive,
        })}
      >
        <Icon icon="Search" />
        <Autocomplete
          autoHighlight
          ref={ref => {
            this.input = ref;
          }}
          wrapperStyle={{ flex: 1 }}
          value={wunderbarValue}
          items={suggestions}
          getItemValue={item => item.value}
          onChange={this.handleChange}
          onSelect={this.handleSubmit}
          renderInput={props => (
            <input
              {...props}
              className="wunderbar__input"
              placeholder="Search for videos, music, games and more"
            />
          )}
          renderItem={(item, isHighlighted) => (
            <div
              key={item.value}
              className={classnames('wunderbar__suggestion', {
                'wunderbar__active-suggestion': isHighlighted,
              })}
            >
              <Icon icon={item.icon} />
              <span className="wunderbar__suggestion-label">{item.label}</span>
            </div>
          )}
        />
      </div>
    );
  }
}

export default WunderBar;
