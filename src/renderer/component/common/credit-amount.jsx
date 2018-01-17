import React from "react";
import classnames from 'classnames';
import { formatCredits, formatFullPrice } from 'util/formatCredits';

class CreditAmount extends React.PureComponent {
  // static propTypes = {
  //   amount: PropTypes.number.isRequired,
  //   precision: PropTypes.number,
  //   isEstimate: PropTypes.bool,
  //   label: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  //   showFree: PropTypes.bool,
  //   showFullPrice: PropTypes.bool,
  //   showPlus: PropTypes.bool,
  //   look: PropTypes.oneOf(['indicator', 'plain', 'fee']),
  // };
  //
  // static defaultProps = {
  //   precision: 2,
  //   label: true,
  //   showFree: false,
  //   look: 'indicator',
  //   showFullPrice: false,
  //   showPlus: false,
  // };

  render() {
    const minimumRenderableAmount = Math.pow(10, -1 * this.props.precision);
    const { amount, precision, showFullPrice, showFree, label, showPlus } = this.props;

    const fullPrice = formatFullPrice(amount, 2);
    const isFree = parseFloat(amount) === 0;

    let formattedAmount;
    if (showFullPrice) {
      formattedAmount = fullPrice;
    } else {
      formattedAmount =
        amount > 0 && amount < minimumRenderableAmount
          ? `<${minimumRenderableAmount}`
          : formatCredits(amount, precision);
    }

    let amountText;
    if (this.props.showFree && isFree) {
      amountText = __('FREE');
    } else {
      amountText = `${formattedAmount} ${__('LBC')}`

      if (showPlus && amount > 0) {
        amountText = `+${amountText}`;
      }
    }

    return (
      <span
        title={fullPrice}
        className={classnames('credit-amount', {
          'credit-amount--free': isFree,
          'credit-amount--cost': !isFree
        })}>
        {amountText}

        {this.props.isEstimate ? (
          <span
            className="credit-amount__estimate"
            title={__('This is an estimate and does not include data fees')}
          >
            *
          </span>
        ) : null}
      </span>
    );
  }
}

export default CreditAmount;
