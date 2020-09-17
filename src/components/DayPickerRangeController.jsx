import React from 'react';
import PropTypes from 'prop-types';
import momentPropTypes from 'react-moment-proptypes';
import { forbidExtraProps, mutuallyExclusiveProps, nonNegativeInteger } from 'airbnb-prop-types';
import moment from 'moment';
import values from 'object.values';
import isTouchDevice from 'is-touch-device';

import { DayPickerPhrases } from '../defaultPhrases';
import getPhrasePropTypes from '../utils/getPhrasePropTypes';

import isInclusivelyAfterDay from '../utils/isInclusivelyAfterDay';
import isNextDay from '../utils/isNextDay';
import isSameDay from '../utils/isSameDay';
import isAfterDay from '../utils/isAfterDay';
import isBeforeDay from '../utils/isBeforeDay';
import isPreviousDay from '../utils/isPreviousDay';

import getVisibleDays from '../utils/getVisibleDays';
import isDayVisible from '../utils/isDayVisible';

import getSelectedDateOffset from '../utils/getSelectedDateOffset';

import toISODateString from '../utils/toISODateString';
import { addModifier, deleteModifier } from '../utils/modifiers';

import DisabledShape from '../shapes/DisabledShape';
import FocusedInputShape from '../shapes/FocusedInputShape';
import ScrollableOrientationShape from '../shapes/ScrollableOrientationShape';
import DayOfWeekShape from '../shapes/DayOfWeekShape';
import CalendarInfoPositionShape from '../shapes/CalendarInfoPositionShape';
import NavPositionShape from '../shapes/NavPositionShape';

import {
  START_DATE,
  END_DATE,
  HORIZONTAL_ORIENTATION,
  VERTICAL_SCROLLABLE,
  DAY_SIZE,
  INFO_POSITION_BOTTOM,
  NAV_POSITION_TOP,
} from '../constants';

import DayPicker from './DayPicker';
import getPooledMoment from '../utils/getPooledMoment';

const propTypes = forbidExtraProps({
  widget_date: momentPropTypes.momentObj,
  widget_date_to: momentPropTypes.momentObj,
  onDatesChange: PropTypes.func,
  widget_dateOffset: PropTypes.func,
  widget_date_toOffset: PropTypes.func,
  minDate: momentPropTypes.momentObj,
  maxDate: momentPropTypes.momentObj,

  focusedInput: FocusedInputShape,
  onFocusChange: PropTypes.func,
  onClose: PropTypes.func,

  keepOpenOnDateSelect: PropTypes.bool,
  minimumNights: PropTypes.number,
  disabled: DisabledShape,
  isOutsideRange: PropTypes.func,
  isDayBlocked: PropTypes.func,
  isDayHighlighted: PropTypes.func,
  getMinNightsForHoverDate: PropTypes.func,
  daysViolatingMinNightsCanBeClicked: PropTypes.bool,

  // DayPicker props
  renderMonthText: mutuallyExclusiveProps(PropTypes.func, 'renderMonthText', 'renderMonthElement'),
  renderMonthElement: mutuallyExclusiveProps(PropTypes.func, 'renderMonthText', 'renderMonthElement'),
  renderWeekHeaderElement: PropTypes.func,
  enableOutsideDays: PropTypes.bool,
  numberOfMonths: PropTypes.number,
  orientation: ScrollableOrientationShape,
  withPortal: PropTypes.bool,
  initialVisibleMonth: PropTypes.func,
  hideKeyboardShortcutsPanel: PropTypes.bool,
  daySize: nonNegativeInteger,
  noBorder: PropTypes.bool,
  verticalBorderSpacing: nonNegativeInteger,
  horizontalMonthPadding: nonNegativeInteger,

  dayPickerNavigationInlineStyles: PropTypes.object,
  navPosition: NavPositionShape,
  navPrev: PropTypes.node,
  navNext: PropTypes.node,
  renderNavPrevButton: PropTypes.func,
  renderNavNextButton: PropTypes.func,
  noNavButtons: PropTypes.bool,
  noNavNextButton: PropTypes.bool,
  noNavPrevButton: PropTypes.bool,

  onPrevMonthClick: PropTypes.func,
  onNextMonthClick: PropTypes.func,
  onOutsideClick: PropTypes.func,
  renderCalendarDay: PropTypes.func,
  renderDayContents: PropTypes.func,
  renderCalendarInfo: PropTypes.func,
  renderKeyboardShortcutsButton: PropTypes.func,
  renderKeyboardShortcutsPanel: PropTypes.func,
  calendarInfoPosition: CalendarInfoPositionShape,
  firstDayOfWeek: DayOfWeekShape,
  verticalHeight: nonNegativeInteger,
  transitionDuration: nonNegativeInteger,

  // accessibility
  onBlur: PropTypes.func,
  isFocused: PropTypes.bool,
  showKeyboardShortcuts: PropTypes.bool,
  onTab: PropTypes.func,
  onShiftTab: PropTypes.func,

  // i18n
  monthFormat: PropTypes.string,
  weekDayFormat: PropTypes.string,
  phrases: PropTypes.shape(getPhrasePropTypes(DayPickerPhrases)),
  dayAriaLabelFormat: PropTypes.string,

  isRTL: PropTypes.bool,
});

