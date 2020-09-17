import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import momentPropTypes from 'react-moment-proptypes';
import { forbidExtraProps, nonNegativeInteger } from 'airbnb-prop-types';
import openDirectionShape from '../shapes/OpenDirectionShape';

import { DateRangePickerInputPhrases } from '../defaultPhrases';
import getPhrasePropTypes from '../utils/getPhrasePropTypes';

import DateRangePickerInput from './DateRangePickerInput';

import IconPositionShape from '../shapes/IconPositionShape';
import DisabledShape from '../shapes/DisabledShape';

import toMomentObject from '../utils/toMomentObject';
import toLocalizedDateString from '../utils/toLocalizedDateString';

import isInclusivelyAfterDay from '../utils/isInclusivelyAfterDay';
import isBeforeDay from '../utils/isBeforeDay';

import {
  START_DATE,
  END_DATE,
  ICON_BEFORE_POSITION,
  OPEN_DOWN,
} from '../constants';

const propTypes = forbidExtraProps({
  children: PropTypes.node,

  widget_date: momentPropTypes.momentObj,
  widget_dateId: PropTypes.string,
  widget_datePlaceholderText: PropTypes.string,
  iswidget_dateFocused: PropTypes.bool,
  widget_dateAriaLabel: PropTypes.string,

  widget_date_to: momentPropTypes.momentObj,
  widget_date_toId: PropTypes.string,
  widget_date_toPlaceholderText: PropTypes.string,
  iswidget_date_toFocused: PropTypes.bool,
  widget_date_toAriaLabel: PropTypes.string,

  screenReaderMessage: PropTypes.string,
  showClearDates: PropTypes.bool,
  showCaret: PropTypes.bool,
  showDefaultInputIcon: PropTypes.bool,
  inputIconPosition: IconPositionShape,
  disabled: DisabledShape,
  required: PropTypes.bool,
  readOnly: PropTypes.bool,
  openDirection: openDirectionShape,
  noBorder: PropTypes.bool,
  block: PropTypes.bool,
  small: PropTypes.bool,
  regular: PropTypes.bool,
  verticalSpacing: nonNegativeInteger,

  keepOpenOnDateSelect: PropTypes.bool,
  reopenPickerOnClearDates: PropTypes.bool,
  withFullScreenPortal: PropTypes.bool,
  minimumNights: nonNegativeInteger,
  isOutsideRange: PropTypes.func,
  isDayBlocked: PropTypes.func,
  displayFormat: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

  onFocusChange: PropTypes.func,
  onClose: PropTypes.func,
  onDatesChange: PropTypes.func,
  onKeyDownArrowDown: PropTypes.func,
  onKeyDownQuestionMark: PropTypes.func,

  customInputIcon: PropTypes.node,
  customArrowIcon: PropTypes.node,
  customCloseIcon: PropTypes.node,

  // accessibility
  isFocused: PropTypes.bool,

  // i18n
  phrases: PropTypes.shape(getPhrasePropTypes(DateRangePickerInputPhrases)),

  isRTL: PropTypes.bool,
});

const defaultProps = {
  children: null,

  widget_date: null,
  widget_dateId: START_DATE,
  widget_datePlaceholderText: 'Start Date',
  iswidget_dateFocused: false,
  widget_dateAriaLabel: undefined,

  widget_date_to: null,
  widget_date_toId: END_DATE,
  widget_date_toPlaceholderText: 'End Date',
  iswidget_date_toFocused: false,
  widget_date_toAriaLabel: undefined,

  screenReaderMessage: '',
  showClearDates: false,
  showCaret: false,
  showDefaultInputIcon: false,
  inputIconPosition: ICON_BEFORE_POSITION,
  disabled: false,
  required: false,
  readOnly: false,
  openDirection: OPEN_DOWN,
  noBorder: false,
  block: false,
  small: false,
  regular: false,
  verticalSpacing: undefined,

  keepOpenOnDateSelect: false,
  reopenPickerOnClearDates: false,
  withFullScreenPortal: false,
  minimumNights: 1,
  isOutsideRange: (day) => !isInclusivelyAfterDay(day, moment()),
  isDayBlocked: () => false,
  displayFormat: () => moment.localeData().longDateFormat('L'),

  onFocusChange() {},
  onClose() {},
  onDatesChange() {},
  onKeyDownArrowDown() {},
  onKeyDownQuestionMark() {},

  customInputIcon: null,
  customArrowIcon: null,
  customCloseIcon: null,

  // accessibility
  isFocused: false,

  // i18n
  phrases: DateRangePickerInputPhrases,

  isRTL: false,
};

export default class DateRangePickerInputController extends React.PureComponent {
  constructor(props) {
    super(props);

    this.onClearFocus = this.onClearFocus.bind(this);
    this.onwidget_dateChange = this.onwidget_dateChange.bind(this);
    this.onwidget_dateFocus = this.onwidget_dateFocus.bind(this);
    this.onwidget_date_toChange = this.onwidget_date_toChange.bind(this);
    this.onwidget_date_toFocus = this.onwidget_date_toFocus.bind(this);
    this.clearDates = this.clearDates.bind(this);
  }

  onClearFocus() {
    const {
      onFocusChange,
      onClose,
      widget_date,
      widget_date_to,
    } = this.props;

    onFocusChange(null);
    onClose({ widget_date, widget_date_to });
  }

