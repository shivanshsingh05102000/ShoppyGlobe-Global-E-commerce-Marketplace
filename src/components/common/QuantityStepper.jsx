import PropTypes from 'prop-types';
import './QuantityStepper.css';
import { MIN_QUANTITY } from '../../utils/constants';

/**
 * QuantityStepper
 * The +/- control used inside CartItem to adjust quantity. The decrement
 * button disables itself (rather than letting the count go to 0) once the
 * quantity hits MIN_QUANTITY — a belt-and-suspenders UI guard on top of
 * the clamping already enforced in cartSlice's reducer.
 */
function QuantityStepper({ quantity, max, onIncrement, onDecrement, disabled = false }) {
  const atMin = quantity <= MIN_QUANTITY;
  const atMax = typeof max === 'number' && quantity >= max;

  return (
    <div className="qty-stepper" role="group" aria-label="Quantity">
      <button
        type="button"
        className="qty-stepper__btn"
        onClick={onDecrement}
        disabled={disabled || atMin}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="qty-stepper__value" aria-live="polite">{quantity}</span>
      <button
        type="button"
        className="qty-stepper__btn"
        onClick={onIncrement}
        disabled={disabled || atMax}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

QuantityStepper.propTypes = {
  quantity: PropTypes.number.isRequired,
  max: PropTypes.number,
  onIncrement: PropTypes.func.isRequired,
  onDecrement: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default QuantityStepper;
