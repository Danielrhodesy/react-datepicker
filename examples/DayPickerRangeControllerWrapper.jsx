/* eslint-disable react/no-unused-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import momentPropTypes from 'react-moment-proptypes';
import { forbidExtraProps } from 'airbnb-prop-types';
import moment from 'moment';
import omit from 'lodash/omit';

import DayPickerRangeController from '../src/components/DayPickerRangeController';

import ScrollableOrientationShape from '../src/shapes/ScrollableOrientationShape';

import { START_DATE, END_DATE, HORIZONTAL_ORIENTATION } from '../src/constants';
import isInclusivelyAfterDay from '../src/utils/isInclusivelyAfterDay';

const propTypes = forbidExtraProps({
  // example props for the demo
  autoFocuswidget_date_to: PropTypes.bool,
  initialwidget_date: momentPropTypes.momentObj,
  initialwidget_date_to: momentPropTypes.momentObj,
  widget_dateOffset: PropTypes.func,
  widget_date_toOffset: PropTypes.func,
  showInputs: PropTypes.bool,
  minDate: momentPropTypes.momentObj,
  maxDate: momentPropTypes.momentObj,

  keepOpenOnDateSelect: PropTypes.bool,
  minimumNights: PropTypes.number,
  isOutsideRange: PropTypes.func,
  isDayBlocked: PropTypes.func,
  isDayHighlighted: PropTypes.func,
  daysViolatingMinNightsCanBeClicked: PropTypes.bool,

  // DayPicker props
  enableOutsideDays: PropTypes.bool,
  numberOfMonths: PropTypes.number,
  orientation: ScrollableOrientationShape,
  verticalHeight: PropTypes.number,
  withPortal: PropTypes.bool,
  initialVisibleMonth: PropTypes.func,
  renderCalendarInfo: PropTypes.func,
  renderMonthElement: PropTypes.func,
  renderMonthText: PropTypes.func,

  navPrev: PropTypes.node,
  navNext: PropTypes.node,
  renderNavPrevButton: PropTypes.func,
  renderNavNextButton: PropTypes.func,

  onPrevMonthClick: PropTypes.func,
  onNextMonthClick: PropTypes.func,
  onOutsideClick: PropTypes.func,
  renderCalendarDay: PropTypes.func,
  renderDayContents: PropTypes.func,
  renderKeyboardShortcutsButton: PropTypes.func,
  renderKeyboardShortcutsPanel: PropTypes.func,

  // i18n
  monthFormat: PropTypes.string,

  isRTL: PropTypes.bool,
});

const defaultProps = {
  // example props for the demo
  autoFocuswidget_date_to: false,
  initialwidget_date: null,
  initialwidget_date_to: null,
  widget_dateOffset: undefined,
  widget_date_toOffset: undefined,
  showInputs: false,
  minDate: null,
  maxDate: null,

  // day presentation and interaction related props
  renderCalendarDay: undefined,
  renderDayContents: null,
  minimumNights: 1,
  isDayBlocked: () => false,
  isOutsideRange: day => !isInclusivelyAfterDay(day, moment()),
  isDayHighlighted: () => false,
  enableOutsideDays: false,
  daysViolatingMinNightsCanBeClicked: false,

  // calendar presentation and interaction related props
  orientation: HORIZONTAL_ORIENTATION,
  verticalHeight: undefined,
  withPortal: false,
  initialVisibleMonth: null,
  numberOfMonths: 2,
  onOutsideClick() {},
  keepOpenOnDateSelect: false,
  renderCalendarInfo: null,
  isRTL: false,
  renderMonthText: null,
  renderMonthElement: null,
  renderKeyboardShortcutsButton: undefined,
  renderKeyboardShortcutsPanel: undefined,

  // navigation related props
  navPrev: null,
  navNext: null,
  renderNavPrevButton: null,
  renderNavNextButton: null,
  onPrevMonthClick() {},
  onNextMonthClick() {},

  // internationalization
  monthFormat: 'MMMM YYYY',
};

class DayPickerRangeControllerWrapper extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      errorMessage: null,
      focusedInput: props.autoFocuswidget_date_to ? END_DATE : START_DATE,
      widget_date: props.initialwidget_date,
      widget_date_to: props.initialwidget_date_to,
    };

    this.onDatesChange = this.onDatesChange.bind(this);
    this.onFocusChange = this.onFocusChange.bind(this);
  }

  onDatesChange({ widget_date, widget_date_to }) {
    const { daysViolatingMinNightsCanBeClicked, minimumNights } = this.props;
    let doesNotMeetMinNights = false;
    if (daysViolatingMinNightsCanBeClicked && widget_date && widget_date_to) {
      const dayDiff = widget_date_to.diff(widget_date.clone().startOf('day').hour(12), 'days');
      doesNotMeetMinNights = dayDiff < minimumNights && dayDiff >= 0;
    }
    this.setState({
      widget_date,
      widget_date_to: doesNotMeetMinNights ? null : widget_date_to,
      errorMessage: doesNotMeetMinNights
        ? 'That day does not meet the minimum nights requirement'
        : null,
    });
  }

  onFocusChange(focusedInput) {
    this.setState({
      // Force the focusedInput to always be truthy so that dates are always selectable
      focusedInput: !focusedInput ? START_DATE : focusedInput,
    });
  }

  render() {
    const { renderCalendarInfo: renderCalendarInfoProp, showInputs } = this.props;
    const {
      errorMessage,
      focusedInput,
      widget_date,
      widget_date_to,
    } = this.state;

    const props = omit(this.props, [
      'autoFocus',
      'autoFocuswidget_date_to',
      'initialwidget_date',
      'initialwidget_date_to',
      'showInputs',
    ]);

    const widget_dateString = widget_date && widget_date.format('YYYY-MM-DD');
    const widget_date_toString = widget_date_to && widget_date_to.format('YYYY-MM-DD');
    const renderCalendarInfo = errorMessage ? () => <div>{errorMessage}</div> : renderCalendarInfoProp;

    return (
      <div style={{ height: '100%' }}>
        {showInputs && (
          <div style={{ marginBottom: 16 }}>
            <input type="text" name="start date" value={widget_dateString} readOnly />
            <input type="text" name="end date" value={widget_date_toString} readOnly />
          </div>
        )}

        <DayPickerRangeController
          {...props}
          onDatesChange={this.onDatesChange}
          onFocusChange={this.onFocusChange}
          focusedInput={focusedInput}
          widget_date={widget_date}
          widget_date_to={widget_date_to}
          renderCalendarInfo={renderCalendarInfo}
        />
      </div>
    );
  }
}

DayPickerRangeControllerWrapper.propTypes = propTypes;
DayPickerRangeControllerWrapper.defaultProps = defaultProps;

export default DayPickerRangeControllerWrapper;