const defaultProps = {
  widget_date: undefined, // TODO: use null
  widget_date_to: undefined, // TODO: use null
  minDate: null,
  maxDate: null,
  onDatesChange() {},
  widget_dateOffset: undefined,
  widget_date_toOffset: undefined,

  focusedInput: null,
  onFocusChange() {},
  onClose() {},

  keepOpenOnDateSelect: false,
  minimumNights: 1,
  disabled: false,
  isOutsideRange() {},
  isDayBlocked() {},
  isDayHighlighted() {},
  getMinNightsForHoverDate() {},
  daysViolatingMinNightsCanBeClicked: false,

  // DayPicker props
  renderMonthText: null,
  renderWeekHeaderElement: null,
  enableOutsideDays: false,
  numberOfMonths: 1,
  orientation: HORIZONTAL_ORIENTATION,
  withPortal: false,
  hideKeyboardShortcutsPanel: false,
  initialVisibleMonth: null,
  daySize: DAY_SIZE,

  dayPickerNavigationInlineStyles: null,
  navPosition: NAV_POSITION_TOP,
  navPrev: null,
  navNext: null,
  renderNavPrevButton: null,
  renderNavNextButton: null,
  noNavButtons: false,
  noNavNextButton: false,
  noNavPrevButton: false,

  onPrevMonthClick() {},
  onNextMonthClick() {},
  onOutsideClick() {},

  renderCalendarDay: undefined,
  renderDayContents: null,
  renderCalendarInfo: null,
  renderMonthElement: null,
  renderKeyboardShortcutsButton: undefined,
  renderKeyboardShortcutsPanel: undefined,
  calendarInfoPosition: INFO_POSITION_BOTTOM,
  firstDayOfWeek: null,
  verticalHeight: null,
  noBorder: false,
  transitionDuration: undefined,
  verticalBorderSpacing: undefined,
  horizontalMonthPadding: 13,

  // accessibility
  onBlur() {},
  isFocused: false,
  showKeyboardShortcuts: false,
  onTab() {},
  onShiftTab() {},

  // i18n
  monthFormat: 'MMMM YYYY',
  weekDayFormat: 'dd',
  phrases: DayPickerPhrases,
  dayAriaLabelFormat: undefined,

  isRTL: false,
};

const getChooseAvailableDatePhrase = (phrases, focusedInput) => {
  if (focusedInput === START_DATE) {
    return phrases.chooseAvailablewidget_date;
  }
  if (focusedInput === END_DATE) {
    return phrases.chooseAvailablewidget_date_to;
  }
  return phrases.chooseAvailableDate;
};