  onwidget_date_toChange(widget_date_toString) {
    const {
      widget_date,
      isOutsideRange,
      isDayBlocked,
      minimumNights,
      keepOpenOnDateSelect,
      onDatesChange,
    } = this.props;

    const widget_date_to = toMomentObject(widget_date_toString, this.getDisplayFormat());

    const iswidget_date_toValid = widget_date_to
      && !isOutsideRange(widget_date_to) && !isDayBlocked(widget_date_to)
      && !(widget_date && isBeforeDay(widget_date_to, widget_date.clone().add(minimumNights, 'days')));
    if (iswidget_date_toValid) {
      onDatesChange({ widget_date, widget_date_to });
      if (!keepOpenOnDateSelect) this.onClearFocus();
    } else {
      onDatesChange({
        widget_date,
        widget_date_to: null,
      });
    }
  }

  onwidget_date_toFocus() {
    const {
      widget_date,
      onFocusChange,
      withFullScreenPortal,
      disabled,
    } = this.props;

    if (!widget_date && withFullScreenPortal && (!disabled || disabled === END_DATE)) {
      // When the datepicker is full screen, we never want to focus the end date first
      // because there's no indication that that is the case once the datepicker is open and it
      // might confuse the user
      onFocusChange(START_DATE);
    } else if (!disabled || disabled === START_DATE) {
      onFocusChange(END_DATE);
    }
  }

  onwidget_dateChange(widget_dateString) {
    let { widget_date_to } = this.props;
    const {
      isOutsideRange,
      isDayBlocked,
      minimumNights,
      onDatesChange,
      onFocusChange,
      disabled,
    } = this.props;

    const widget_date = toMomentObject(widget_dateString, this.getDisplayFormat());
    const iswidget_date_toBeforewidget_date = widget_date
      && isBeforeDay(widget_date_to, widget_date.clone().add(minimumNights, 'days'));
    const iswidget_dateValid = widget_date
      && !isOutsideRange(widget_date) && !isDayBlocked(widget_date)
      && !(disabled === END_DATE && iswidget_date_toBeforewidget_date);

    if (iswidget_dateValid) {
      if (iswidget_date_toBeforewidget_date) {
        widget_date_to = null;
      }

      onDatesChange({ widget_date, widget_date_to });
      onFocusChange(END_DATE);
    } else {
      onDatesChange({
        widget_date: null,
        widget_date_to,
      });
    }
  }

  onwidget_dateFocus() {
    const { disabled, onFocusChange } = this.props;

    if (!disabled || disabled === END_DATE) {
      onFocusChange(START_DATE);
    }
  }

  getDisplayFormat() {
    const { displayFormat } = this.props;
    return typeof displayFormat === 'string' ? displayFormat : displayFormat();
  }

  getDateString(date) {
    const displayFormat = this.getDisplayFormat();
    if (date && displayFormat) {
      return date && date.format(displayFormat);
    }
    return toLocalizedDateString(date);
  }

  clearDates() {
    const { onDatesChange, reopenPickerOnClearDates, onFocusChange } = this.props;
    onDatesChange({ widget_date: null, widget_date_to: null });
    if (reopenPickerOnClearDates) {
      onFocusChange(START_DATE);
    }
  }

  render() {
    const {
      children,
      widget_date,
      widget_dateId,
      widget_datePlaceholderText,
      iswidget_dateFocused,
      widget_dateAriaLabel,
      widget_date_to,
      widget_date_toId,
      widget_date_toPlaceholderText,
      widget_date_toAriaLabel,
      iswidget_date_toFocused,
      screenReaderMessage,
      showClearDates,
      showCaret,
      showDefaultInputIcon,
      inputIconPosition,
      customInputIcon,
      customArrowIcon,
      customCloseIcon,
      disabled,
      required,
      readOnly,
      openDirection,
      isFocused,
      phrases,
      onKeyDownArrowDown,
      onKeyDownQuestionMark,
      isRTL,
      noBorder,
      block,
      small,
      regular,
      verticalSpacing,
    } = this.props;

    const widget_dateString = this.getDateString(widget_date);
    const widget_date_toString = this.getDateString(widget_date_to);

    return (
      <DateRangePickerInput
        widget_date={widget_dateString}
        widget_dateId={widget_dateId}
        widget_datePlaceholderText={widget_datePlaceholderText}
        iswidget_dateFocused={iswidget_dateFocused}
        widget_dateAriaLabel={widget_dateAriaLabel}
        widget_date_to={widget_date_toString}
        widget_date_toId={widget_date_toId}
        widget_date_toPlaceholderText={widget_date_toPlaceholderText}
        iswidget_date_toFocused={iswidget_date_toFocused}
        widget_date_toAriaLabel={widget_date_toAriaLabel}
        isFocused={isFocused}
        disabled={disabled}
        required={required}
        readOnly={readOnly}
        openDirection={openDirection}
        showCaret={showCaret}
        showDefaultInputIcon={showDefaultInputIcon}
        inputIconPosition={inputIconPosition}
        customInputIcon={customInputIcon}
        customArrowIcon={customArrowIcon}
        customCloseIcon={customCloseIcon}
        phrases={phrases}
        onwidget_dateChange={this.onwidget_dateChange}
        onwidget_dateFocus={this.onwidget_dateFocus}
        onwidget_dateShiftTab={this.onClearFocus}
        onwidget_date_toChange={this.onwidget_date_toChange}
        onwidget_date_toFocus={this.onwidget_date_toFocus}
        showClearDates={showClearDates}
        onClearDates={this.clearDates}
        screenReaderMessage={screenReaderMessage}
        onKeyDownArrowDown={onKeyDownArrowDown}
        onKeyDownQuestionMark={onKeyDownQuestionMark}
        isRTL={isRTL}
        noBorder={noBorder}
        block={block}
        small={small}
        regular={regular}
        verticalSpacing={verticalSpacing}
      >
        {children}
      </DateRangePickerInput>
    );
  }
}

DateRangePickerInputController.propTypes = propTypes;
DateRangePickerInputController.defaultProps = defaultProps;
