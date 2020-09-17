import React from 'react';
import PropTypes from 'prop-types';
import momentPropTypes from 'react-moment-proptypes';
import moment from 'moment';
import omit from 'lodash/omit';

import { withStyles, withStylesPropTypes, css } from 'react-with-styles';

import DateRangePicker from '../src/components/DateRangePicker';

import { DateRangePickerPhrases } from '../src/defaultPhrases';
import DateRangePickerShape from '../src/shapes/DateRangePickerShape';
import { START_DATE, END_DATE, HORIZONTAL_ORIENTATION, ANCHOR_LEFT } from '../src/constants';
import isSameDay from '../src/utils/isSameDay';

const propTypes = {
  ...withStylesPropTypes,

  // example props for the demo
  autoFocus: PropTypes.bool,
  autoFocuswidget_date_to: PropTypes.bool,
  initialwidget_date: momentPropTypes.momentObj,
  initialwidget_date_to: momentPropTypes.momentObj,
  presets: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string,
    start: momentPropTypes.momentObj,
    end: momentPropTypes.momentObj,
  })),

  ...omit(DateRangePickerShape, [
    'widget_date',
    'widget_date_to',
    'onDatesChange',
    'focusedInput',
    'onFocusChange',
  ]),
};

const defaultProps = {
  // example props for the demo
  autoFocus: false,
  autoFocuswidget_date_to: false,
  initialwidget_date: null,
  initialwidget_date_to: null,
  presets: [],

  // input related props
  widget_dateId: START_DATE,
  widget_datePlaceholderText: 'Start Date',
  widget_date_toId: END_DATE,
  widget_date_toPlaceholderText: 'End Date',
  disabled: false,
  required: false,
  screenReaderInputMessage: '',
  showClearDates: false,
  showDefaultInputIcon: false,
  customInputIcon: null,
  customArrowIcon: null,
  customCloseIcon: null,

  // calendar presentation and interaction related props
  renderMonthText: null,
  orientation: HORIZONTAL_ORIENTATION,
  anchorDirection: ANCHOR_LEFT,
  horizontalMargin: 0,
  withPortal: false,
  withFullScreenPortal: false,
  initialVisibleMonth: null,
  numberOfMonths: 2,
  keepOpenOnDateSelect: false,
  reopenPickerOnClearDates: false,
  isRTL: false,

  // navigation related props
  navPrev: null,
  navNext: null,
  onPrevMonthClick() {},
  onNextMonthClick() {},
  onClose() {},

  // day presentation and interaction related props
  renderDayContents: null,
  minimumNights: 0,
  enableOutsideDays: false,
  isDayBlocked: () => false,
  isOutsideRange: day => false,
  isDayHighlighted: () => false,

  // internationalization
  displayFormat: () => moment.localeData().longDateFormat('L'),
  monthFormat: 'MMMM YYYY',
  phrases: DateRangePickerPhrases,
};

class DateRangePickerWrapper extends React.Component {
  constructor(props) {
    super(props);

    let focusedInput = null;
    if (props.autoFocus) {
      focusedInput = START_DATE;
    } else if (props.autoFocuswidget_date_to) {
      focusedInput = END_DATE;
    }

    this.state = {
      focusedInput,
      widget_date: props.initialwidget_date,
      widget_date_to: props.initialwidget_date_to,
    };

    this.onDatesChange = this.onDatesChange.bind(this);
    this.onFocusChange = this.onFocusChange.bind(this);
    this.renderDatePresets = this.renderDatePresets.bind(this);
  }

  onDatesChange({ widget_date, widget_date_to }) {
    this.setState({ widget_date, widget_date_to });
  }

  onFocusChange(focusedInput) {
    this.setState({ focusedInput });
  }

  renderDatePresets() {
    const { presets, styles } = this.props;
    const { widget_date, widget_date_to } = this.state;

    return (
      <div {...css(styles.PresetDateRangePicker_panel)}>
        {presets.map(({ text, start, end }) => {
          const isSelected = isSameDay(start, widget_date) && isSameDay(end, widget_date_to);
          return (
            <button
              key={text}
              {...css(
                styles.PresetDateRangePicker_button,
                isSelected && styles.PresetDateRangePicker_button__selected,
              )}
              type="button"
              onClick={() => this.onDatesChange({ widget_date: start, widget_date_to: end })}
            >
              {text}
            </button>
          );
        })}
      </div>
    );
  }

  render() {
    const { focusedInput, widget_date, widget_date_to } = this.state;

    // autoFocus, autoFocuswidget_date_to, initialwidget_date and initialwidget_date_to are helper props for the
    // example wrapper but are not props on the SingleDatePicker itself and
    // thus, have to be omitted.
    const props = omit(this.props, [
      'autoFocus',
      'autoFocuswidget_date_to',
      'initialwidget_date',
      'initialwidget_date_to',
      'presets',
    ]);

    return (
      <div>
        <DateRangePicker
          {...props}
          renderCalendarInfo={this.renderDatePresets}
          onDatesChange={this.onDatesChange}
          onFocusChange={this.onFocusChange}
          focusedInput={focusedInput}
          widget_date={widget_date}
          widget_date_to={widget_date_to}
        />
      </div>
    );
  }
}

DateRangePickerWrapper.propTypes = propTypes;
DateRangePickerWrapper.defaultProps = defaultProps;

export default withStyles(({ reactDates: { color } }) => ({
  PresetDateRangePicker_panel: {
    padding: '0 22px 11px 22px',
  },

  PresetDateRangePicker_button: {
    position: 'relative',
    height: '100%',
    textAlign: 'center',
    background: 'none',
    border: `2px solid ${color.core.primary}`,
    color: color.core.primary,
    padding: '4px 12px',
    marginRight: 8,
    font: 'inherit',
    fontWeight: 700,
    lineHeight: 'normal',
    overflow: 'visible',
    boxSizing: 'border-box',
    cursor: 'pointer',

    ':active': {
      outline: 0,
    },
  },

  PresetDateRangePicker_button__selected: {
    color: color.core.white,
    background: color.core.primary,
  },
}))(DateRangePickerWrapper);