export default class DayPickerRangeController extends React.PureComponent {
  constructor(props) {
    super(props);

    this.isTouchDevice = isTouchDevice();
    this.today = moment();
    this.modifiers = {
      today: (day) => this.isToday(day),
      blocked: (day) => this.isBlocked(day),
      'blocked-calendar': (day) => props.isDayBlocked(day),
      'blocked-out-of-range': (day) => props.isOutsideRange(day),
      'highlighted-calendar': (day) => props.isDayHighlighted(day),
      valid: (day) => !this.isBlocked(day),
      'selected-start': (day) => this.iswidget_date(day),
      'selected-end': (day) => this.iswidget_date_to(day),
      'blocked-minimum-nights': (day) => this.doesNotMeetMinimumNights(day),
      'selected-span': (day) => this.isInSelectedSpan(day),
      'last-in-range': (day) => this.isLastInRange(day),
      hovered: (day) => this.isHovered(day),
      'hovered-span': (day) => this.isInHoveredSpan(day),
      'hovered-offset': (day) => this.isInHoveredSpan(day),
      'after-hovered-start': (day) => this.isDayAfterHoveredwidget_date(day),
      'first-day-of-week': (day) => this.isFirstDayOfWeek(day),
      'last-day-of-week': (day) => this.isLastDayOfWeek(day),
      'hovered-start-first-possible-end': (day, hoverDate) => this.isFirstPossiblewidget_date_toForHoveredwidget_date(day, hoverDate),
      'hovered-start-blocked-minimum-nights': (day, hoverDate) => this.doesNotMeetMinNightsForHoveredwidget_date(day, hoverDate),
      'before-hovered-end': (day) => this.isDayBeforeHoveredwidget_date_to(day),
      'no-selected-start-before-selected-end': (day) => this.beforeSelectedEnd(day) && !props.widget_date,
      'selected-start-in-hovered-span': (day, hoverDate) => this.iswidget_date(day) && isAfterDay(hoverDate, day),
      'selected-start-no-selected-end': (day) => this.iswidget_date(day) && !props.widget_date_to,
      'selected-end-no-selected-start': (day) => this.iswidget_date_to(day) && !props.widget_date,
    };

    const { currentMonth, visibleDays } = this.getStateForNewMonth(props);

    // initialize phrases
    // set the appropriate CalendarDay phrase based on focusedInput
    const chooseAvailableDate = getChooseAvailableDatePhrase(props.phrases, props.focusedInput);

    this.state = {
      hoverDate: null,
      currentMonth,
      phrases: {
        ...props.phrases,
        chooseAvailableDate,
      },
      visibleDays,
      disablePrev: this.shouldDisableMonthNavigation(props.minDate, currentMonth),
      disableNext: this.shouldDisableMonthNavigation(props.maxDate, currentMonth),
    };

    this.onDayClick = this.onDayClick.bind(this);
    this.onDayMouseEnter = this.onDayMouseEnter.bind(this);
    this.onDayMouseLeave = this.onDayMouseLeave.bind(this);
    this.onPrevMonthClick = this.onPrevMonthClick.bind(this);
    this.onNextMonthClick = this.onNextMonthClick.bind(this);
    this.onMonthChange = this.onMonthChange.bind(this);
    this.onYearChange = this.onYearChange.bind(this);
    this.onGetNextScrollableMonths = this.onGetNextScrollableMonths.bind(this);
    this.onGetPrevScrollableMonths = this.onGetPrevScrollableMonths.bind(this);
    this.getFirstFocusableDay = this.getFirstFocusableDay.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const {
      widget_date,
      widget_date_to,
      focusedInput,
      getMinNightsForHoverDate,
      minimumNights,
      isOutsideRange,
      isDayBlocked,
      isDayHighlighted,
      phrases,
      initialVisibleMonth,
      numberOfMonths,
      enableOutsideDays,
    } = nextProps;

    const {
      widget_date: prevwidget_date,
      widget_date_to: prevwidget_date_to,
      focusedInput: prevFocusedInput,
      minimumNights: prevMinimumNights,
      isOutsideRange: prevIsOutsideRange,
      isDayBlocked: prevIsDayBlocked,
      isDayHighlighted: prevIsDayHighlighted,
      phrases: prevPhrases,
      initialVisibleMonth: prevInitialVisibleMonth,
      numberOfMonths: prevNumberOfMonths,
      enableOutsideDays: prevEnableOutsideDays,
    } = this.props;

    const { hoverDate } = this.state;
    let { visibleDays } = this.state;

    let recomputeOutsideRange = false;
    let recomputeDayBlocked = false;
    let recomputeDayHighlighted = false;

    if (isOutsideRange !== prevIsOutsideRange) {
      this.modifiers['blocked-out-of-range'] = (day) => isOutsideRange(day);
      recomputeOutsideRange = true;
    }

    if (isDayBlocked !== prevIsDayBlocked) {
      this.modifiers['blocked-calendar'] = (day) => isDayBlocked(day);
      recomputeDayBlocked = true;
    }

    if (isDayHighlighted !== prevIsDayHighlighted) {
      this.modifiers['highlighted-calendar'] = (day) => isDayHighlighted(day);
      recomputeDayHighlighted = true;
    }

    const recomputePropModifiers = (
      recomputeOutsideRange || recomputeDayBlocked || recomputeDayHighlighted
    );

    const didwidget_dateChange = widget_date !== prevwidget_date;
    const didwidget_date_toChange = widget_date_to !== prevwidget_date_to;
    const didFocusChange = focusedInput !== prevFocusedInput;

    if (
      numberOfMonths !== prevNumberOfMonths
      || enableOutsideDays !== prevEnableOutsideDays
      || (
        initialVisibleMonth !== prevInitialVisibleMonth
        && !prevFocusedInput
        && didFocusChange
      )
    ) {
      const newMonthState = this.getStateForNewMonth(nextProps);
      const { currentMonth } = newMonthState;
      ({ visibleDays } = newMonthState);
      this.setState({
        currentMonth,
        visibleDays,
      });
    }

    let modifiers = {};

    if (didwidget_dateChange) {
      modifiers = this.deleteModifier(modifiers, prevwidget_date, 'selected-start');
      modifiers = this.addModifier(modifiers, widget_date, 'selected-start');

      if (prevwidget_date) {
        const startSpan = prevwidget_date.clone().add(1, 'day');
        const endSpan = prevwidget_date.clone().add(prevMinimumNights + 1, 'days');
        modifiers = this.deleteModifierFromRange(modifiers, startSpan, endSpan, 'after-hovered-start');

        if (!widget_date_to || !prevwidget_date_to) {
          modifiers = this.deleteModifier(modifiers, prevwidget_date, 'selected-start-no-selected-end');
        }
      }

      if (!prevwidget_date && widget_date_to && widget_date) {
        modifiers = this.deleteModifier(modifiers, widget_date_to, 'selected-end-no-selected-start');
        modifiers = this.deleteModifier(modifiers, widget_date_to, 'selected-end-in-hovered-span');

        values(visibleDays).forEach((days) => {
          Object.keys(days).forEach((day) => {
            const momentObj = moment(day);
            modifiers = this.deleteModifier(modifiers, momentObj, 'no-selected-start-before-selected-end');
          });
        });
      }
    }

    if (didwidget_date_toChange) {
      modifiers = this.deleteModifier(modifiers, prevwidget_date_to, 'selected-end');
      modifiers = this.addModifier(modifiers, widget_date_to, 'selected-end');

      if (prevwidget_date_to && (!widget_date || !prevwidget_date)) {
        modifiers = this.deleteModifier(modifiers, prevwidget_date_to, 'selected-end-no-selected-start');
      }
    }

    if (didwidget_dateChange || didwidget_date_toChange) {
      if (prevwidget_date && prevwidget_date_to) {
        modifiers = this.deleteModifierFromRange(
          modifiers,
          prevwidget_date,
          prevwidget_date_to.clone().add(1, 'day'),
          'selected-span',
        );
      }

      if (widget_date && widget_date_to) {
        modifiers = this.deleteModifierFromRange(
          modifiers,
          widget_date,
          widget_date_to.clone().add(1, 'day'),
          'hovered-span',
        );

        modifiers = this.addModifierToRange(
          modifiers,
          widget_date.clone().add(1, 'day'),
          widget_date_to,
          'selected-span',
        );
      }

      if (widget_date && !widget_date_to) {
        modifiers = this.addModifier(modifiers, widget_date, 'selected-start-no-selected-end');
      }

      if (widget_date_to && !widget_date) {
        modifiers = this.addModifier(modifiers, widget_date_to, 'selected-end-no-selected-start');
      }

      if (!widget_date && widget_date_to) {
        values(visibleDays).forEach((days) => {
          Object.keys(days).forEach((day) => {
            const momentObj = moment(day);

            if (isBeforeDay(momentObj, widget_date_to)) {
              modifiers = this.addModifier(modifiers, momentObj, 'no-selected-start-before-selected-end');
            }
          });
        });
      }
    }

    if (!this.isTouchDevice && didwidget_dateChange && widget_date && !widget_date_to) {
      const startSpan = widget_date.clone().add(1, 'day');
      const endSpan = widget_date.clone().add(minimumNights + 1, 'days');
      modifiers = this.addModifierToRange(modifiers, startSpan, endSpan, 'after-hovered-start');
    }

    if (!this.isTouchDevice && didwidget_date_toChange && !widget_date && widget_date_to) {
      const startSpan = widget_date_to.clone().subtract(minimumNights, 'days');
      const endSpan = widget_date_to.clone();
      modifiers = this.addModifierToRange(modifiers, startSpan, endSpan, 'before-hovered-end');
    }

    if (prevMinimumNights > 0) {
      if (didFocusChange || didwidget_dateChange || minimumNights !== prevMinimumNights) {
        const startSpan = prevwidget_date || this.today;
        modifiers = this.deleteModifierFromRange(
          modifiers,
          startSpan,
          startSpan.clone().add(prevMinimumNights, 'days'),
          'blocked-minimum-nights',
        );

        modifiers = this.deleteModifierFromRange(
          modifiers,
          startSpan,
          startSpan.clone().add(prevMinimumNights, 'days'),
          'blocked',
        );
      }
    }

    if (didFocusChange || recomputePropModifiers) {
      values(visibleDays).forEach((days) => {
        Object.keys(days).forEach((day) => {
          const momentObj = getPooledMoment(day);
          let isBlocked = false;

          if (didFocusChange || recomputeOutsideRange) {
            if (isOutsideRange(momentObj)) {
              modifiers = this.addModifier(modifiers, momentObj, 'blocked-out-of-range');
              isBlocked = true;
            } else {
              modifiers = this.deleteModifier(modifiers, momentObj, 'blocked-out-of-range');
            }
          }

          if (didFocusChange || recomputeDayBlocked) {
            if (isDayBlocked(momentObj)) {
              modifiers = this.addModifier(modifiers, momentObj, 'blocked-calendar');
              isBlocked = true;
            } else {
              modifiers = this.deleteModifier(modifiers, momentObj, 'blocked-calendar');
            }
          }

          if (isBlocked) {
            modifiers = this.addModifier(modifiers, momentObj, 'blocked');
          } else {
            modifiers = this.deleteModifier(modifiers, momentObj, 'blocked');
          }

          if (didFocusChange || recomputeDayHighlighted) {
            if (isDayHighlighted(momentObj)) {
              modifiers = this.addModifier(modifiers, momentObj, 'highlighted-calendar');
            } else {
              modifiers = this.deleteModifier(modifiers, momentObj, 'highlighted-calendar');
            }
          }
        });
      });
    }

    if (!this.isTouchDevice && didFocusChange && hoverDate && !this.isBlocked(hoverDate)) {
      const minNightsForHoverDate = getMinNightsForHoverDate(hoverDate);
      if (minNightsForHoverDate > 0 && focusedInput === END_DATE) {
        modifiers = this.deleteModifierFromRange(
          modifiers,
          hoverDate.clone().add(1, 'days'),
          hoverDate.clone().add(minNightsForHoverDate, 'days'),
          'hovered-start-blocked-minimum-nights',
        );

        modifiers = this.deleteModifier(
          modifiers,
          hoverDate.clone().add(minNightsForHoverDate, 'days'),
          'hovered-start-first-possible-end',
        );
      }

      if (minNightsForHoverDate > 0 && focusedInput === START_DATE) {
        modifiers = this.addModifierToRange(
          modifiers,
          hoverDate.clone().add(1, 'days'),
          hoverDate.clone().add(minNightsForHoverDate, 'days'),
          'hovered-start-blocked-minimum-nights',
        );

        modifiers = this.addModifier(
          modifiers,
          hoverDate.clone().add(minNightsForHoverDate, 'days'),
          'hovered-start-first-possible-end',
        );
      }
    }

    if (minimumNights > 0 && widget_date && focusedInput === END_DATE) {
      modifiers = this.addModifierToRange(
        modifiers,
        widget_date,
        widget_date.clone().add(minimumNights, 'days'),
        'blocked-minimum-nights',
      );

      modifiers = this.addModifierToRange(
        modifiers,
        widget_date,
        widget_date.clone().add(minimumNights, 'days'),
        'blocked',
      );
    }

    const today = moment();
    if (!isSameDay(this.today, today)) {
      modifiers = this.deleteModifier(modifiers, this.today, 'today');
      modifiers = this.addModifier(modifiers, today, 'today');
      this.today = today;
    }

    if (Object.keys(modifiers).length > 0) {
      this.setState({
        visibleDays: {
          ...visibleDays,
          ...modifiers,
        },
      });
    }

    if (didFocusChange || phrases !== prevPhrases) {
      // set the appropriate CalendarDay phrase based on focusedInput
      const chooseAvailableDate = getChooseAvailableDatePhrase(phrases, focusedInput);

      this.setState({
        phrases: {
          ...phrases,
          chooseAvailableDate,
        },
      });
    }
  }

