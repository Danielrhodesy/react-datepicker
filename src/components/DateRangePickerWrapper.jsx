  
import React from 'react';
import PropTypes from 'prop-types';
import momentPropTypes from 'react-moment-proptypes';
import moment from 'moment';
import omit from 'lodash/omit';

import DateRangePicker from './DateRangePicker';

import { DateRangePickerPhrases } from '../defaultPhrases';
import DateRangePickerShape from '../shapes/DateRangePickerShape';
import {
  START_DATE,
  END_DATE,
  HORIZONTAL_ORIENTATION,
  ANCHOR_LEFT,
  NAV_POSITION_TOP,
} from '../constants';
import isInclusivelyAfterDay from '../utils/isInclusivelyAfterDay';

const propTypes = {
  // example props for the demo
  autoFocus: PropTypes.bool,
  autoFocuswidget_date_to: PropTypes.bool,
  stateDateWrapper: PropTypes.func,
  initialwidget_date: momentPropTypes.momentObj,
  initialwidget_date_to: momentPropTypes.momentObj,

  

  ...omit(DateRangePickerShape, [
    'widget_date',
    'widget_date_to',
    'onDatesChange',
    'focusedInput',
    'onFocusChange',
  ]),
};

const datesList = [
  moment(),
  moment().add(1, 'days'),
  moment().add(3, 'days'),
  moment().add(9, 'days'),
  moment().add(10, 'days'),
  moment().add(11, 'days'),
  moment().add(12, 'days'),
  moment().add(13, 'days'),
];

const defaultProps = {
  // example props for the demo
  autoFocus: false,
  autoFocuswidget_date_to: false,
  initialwidget_date: null,
  initialwidget_date_to: null,

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
  block: false,
  small: false,
  regular: false,

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
  navPosition: NAV_POSITION_TOP,
  navPrev: null,
  navNext: null,
  onPrevMonthClick() {},
  onNextMonthClick() {},
  onClose() {},

  // day presentation and interaction related props
  renderCalendarDay: undefined,
  renderDayContents: null,
  minimumNights: 1,
  enableOutsideDays: false,
  isDayBlocked: () => false,
  isOutsideRange: day => !isInclusivelyAfterDay(day, moment()),
  isDayHighlighted: () => false,

  // internationalization
  displayFormat: () => moment.localeData().longDateFormat('L'),
  monthFormat: 'MMMM YYYY',
  phrases: DateRangePickerPhrases,

  stateDateWrapper: date => date,
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
  }

  

  onDatesChange({ widget_date, widget_date_to }) {
    const { stateDateWrapper } = this.props;
    this.setState({
      widget_date: widget_date && stateDateWrapper(widget_date),
      widget_date_to: widget_date_to && stateDateWrapper(widget_date_to),
    });
  }

  onFocusChange(focusedInput) {
    this.setState({ focusedInput });
  }

  // isBlocked(day) {
  //   const availableDates = ["20-09-2020", "2020-09-23", "2020-09-24", "2020-09-25", "2020-09-27","2020-09-28"]
  //   return availableDates.some(date => day.isSame(date), 'day')
  // }

  isDayBlocked(day) {
    // const unavailableDays = this.props.value
    const unavailableDays = ["20-09-2020", "2020-09-23", "2020-09-24", "2020-09-25", "2020-09-27","2020-09-28"]
    return unavailableDays.some((unavailableDay) => moment(unavailableDay).isSame(day, 'day'));
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
      'stateDateWrapper',
    ]);

    return (
      <div>
        <form method="post" action="https://hotels.cloudbeds.com/reservas/UZZgsG">
            <input type="hidden" name="date_format" value="d/m/Y"/>
            <DateRangePicker
                {...props}
                onDatesChange={this.onDatesChange}
                onFocusChange={this.onFocusChange}
                focusedInput={focusedInput}
                widget_date={widget_date}
                widget_date_to={widget_date_to}
                displayFormat={() => "DD/MM/YYYY"}
                isDayBlocked={this.isDayBlocked}
                // isDayBlocked={day1 => datesList.some(day2 => isSameDay(day1, day2))}
                // autoFocus
                // displayFormat={"DD-MM-YYYY"}
            />
            <input type="submit" value="Submit" data-wait="Please wait..." class="w-button"/>
        </form>
      </div>

    );
  }
}

DateRangePickerWrapper.propTypes = propTypes;
DateRangePickerWrapper.defaultProps = defaultProps;

export default DateRangePickerWrapper;