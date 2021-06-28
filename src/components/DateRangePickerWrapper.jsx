  
import React from 'react';
import PropTypes from 'prop-types';
import momentPropTypes from 'react-moment-proptypes';
import moment from 'moment';
import omit from 'lodash/omit';
import Responsive from "react-responsive";
export const Mobile = props => <Responsive {...props} maxWidth={767} />;
export const Tablet = props => <Responsive {...props} minWidth={768} maxWidth={999} />;
export const Default = props => <Responsive {...props} minWidth={1000} />;
import DateRangePicker from './DateRangePicker';
import { DateRangePickerPhrases } from '../defaultPhrases';
import DateRangePickerShape from '../shapes/DateRangePickerShape';
import {
  START_DATE,
  END_DATE,
  VERTICAL_ORIENTATION,
  HORIZONTAL_ORIENTATION,
  ANCHOR_LEFT,
  ANCHOR_RIGHT,
  NAV_POSITION_TOP,
  OPEN_UP,
  OPEN_DOWN
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
      <>
      <Default>
        <div className="dp-container">
          <form id="react-date-picker" class="datepicker-style" method="post" action="https://hotels.cloudbeds.com/reservas/RGSKmP">
          <div className="content-wrapper">
            <input type="hidden" name="date_format" value="d/m/Y"/>
              <div className="picker-wrapper">
                <DateRangePicker
                  {...props}
                  onDatesChange={this.onDatesChange}
                  onFocusChange={this.onFocusChange}
                  focusedInput={focusedInput}
                  widget_date={widget_date}
                  widget_date_to={widget_date_to}
                  displayFormat={() => "DD/MM/YYYY"}
                  orientation={HORIZONTAL_ORIENTATION}
                  numberOfMonths= {2}
                  anchorDirection= {ANCHOR_RIGHT}
                />
              </div>
              <div className="button-wrapper w-inline-block w-lightbox">
                <button type="submit" className="watch-button button-sizing">  
                  <div className="button-label-2 button-text-size">BOOK ONLINE</div>
                </button> 
              </div>
            </div>   
          </form>
        </div>
      </Default>
      <Tablet>
        <div className="dp-container">
            <form id="react-date-picker" class="datepicker-style" method="post" action="https://hotels.cloudbeds.com/reservas/RGSKmP">
              <div className="content-wrapper-tablet">
                <input type="hidden" name="date_format" value="d/m/Y"/>
                <DateRangePicker
                    {...props}
                    onDatesChange={this.onDatesChange}
                    onFocusChange={this.onFocusChange}
                    focusedInput={focusedInput}
                    widget_date={widget_date}
                    widget_date_to={widget_date_to}
                    displayFormat={() => "DD/MM/YYYY"}
                    orientation={HORIZONTAL_ORIENTATION}
                    numberOfMonths= {1}
                    openDirection= {OPEN_UP}
                    anchorDirection= {ANCHOR_LEFT}

                />
                <div className="button-wrapper-tablet w-inline-block w-lightbox">
                  <button type="submit" className="watch-button button-sizing-tablet">  
                    <div className="button-label-2 button-text-size-">BOOK ONLINE</div>
                  </button> 
                </div>
              </div> 
            </form>
          </div>
      </Tablet>
      <Mobile>
        <div className="dp-container">
          <form id="react-date-picker" class="datepicker-style" method="post" action="https://hotels.cloudbeds.com/reservas/RGSKmP">
            <div className="content-wrapper-mobile">
              <input type="hidden" name="date_format" value="d/m/Y"/>
              <DateRangePicker
                  {...props}
                  onDatesChange={this.onDatesChange}
                  onFocusChange={this.onFocusChange}
                  focusedInput={focusedInput}
                  widget_date={widget_date}
                  widget_date_to={widget_date_to}
                  displayFormat={() => "DD/MM/YYYY"}
                  orientation={HORIZONTAL_ORIENTATION}
                  numberOfMonths= {1}
                  openDirection= {OPEN_UP}
                  anchorDirection= {ANCHOR_LEFT}

              />
              <div className="button-wrapper-mobile w-inline-block w-lightbox">
                <button type="submit" className="watch-button button-sizing-mobile">  
                  <div className="button-label-2 button-text-size-mobile">BOOK ONLINE</div>
                </button> 
              </div>
            </div> 
          </form>
        </div>
      </Mobile>
      </>

    );
  }
}

DateRangePickerWrapper.propTypes = propTypes;
DateRangePickerWrapper.defaultProps = defaultProps;

export default DateRangePickerWrapper;


// import {
//   START_DATE,
//   END_DATE,
//   VERTICAL_ORIENTATION,
//   HORIZONTAL_ORIENTATION,
//   ANCHOR_LEFT,
//   ANCHOR_RIGHT,
//   NAV_POSITION_TOP,
//   OPEN_UP,
//   OPEN_DOWN
// } from '../constants';


// import Responsive from "react-responsive";
// export const Mobile = props => <Responsive {...props} maxWidth={767} />;
// export const Default = props => <Responsive {...props} minWidth={768} />;

{/* <>
      <Default>
        <div className="dp-container">
          <form id="react-date-picker" class="datepicker-style" method="post" action="https://hotels.cloudbeds.com/reservas/RGSKmP">
              <input type="hidden" name="date_format" value="d/m/Y"/>
              <DateRangePicker
                  {...props}
                  onDatesChange={this.onDatesChange}
                  onFocusChange={this.onFocusChange}
                  focusedInput={focusedInput}
                  widget_date={widget_date}
                  widget_date_to={widget_date_to}
                  displayFormat={() => "DD/MM/YYYY"}
                  orientation={HORIZONTAL_ORIENTATION}
                  numberOfMonths= {2}
                  anchorDirection= {ANCHOR_RIGHT}

              />
                <input type="submit" value="Book Online" data-wait="Please wait..." class="button-black-hover stay-page w-button"/>
          </form>
        </div>
      </Default>
      <Mobile>
      <div className="dp-container">
          <form id="react-date-picker" class="datepicker-style" method="post" action="https://hotels.cloudbeds.com/reservas/RGSKmP">
              <input type="hidden" name="date_format" value="d/m/Y"/>
              <DateRangePicker
                  {...props}
                  onDatesChange={this.onDatesChange}
                  onFocusChange={this.onFocusChange}
                  focusedInput={focusedInput}
                  widget_date={widget_date}
                  widget_date_to={widget_date_to}
                  displayFormat={() => "DD/MM/YYYY"}
                  orientation={HORIZONTAL_ORIENTATION}
                  numberOfMonths= {1}
                  openDirection= {OPEN_UP}
                  anchorDirection= {ANCHOR_LEFT}

              />
                <input type="submit" value="Book Online" data-wait="Please wait..." class="button-black-hover stay-page w-button"/>
          </form>
        </div>
      </Mobile>
      </> */}