  onDayClick(day, e) {
    const {
      keepOpenOnDateSelect,
      minimumNights,
      onBlur,
      focusedInput,
      onFocusChange,
      onClose,
      onDatesChange,
      widget_dateOffset,
      widget_date_toOffset,
      disabled,
      daysViolatingMinNightsCanBeClicked,
    } = this.props;

    if (e) e.preventDefault();
    if (this.isBlocked(day, !daysViolatingMinNightsCanBeClicked)) return;

    let { widget_date, widget_date_to } = this.props;

    if (widget_dateOffset || widget_date_toOffset) {
      widget_date = getSelectedDateOffset(widget_dateOffset, day);
      widget_date_to = getSelectedDateOffset(widget_date_toOffset, day);

      if (this.isBlocked(widget_date) || this.isBlocked(widget_date_to)) {
        return;
      }

      onDatesChange({ widget_date, widget_date_to });

      if (!keepOpenOnDateSelect) {
        onFocusChange(null);
        onClose({ widget_date, widget_date_to });
      }
    } else if (focusedInput === START_DATE) {
      const lastAllowedwidget_date = widget_date_to && widget_date_to.clone().subtract(minimumNights, 'days');
      const iswidget_dateAfterwidget_date_to = isBeforeDay(lastAllowedwidget_date, day)
        || isAfterDay(widget_date, widget_date_to);
      const iswidget_date_toDisabled = disabled === END_DATE;

      if (!iswidget_date_toDisabled || !iswidget_dateAfterwidget_date_to) {
        widget_date = day;
        if (iswidget_dateAfterwidget_date_to) {
          widget_date_to = null;
        }
      }

      onDatesChange({ widget_date, widget_date_to });

      if (iswidget_date_toDisabled && !iswidget_dateAfterwidget_date_to) {
        onFocusChange(null);
        onClose({ widget_date, widget_date_to });
      } else if (!iswidget_date_toDisabled) {
        onFocusChange(END_DATE);
      }
    } else if (focusedInput === END_DATE) {
      const firstAllowedwidget_date_to = widget_date && widget_date.clone().add(minimumNights, 'days');

      if (!widget_date) {
        widget_date_to = day;
        onDatesChange({ widget_date, widget_date_to });
        onFocusChange(START_DATE);
      } else if (isInclusivelyAfterDay(day, firstAllowedwidget_date_to)) {
        widget_date_to = day;
        onDatesChange({ widget_date, widget_date_to });
        if (!keepOpenOnDateSelect) {
          onFocusChange(null);
          onClose({ widget_date, widget_date_to });
        }
      } else if (
        daysViolatingMinNightsCanBeClicked
        && this.doesNotMeetMinimumNights(day)
      ) {
        widget_date_to = day;
        onDatesChange({ widget_date, widget_date_to });
      } else if (disabled !== START_DATE) {
        widget_date = day;
        widget_date_to = null;
        onDatesChange({ widget_date, widget_date_to });
      } else {
        onDatesChange({ widget_date, widget_date_to });
      }
    } else {
      onDatesChange({ widget_date, widget_date_to });
    }

    onBlur();
  }

  onDayMouseEnter(day) {
    /* eslint react/destructuring-assignment: 1 */
    if (this.isTouchDevice) return;
    const {
      widget_date,
      widget_date_to,
      focusedInput,
      getMinNightsForHoverDate,
      minimumNights,
      widget_dateOffset,
      widget_date_toOffset,
    } = this.props;

    const {
      hoverDate,
      visibleDays,
      dateOffset,
    } = this.state;

    let nextDateOffset = null;

    if (focusedInput) {
      const hasOffset = widget_dateOffset || widget_date_toOffset;
      let modifiers = {};

      if (hasOffset) {
        const start = getSelectedDateOffset(widget_dateOffset, day);
        const end = getSelectedDateOffset(widget_date_toOffset, day, (rangeDay) => rangeDay.add(1, 'day'));

        nextDateOffset = {
          start,
          end,
        };

        // eslint-disable-next-line react/destructuring-assignment
        if (dateOffset && dateOffset.start && dateOffset.end) {
          modifiers = this.deleteModifierFromRange(modifiers, dateOffset.start, dateOffset.end, 'hovered-offset');
        }
        modifiers = this.addModifierToRange(modifiers, start, end, 'hovered-offset');
      }

      if (!hasOffset) {
        modifiers = this.deleteModifier(modifiers, hoverDate, 'hovered');
        modifiers = this.addModifier(modifiers, day, 'hovered');

        if (widget_date && !widget_date_to && focusedInput === END_DATE) {
          if (isAfterDay(hoverDate, widget_date)) {
            const endSpan = hoverDate.clone().add(1, 'day');
            modifiers = this.deleteModifierFromRange(modifiers, widget_date, endSpan, 'hovered-span');
          }

          if (isBeforeDay(day, widget_date) || isSameDay(day, widget_date)) {
            modifiers = this.deleteModifier(modifiers, widget_date, 'selected-start-in-hovered-span');
          }

          if (!this.isBlocked(day) && isAfterDay(day, widget_date)) {
            const endSpan = day.clone().add(1, 'day');
            modifiers = this.addModifierToRange(modifiers, widget_date, endSpan, 'hovered-span');
            modifiers = this.addModifier(modifiers, widget_date, 'selected-start-in-hovered-span');
          }
        }

        if (!widget_date && widget_date_to && focusedInput === START_DATE) {
          if (isBeforeDay(hoverDate, widget_date_to)) {
            modifiers = this.deleteModifierFromRange(modifiers, hoverDate, widget_date_to, 'hovered-span');
          }

          if (isAfterDay(day, widget_date_to) || isSameDay(day, widget_date_to)) {
            modifiers = this.deleteModifier(modifiers, widget_date_to, 'selected-end-in-hovered-span');
          }

          if (!this.isBlocked(day) && isBeforeDay(day, widget_date_to)) {
            modifiers = this.addModifierToRange(modifiers, day, widget_date_to, 'hovered-span');
            modifiers = this.addModifier(modifiers, widget_date_to, 'selected-end-in-hovered-span');
          }
        }

        if (widget_date) {
          const startSpan = widget_date.clone().add(1, 'day');
          const endSpan = widget_date.clone().add(minimumNights + 1, 'days');
          modifiers = this.deleteModifierFromRange(modifiers, startSpan, endSpan, 'after-hovered-start');

          if (isSameDay(day, widget_date)) {
            const newStartSpan = widget_date.clone().add(1, 'day');
            const newEndSpan = widget_date.clone().add(minimumNights + 1, 'days');
            modifiers = this.addModifierToRange(
              modifiers,
              newStartSpan,
              newEndSpan,
              'after-hovered-start',
            );
          }
        }

        if (widget_date_to) {
          const startSpan = widget_date_to.clone().subtract(minimumNights, 'days');
          modifiers = this.deleteModifierFromRange(modifiers, startSpan, widget_date_to, 'before-hovered-end');

          if (isSameDay(day, widget_date_to)) {
            const newStartSpan = widget_date_to.clone().subtract(minimumNights, 'days');
            modifiers = this.addModifierToRange(
              modifiers,
              newStartSpan,
              widget_date_to,
              'before-hovered-end',
            );
          }
        }

        if (hoverDate && !this.isBlocked(hoverDate)) {
          const minNightsForPrevHoverDate = getMinNightsForHoverDate(hoverDate);
          if (minNightsForPrevHoverDate > 0 && focusedInput === START_DATE) {
            modifiers = this.deleteModifierFromRange(
              modifiers,
              hoverDate.clone().add(1, 'days'),
              hoverDate.clone().add(minNightsForPrevHoverDate, 'days'),
              'hovered-start-blocked-minimum-nights',
            );

            modifiers = this.deleteModifier(
              modifiers,
              hoverDate.clone().add(minNightsForPrevHoverDate, 'days'),
              'hovered-start-first-possible-end',
            );
          }
        }

        if (!this.isBlocked(day)) {
          const minNightsForHoverDate = getMinNightsForHoverDate(day);
          if (minNightsForHoverDate > 0 && focusedInput === START_DATE) {
            modifiers = this.addModifierToRange(
              modifiers,
              day.clone().add(1, 'days'),
              day.clone().add(minNightsForHoverDate, 'days'),
              'hovered-start-blocked-minimum-nights',
            );

            modifiers = this.addModifier(
              modifiers,
              day.clone().add(minNightsForHoverDate, 'days'),
              'hovered-start-first-possible-end',
            );
          }
        }
      }

      this.setState({
        hoverDate: day,
        dateOffset: nextDateOffset,
        visibleDays: {
          ...visibleDays,
          ...modifiers,
        },
      });
    }
  }

  onDayMouseLeave(day) {
    const {
      widget_date,
      widget_date_to,
      focusedInput,
      getMinNightsForHoverDate,
      minimumNights,
    } = this.props;
    const { hoverDate, visibleDays, dateOffset } = this.state;

    if (this.isTouchDevice || !hoverDate) return;

    let modifiers = {};
    modifiers = this.deleteModifier(modifiers, hoverDate, 'hovered');

    if (dateOffset) {
      modifiers = this.deleteModifierFromRange(modifiers, dateOffset.start, dateOffset.end, 'hovered-offset');
    }

    if (widget_date && !widget_date_to) {
      if (isAfterDay(hoverDate, widget_date)) {
        const endSpan = hoverDate.clone().add(1, 'day');
        modifiers = this.deleteModifierFromRange(modifiers, widget_date, endSpan, 'hovered-span');
      }

      if (isAfterDay(day, widget_date)) {
        modifiers = this.deleteModifier(modifiers, widget_date, 'selected-start-in-hovered-span');
      }
    }

    if (!widget_date && widget_date_to) {
      if (isAfterDay(widget_date_to, hoverDate)) {
        modifiers = this.deleteModifierFromRange(modifiers, hoverDate, widget_date_to, 'hovered-span');
      }

      if (isBeforeDay(day, widget_date_to)) {
        modifiers = this.deleteModifier(modifiers, widget_date_to, 'selected-end-in-hovered-span');
      }
    }

    if (widget_date && isSameDay(day, widget_date)) {
      const startSpan = widget_date.clone().add(1, 'day');
      const endSpan = widget_date.clone().add(minimumNights + 1, 'days');
      modifiers = this.deleteModifierFromRange(modifiers, startSpan, endSpan, 'after-hovered-start');
    }

    if (widget_date_to && isSameDay(day, widget_date_to)) {
      const startSpan = widget_date_to.clone().subtract(minimumNights, 'days');
      modifiers = this.deleteModifierFromRange(modifiers, startSpan, widget_date_to, 'before-hovered-end');
    }

    if (!this.isBlocked(hoverDate)) {
      const minNightsForHoverDate = getMinNightsForHoverDate(hoverDate);
      if (minNightsForHoverDate > 0 && focusedInput === START_DATE) {
        modifiers = this.deleteModifierFromRange(
          modifiers,
          hoverDate.clone().add(1, 'days'),
          hoverDate.clone().add(minNightsForHoverDate, 'days'),
          'hovered-start-blocked-minimum-nights',
        );

        modifiers = this.deleteModifier(
          modifiers,
          hoverDate.clone().add(minNightsForHoverDate, 'days'),
          'hovered-start-first-possible-end',
        );
      }
    }

    this.setState({
      hoverDate: null,
      visibleDays: {
        ...visibleDays,
        ...modifiers,
      },
    });
  }

  onPrevMonthClick() {
    const {
      enableOutsideDays,
      maxDate,
      minDate,
      numberOfMonths,
      onPrevMonthClick,
    } = this.props;
    const { currentMonth, visibleDays } = this.state;

    const newVisibleDays = {};
    Object.keys(visibleDays).sort().slice(0, numberOfMonths + 1).forEach((month) => {
      newVisibleDays[month] = visibleDays[month];
    });

    const prevMonth = currentMonth.clone().subtract(2, 'months');
    const prevMonthVisibleDays = getVisibleDays(prevMonth, 1, enableOutsideDays, true);

    const newCurrentMonth = currentMonth.clone().subtract(1, 'month');
    this.setState({
      currentMonth: newCurrentMonth,
      disablePrev: this.shouldDisableMonthNavigation(minDate, newCurrentMonth),
      disableNext: this.shouldDisableMonthNavigation(maxDate, newCurrentMonth),
      visibleDays: {
        ...newVisibleDays,
        ...this.getModifiers(prevMonthVisibleDays),
      },
    }, () => {
      onPrevMonthClick(newCurrentMonth.clone());
    });
  }

  onNextMonthClick() {
    const {
      enableOutsideDays,
      maxDate,
      minDate,
      numberOfMonths,
      onNextMonthClick,
    } = this.props;
    const { currentMonth, visibleDays } = this.state;

    const newVisibleDays = {};
    Object.keys(visibleDays).sort().slice(1).forEach((month) => {
      newVisibleDays[month] = visibleDays[month];
    });

    const nextMonth = currentMonth.clone().add(numberOfMonths + 1, 'month');
    const nextMonthVisibleDays = getVisibleDays(nextMonth, 1, enableOutsideDays, true);
    const newCurrentMonth = currentMonth.clone().add(1, 'month');
    this.setState({
      currentMonth: newCurrentMonth,
      disablePrev: this.shouldDisableMonthNavigation(minDate, newCurrentMonth),
      disableNext: this.shouldDisableMonthNavigation(maxDate, newCurrentMonth),
      visibleDays: {
        ...newVisibleDays,
        ...this.getModifiers(nextMonthVisibleDays),
      },
    }, () => {
      onNextMonthClick(newCurrentMonth.clone());
    });
  }

  onMonthChange(newMonth) {
    const { numberOfMonths, enableOutsideDays, orientation } = this.props;
    const withoutTransitionMonths = orientation === VERTICAL_SCROLLABLE;
    const newVisibleDays = getVisibleDays(
      newMonth,
      numberOfMonths,
      enableOutsideDays,
      withoutTransitionMonths,
    );

    this.setState({
      currentMonth: newMonth.clone(),
      visibleDays: this.getModifiers(newVisibleDays),
    });
  }

  onYearChange(newMonth) {
    const { numberOfMonths, enableOutsideDays, orientation } = this.props;
    const withoutTransitionMonths = orientation === VERTICAL_SCROLLABLE;
    const newVisibleDays = getVisibleDays(
      newMonth,
      numberOfMonths,
      enableOutsideDays,
      withoutTransitionMonths,
    );

    this.setState({
      currentMonth: newMonth.clone(),
      visibleDays: this.getModifiers(newVisibleDays),
    });
  }

  onGetNextScrollableMonths() {
    const { numberOfMonths, enableOutsideDays } = this.props;
    const { currentMonth, visibleDays } = this.state;

    const numberOfVisibleMonths = Object.keys(visibleDays).length;
    const nextMonth = currentMonth.clone().add(numberOfVisibleMonths, 'month');
    const newVisibleDays = getVisibleDays(nextMonth, numberOfMonths, enableOutsideDays, true);

    this.setState({
      visibleDays: {
        ...visibleDays,
        ...this.getModifiers(newVisibleDays),
      },
    });
  }

  onGetPrevScrollableMonths() {
    const { numberOfMonths, enableOutsideDays } = this.props;
    const { currentMonth, visibleDays } = this.state;

    const firstPreviousMonth = currentMonth.clone().subtract(numberOfMonths, 'month');
    const newVisibleDays = getVisibleDays(
      firstPreviousMonth, numberOfMonths, enableOutsideDays, true,
    );

    this.setState({
      currentMonth: firstPreviousMonth.clone(),
      visibleDays: {
        ...visibleDays,
        ...this.getModifiers(newVisibleDays),
      },
    });
  }

  getFirstFocusableDay(newMonth) {
    const {
      widget_date,
      widget_date_to,
      focusedInput,
      minimumNights,
      numberOfMonths,
    } = this.props;

    let focusedDate = newMonth.clone().startOf('month');
    if (focusedInput === START_DATE && widget_date) {
      focusedDate = widget_date.clone();
    } else if (focusedInput === END_DATE && !widget_date_to && widget_date) {
      focusedDate = widget_date.clone().add(minimumNights, 'days');
    } else if (focusedInput === END_DATE && widget_date_to) {
      focusedDate = widget_date_to.clone();
    }

    if (this.isBlocked(focusedDate)) {
      const days = [];
      const lastVisibleDay = newMonth.clone().add(numberOfMonths - 1, 'months').endOf('month');
      let currentDay = focusedDate.clone();
      while (!isAfterDay(currentDay, lastVisibleDay)) {
        currentDay = currentDay.clone().add(1, 'day');
        days.push(currentDay);
      }

      const viableDays = days.filter((day) => !this.isBlocked(day));

      if (viableDays.length > 0) {
        ([focusedDate] = viableDays);
      }
    }

    return focusedDate;
  }

  getModifiers(visibleDays) {
    const modifiers = {};
    Object.keys(visibleDays).forEach((month) => {
      modifiers[month] = {};
      visibleDays[month].forEach((day) => {
        modifiers[month][toISODateString(day)] = this.getModifiersForDay(day);
      });
    });

    return modifiers;
  }

  getModifiersForDay(day) {
    return new Set(Object.keys(this.modifiers).filter((modifier) => this.modifiers[modifier](day)));
  }

  getStateForNewMonth(nextProps) {
    const {
      initialVisibleMonth,
      numberOfMonths,
      enableOutsideDays,
      orientation,
      widget_date,
    } = nextProps;
    const initialVisibleMonthThunk = initialVisibleMonth || (
      widget_date ? () => widget_date : () => this.today
    );
    const currentMonth = initialVisibleMonthThunk();
    const withoutTransitionMonths = orientation === VERTICAL_SCROLLABLE;
    const visibleDays = this.getModifiers(getVisibleDays(
      currentMonth,
      numberOfMonths,
      enableOutsideDays,
      withoutTransitionMonths,
    ));
    return { currentMonth, visibleDays };
  }

  shouldDisableMonthNavigation(date, visibleMonth) {
    if (!date) return false;

    const {
      numberOfMonths,
      enableOutsideDays,
    } = this.props;

    return isDayVisible(date, visibleMonth, numberOfMonths, enableOutsideDays);
  }

  addModifier(updatedDays, day, modifier) {
    return addModifier(updatedDays, day, modifier, this.props, this.state);
  }

  addModifierToRange(updatedDays, start, end, modifier) {
    let days = updatedDays;

    let spanStart = start.clone();
    while (isBeforeDay(spanStart, end)) {
      days = this.addModifier(days, spanStart, modifier);
      spanStart = spanStart.clone().add(1, 'day');
    }

    return days;
  }

  deleteModifier(updatedDays, day, modifier) {
    return deleteModifier(updatedDays, day, modifier, this.props, this.state);
  }

  deleteModifierFromRange(updatedDays, start, end, modifier) {
    let days = updatedDays;

    let spanStart = start.clone();
    while (isBeforeDay(spanStart, end)) {
      days = this.deleteModifier(days, spanStart, modifier);
      spanStart = spanStart.clone().add(1, 'day');
    }

    return days;
  }

  doesNotMeetMinimumNights(day) {
    const {
      widget_date,
      isOutsideRange,
      focusedInput,
      minimumNights,
    } = this.props;
    if (focusedInput !== END_DATE) return false;

    if (widget_date) {
      const dayDiff = day.diff(widget_date.clone().startOf('day').hour(12), 'days');
      return dayDiff < minimumNights && dayDiff >= 0;
    }
    return isOutsideRange(moment(day).subtract(minimumNights, 'days'));
  }

  doesNotMeetMinNightsForHoveredwidget_date(day, hoverDate) {
    const {
      focusedInput,
      getMinNightsForHoverDate,
    } = this.props;
    if (focusedInput !== END_DATE) return false;

    if (hoverDate && !this.isBlocked(hoverDate)) {
      const minNights = getMinNightsForHoverDate(hoverDate);
      const dayDiff = day.diff(hoverDate.clone().startOf('day').hour(12), 'days');
      return dayDiff < minNights && dayDiff >= 0;
    }
    return false;
  }

  isDayAfterHoveredwidget_date(day) {
    const { widget_date, widget_date_to, minimumNights } = this.props;
    const { hoverDate } = this.state || {};
    return !!widget_date
      && !widget_date_to
      && !this.isBlocked(day)
      && isNextDay(hoverDate, day)
      && minimumNights > 0
      && isSameDay(hoverDate, widget_date);
  }

  iswidget_date_to(day) {
    const { widget_date_to } = this.props;
    return isSameDay(day, widget_date_to);
  }

  isHovered(day) {
    const { hoverDate } = this.state || {};
    const { focusedInput } = this.props;
    return !!focusedInput && isSameDay(day, hoverDate);
  }

  isInHoveredSpan(day) {
    const { widget_date, widget_date_to } = this.props;
    const { hoverDate } = this.state || {};

    const isForwardRange = !!widget_date && !widget_date_to && (
      day.isBetween(widget_date, hoverDate) || isSameDay(hoverDate, day)
    );
    const isBackwardRange = !!widget_date_to && !widget_date && (
      day.isBetween(hoverDate, widget_date_to) || isSameDay(hoverDate, day)
    );

    const isValidDayHovered = hoverDate && !this.isBlocked(hoverDate);

    return (isForwardRange || isBackwardRange) && isValidDayHovered;
  }

  isInSelectedSpan(day) {
    const { widget_date, widget_date_to } = this.props;
    return day.isBetween(widget_date, widget_date_to, 'days');
  }

  isLastInRange(day) {
    const { widget_date_to } = this.props;
    return this.isInSelectedSpan(day) && isNextDay(day, widget_date_to);
  }

  iswidget_date(day) {
    const { widget_date } = this.props;
    return isSameDay(day, widget_date);
  }

  isBlocked(day, blockDaysViolatingMinNights = true) {
    const { isDayBlocked, isOutsideRange } = this.props;
    return isDayBlocked(day)
      || isOutsideRange(day)
      || (blockDaysViolatingMinNights && this.doesNotMeetMinimumNights(day));
  }

  isToday(day) {
    return isSameDay(day, this.today);
  }

  isFirstDayOfWeek(day) {
    const { firstDayOfWeek } = this.props;
    return day.day() === (firstDayOfWeek || moment.localeData().firstDayOfWeek());
  }

  isLastDayOfWeek(day) {
    const { firstDayOfWeek } = this.props;
    return day.day() === ((firstDayOfWeek || moment.localeData().firstDayOfWeek()) + 6) % 7;
  }

  isFirstPossiblewidget_date_toForHoveredwidget_date(day, hoverDate) {
    const { focusedInput, getMinNightsForHoverDate } = this.props;
    if (focusedInput !== END_DATE || !hoverDate || this.isBlocked(hoverDate)) return false;
    const minNights = getMinNightsForHoverDate(hoverDate);
    const firstAvailablewidget_date_to = hoverDate.clone().add(minNights, 'days');
    return isSameDay(day, firstAvailablewidget_date_to);
  }

  beforeSelectedEnd(day) {
    const { widget_date_to } = this.props;
    return isBeforeDay(day, widget_date_to);
  }

  isDayBeforeHoveredwidget_date_to(day) {
    const { widget_date, widget_date_to, minimumNights } = this.props;
    const { hoverDate } = this.state || {};

    return !!widget_date_to
      && !widget_date
      && !this.isBlocked(day)
      && isPreviousDay(hoverDate, day)
      && minimumNights > 0
      && isSameDay(hoverDate, widget_date_to);
  }

  render() {
    const {
      numberOfMonths,
      orientation,
      monthFormat,
      renderMonthText,
      renderWeekHeaderElement,
      dayPickerNavigationInlineStyles,
      navPosition,
      navPrev,
      navNext,
      renderNavPrevButton,
      renderNavNextButton,
      noNavButtons,
      noNavNextButton,
      noNavPrevButton,
      onOutsideClick,
      withPortal,
      enableOutsideDays,
      firstDayOfWeek,
      renderKeyboardShortcutsButton,
      renderKeyboardShortcutsPanel,
      hideKeyboardShortcutsPanel,
      daySize,
      focusedInput,
      renderCalendarDay,
      renderDayContents,
      renderCalendarInfo,
      renderMonthElement,
      calendarInfoPosition,
      onBlur,
      onShiftTab,
      onTab,
      isFocused,
      showKeyboardShortcuts,
      isRTL,
      weekDayFormat,
      dayAriaLabelFormat,
      verticalHeight,
      noBorder,
      transitionDuration,
      verticalBorderSpacing,
      horizontalMonthPadding,
    } = this.props;

    const {
      currentMonth,
      phrases,
      visibleDays,
      disablePrev,
      disableNext,
    } = this.state;

    return (
      <DayPicker
        orientation={orientation}
        enableOutsideDays={enableOutsideDays}
        modifiers={visibleDays}
        numberOfMonths={numberOfMonths}
        onDayClick={this.onDayClick}
        onDayMouseEnter={this.onDayMouseEnter}
        onDayMouseLeave={this.onDayMouseLeave}
        onPrevMonthClick={this.onPrevMonthClick}
        onNextMonthClick={this.onNextMonthClick}
        onMonthChange={this.onMonthChange}
        onTab={onTab}
        onShiftTab={onShiftTab}
        onYearChange={this.onYearChange}
        onGetNextScrollableMonths={this.onGetNextScrollableMonths}
        onGetPrevScrollableMonths={this.onGetPrevScrollableMonths}
        monthFormat={monthFormat}
        renderMonthText={renderMonthText}
        renderWeekHeaderElement={renderWeekHeaderElement}
        withPortal={withPortal}
        hidden={!focusedInput}
        initialVisibleMonth={() => currentMonth}
        daySize={daySize}
        onOutsideClick={onOutsideClick}
        disablePrev={disablePrev}
        disableNext={disableNext}
        dayPickerNavigationInlineStyles={dayPickerNavigationInlineStyles}
        navPosition={navPosition}
        navPrev={navPrev}
        navNext={navNext}
        renderNavPrevButton={renderNavPrevButton}
        renderNavNextButton={renderNavNextButton}
        noNavButtons={noNavButtons}
        noNavPrevButton={noNavPrevButton}
        noNavNextButton={noNavNextButton}
        renderCalendarDay={renderCalendarDay}
        renderDayContents={renderDayContents}
        renderCalendarInfo={renderCalendarInfo}
        renderMonthElement={renderMonthElement}
        renderKeyboardShortcutsButton={renderKeyboardShortcutsButton}
        renderKeyboardShortcutsPanel={renderKeyboardShortcutsPanel}
        calendarInfoPosition={calendarInfoPosition}
        firstDayOfWeek={firstDayOfWeek}
        hideKeyboardShortcutsPanel={hideKeyboardShortcutsPanel}
        isFocused={isFocused}
        getFirstFocusableDay={this.getFirstFocusableDay}
        onBlur={onBlur}
        showKeyboardShortcuts={showKeyboardShortcuts}
        phrases={phrases}
        isRTL={isRTL}
        weekDayFormat={weekDayFormat}
        dayAriaLabelFormat={dayAriaLabelFormat}
        verticalHeight={verticalHeight}
        verticalBorderSpacing={verticalBorderSpacing}
        noBorder={noBorder}
        transitionDuration={transitionDuration}
        horizontalMonthPadding={horizontalMonthPadding}
      />
    );
  }
}

DayPickerRangeController.propTypes = propTypes;
DayPickerRangeController.defaultProps = defaultProps;
