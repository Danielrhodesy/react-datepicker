import React from 'react';
import { expect } from 'chai';
import moment from 'moment';
import sinon from 'sinon-sandbox';
import { shallow } from 'enzyme';

import DayPickerRangeController from '../../src/components/DayPickerRangeController';

import DayPicker from '../../src/components/DayPicker';
import DayPickerNavigation from '../../src/components/DayPickerNavigation';

import toISODateString from '../../src/utils/toISODateString';
import toISOMonthString from '../../src/utils/toISOMonthString';
import isInclusivelyAfterDay from '../../src/utils/isInclusivelyAfterDay';
import isSameDay from '../../src/utils/isSameDay';
import isBeforeDay from '../../src/utils/isBeforeDay';
import * as isDayVisible from '../../src/utils/isDayVisible';
import getVisibleDays from '../../src/utils/getVisibleDays';

import { START_DATE, END_DATE, VERTICAL_SCROLLABLE } from '../../src/constants';

// Set to noon to mimic how days in the picker are configured internally
const today = moment().startOf('day').hours(12);

function getCallsByModifier(stub, modifier) {
  return stub.getCalls().filter((call) => call.args[call.args.length - 1] === modifier);
}

describe('DayPickerRangeController', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('#render()', () => {
    it('renders <DayPicker />', () => {
      const wrapper = shallow(<DayPickerRangeController />);
      expect(wrapper.find(DayPicker)).to.have.length(1);
    });
  });

  describe('#componentDidMount', () => {
    const props = {
      ...DayPickerRangeController.defaultProps,
      onDatesChange() {},
      onFocusChange() {},
    };

    describe('phrases', () => {
      const phrases = {
        chooseAvailableDate: 'test1',
        chooseAvailablewidget_date: 'test2',
        chooseAvailablewidget_date_to: 'test3',
      };

      describe('focusedInput is START_DATE', () => {
        it('state.phrases.chooseAvailableDate equals props.phrases.chooseAvailablewidget_date', () => {
          const wrapper = shallow((
            <DayPickerRangeController
              {...props}
              focusedInput={START_DATE}
              phrases={phrases}
            />
          ));
          const newAvailableDatePhrase = wrapper.state().phrases.chooseAvailableDate;
          expect(newAvailableDatePhrase).to.equal(phrases.chooseAvailablewidget_date);
        });
      });

      describe('focusedInput is END_DATE', () => {
        it('state.phrases.chooseAvailableDate equals props.phrases.chooseAvailablewidget_date_to', () => {
          const wrapper = shallow((
            <DayPickerRangeController
              {...props}
              focusedInput={END_DATE}
              phrases={phrases}
            />
          ));
          const newAvailableDatePhrase = wrapper.state().phrases.chooseAvailableDate;
          expect(newAvailableDatePhrase).to.equal(phrases.chooseAvailablewidget_date_to);
        });
      });

      describe('focusedInput is null', () => {
        it('state.phrases.chooseAvailableDate equals props.phrases.chooseAvailableDate', () => {
          const wrapper = shallow((
            <DayPickerRangeController
              {...props}
              focusedInput={null}
              phrases={phrases}
            />
          ));
          const newAvailableDatePhrase = wrapper.state().phrases.chooseAvailableDate;
          expect(newAvailableDatePhrase).to.equal(phrases.chooseAvailableDate);
        });
      });
    });
  });

  describe('#componentWillReceiveProps', () => {
    const props = {
      ...DayPickerRangeController.defaultProps,
      onDatesChange() {},
      onFocusChange() {},
    };

    describe('rebuilding currentMonth/visibleDays', () => {
      describe('initialVisibleMonth changed', () => {
        describe('focusedInput has changed and is truthy', () => {
          it('calls getStateForNewMonth with nextProps', () => {
            const getStateForNewMonthSpy = sinon.spy(
              DayPickerRangeController.prototype,
              'getStateForNewMonth',
            );
            const wrapper = shallow(<DayPickerRangeController {...props} focusedInput={null} />);
            getStateForNewMonthSpy.resetHistory();
            wrapper.instance().componentWillReceiveProps({
              ...props,
              focusedInput: START_DATE,
              initialVisibleMonth: () => moment(),
            });
            expect(getStateForNewMonthSpy.callCount).to.equal(1);
          });

          it('sets state.currentMonth to getStateForNewMonth.currentMonth', () => {
            const currentMonth = moment().add(10, 'months');
            const getStateForNewMonthStub = sinon.stub(
              DayPickerRangeController.prototype,
              'getStateForNewMonth',
            );
            getStateForNewMonthStub.returns({ currentMonth, visibleDays: {} });

            const wrapper = shallow(<DayPickerRangeController {...props} focusedInput={null} />);
            wrapper.instance().componentWillReceiveProps({
              ...props,
              focusedInput: START_DATE,
              initialVisibleMonth: () => moment(),
            });
            expect(wrapper.instance().state.currentMonth).to.equal(currentMonth);
          });

          it('sets state.visibleDays to getStateForNewMonth.visibleDays', () => {
            const currentMonth = moment().add(10, 'months');
            const visibleDays = getVisibleDays(currentMonth, 1);
            const getStateForNewMonthStub = sinon.stub(
              DayPickerRangeController.prototype,
              'getStateForNewMonth',
            );
            getStateForNewMonthStub.returns({ currentMonth, visibleDays });

            const wrapper = shallow(<DayPickerRangeController {...props} focusedInput={null} />);
            wrapper.instance().componentWillReceiveProps({
              ...props,
              focusedInput: START_DATE,
              initialVisibleMonth: () => moment(),
            });
            expect(wrapper.instance().state.visibleDays).to.equal(visibleDays);
          });
        });

        describe('focusedInput has not changed', () => {
          it('does not call getStateForNewMonth', () => {
            const getStateForNewMonthSpy = sinon.spy(
              DayPickerRangeController.prototype,
              'getStateForNewMonth',
            );
            const wrapper = shallow(<DayPickerRangeController {...props} focusedInput={null} />);
            getStateForNewMonthSpy.resetHistory();
            wrapper.instance().componentWillReceiveProps({
              ...props,
              focusedInput: null,
              initialVisibleMonth: () => moment(),
            });
            expect(getStateForNewMonthSpy.callCount).to.equal(0);
          });

          it('does not change state.currentMonth', () => {
            const currentMonth = moment().add(10, 'months');
            const getStateForNewMonthStub = sinon.stub(
              DayPickerRangeController.prototype,
              'getStateForNewMonth',
            );
            getStateForNewMonthStub.returns({ currentMonth: moment(), visibleDays: {} });

            const wrapper = shallow(<DayPickerRangeController {...props} focusedInput={null} />);
            wrapper.setState({ currentMonth });
            wrapper.instance().componentWillReceiveProps({
              ...props,
              focusedInput: null,
              initialVisibleMonth: () => moment(),
            });
            expect(wrapper.instance().state.currentMonth).to.equal(currentMonth);
          });

          it('does not change state.visibleDays', () => {
            const visibleDays = {};
            const getStateForNewMonthStub = sinon.stub(DayPickerRangeController.prototype, 'getStateForNewMonth');
            getStateForNewMonthStub.returns({
              currentMonth: moment(),
              visibleDays: getVisibleDays(moment(), 1),
            });

            const wrapper = shallow(<DayPickerRangeController {...props} focusedInput={null} />);
            wrapper.setState({ visibleDays });
            wrapper.instance().componentWillReceiveProps({
              ...props,
              focusedInput: null,
              initialVisibleMonth: () => moment(),
            });
            expect(wrapper.instance().state.visibleDays).to.equal(visibleDays);
          });
        });
      });

      describe('numberOfMonths changed', () => {
        it('calls getStateForNewMonth with nextProps', () => {
          const getStateForNewMonthSpy = sinon.spy(
            DayPickerRangeController.prototype,
            'getStateForNewMonth',
          );
          const wrapper = shallow(<DayPickerRangeController {...props} />);
          getStateForNewMonthSpy.resetHistory();
          wrapper.instance().componentWillReceiveProps({
            ...props,
            numberOfMonths: 5,
          });
          expect(getStateForNewMonthSpy.callCount).to.equal(1);
        });

        it('sets state.currentMonth to getStateForNewMonth.currentMonth', () => {
          const currentMonth = moment().add(10, 'months');
          const getStateForNewMonthStub = sinon.stub(
            DayPickerRangeController.prototype,
            'getStateForNewMonth',
          );
          getStateForNewMonthStub.returns({ currentMonth, visibleDays: {} });

          const wrapper = shallow(<DayPickerRangeController {...props} />);
          wrapper.instance().componentWillReceiveProps({
            ...props,
            numberOfMonths: 5,
          });
          expect(wrapper.instance().state.currentMonth).to.equal(currentMonth);
        });

        it('sets state.visibleDays to getStateForNewMonth.visibleDays', () => {
          const currentMonth = moment().add(10, 'months');
          const visibleDays = getVisibleDays(currentMonth, 1);
          const getStateForNewMonthStub = sinon.stub(
            DayPickerRangeController.prototype,
            'getStateForNewMonth',
          );
          getStateForNewMonthStub.returns({ currentMonth, visibleDays });

          const wrapper = shallow(<DayPickerRangeController {...props} />);
          wrapper.instance().componentWillReceiveProps({
            ...props,
            numberOfMonths: 5,
          });
          expect(wrapper.instance().state.visibleDays).to.equal(visibleDays);
        });
      });

      describe('enableOutsideDays changed', () => {
        it('calls getStateForNewMonth with nextProps', () => {
          const getStateForNewMonthSpy = sinon.spy(DayPickerRangeController.prototype, 'getStateForNewMonth');
          const wrapper = shallow(<DayPickerRangeController {...props} />);
          getStateForNewMonthSpy.resetHistory();
          wrapper.instance().componentWillReceiveProps({
            ...props,
            enableOutsideDays: true,
          });
          expect(getStateForNewMonthSpy.callCount).to.equal(1);
        });

        it('sets state.currentMonth to getStateForNewMonth.currentMonth', () => {
          const currentMonth = moment().add(10, 'months');
          const getStateForNewMonthStub = sinon.stub(DayPickerRangeController.prototype, 'getStateForNewMonth');
          getStateForNewMonthStub.returns({ currentMonth, visibleDays: {} });

          const wrapper = shallow(<DayPickerRangeController {...props} />);
          wrapper.instance().componentWillReceiveProps({
            ...props,
            enableOutsideDays: true,
          });
          expect(wrapper.instance().state.currentMonth).to.equal(currentMonth);
        });

        it('sets state.visibleDays to getStateForNewMonth.visibleDays', () => {
          const currentMonth = moment().add(10, 'months');
          const visibleDays = getVisibleDays(currentMonth, 1);
          const getStateForNewMonthStub = sinon.stub(DayPickerRangeController.prototype, 'getStateForNewMonth');
          getStateForNewMonthStub.returns({ currentMonth, visibleDays });

          const wrapper = shallow(<DayPickerRangeController {...props} />);
          wrapper.instance().componentWillReceiveProps({
            ...props,
            enableOutsideDays: true,
          });
          expect(wrapper.instance().state.visibleDays).to.equal(visibleDays);
        });
      });

      describe('widget_date changed from one date to another', () => {
        it('removes previous `after-hovered-start` range', () => {
          const minimumNights = 5;
          const widget_date = moment().add(7, 'days');
          const dayAfterwidget_date = widget_date.clone().add(1, 'day');
          const firstAvailableDate = widget_date.clone().add(minimumNights + 1, 'days');
          const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
          const nextwidget_date = moment().add(4, 'days');
          const wrapper = shallow((
            <DayPickerRangeController
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
              widget_date={widget_date}
              focusedInput={START_DATE}
              minimumNights={minimumNights}
            />
          ));
          deleteModifierFromRangeSpy.resetHistory();
          wrapper.instance().componentWillReceiveProps({
            ...props,
            widget_date: nextwidget_date,
          });
          const afterHoverStartCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'after-hovered-start');
          expect(afterHoverStartCalls.length).to.equal(1);
          expect(isSameDay(afterHoverStartCalls[0].args[1], dayAfterwidget_date)).to.equal(true);
          expect(isSameDay(afterHoverStartCalls[0].args[2], firstAvailableDate)).to.equal(true);
        });
      });

      describe('widget_date_to changed from one date to another', () => {
        it('removes previous `selected-end-no-selected-start` when no start date selected', () => {
          const minimumNights = 5;
          const widget_date_to = moment().add(7, 'days');
          const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
          const addModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifier');
          const nextwidget_date_to = moment().add(4, 'days');
          const wrapper = shallow((
            <DayPickerRangeController
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
              widget_date_to={widget_date_to}
              focusedInput={END_DATE}
              minimumNights={minimumNights}
            />
          ));
          deleteModifierSpy.resetHistory();
          addModifierSpy.resetHistory();
          wrapper.instance().componentWillReceiveProps({
            ...props,
            widget_date_to: nextwidget_date_to,
          });
          const selectedEndNowidget_dateDelete = getCallsByModifier(deleteModifierSpy, 'selected-end-no-selected-start');
          expect(selectedEndNowidget_dateDelete.length).to.equal(1);
          expect(isSameDay(selectedEndNowidget_dateDelete[0].args[1], widget_date_to)).to.equal(true);

          const selectedEndNowidget_dateAdd = getCallsByModifier(addModifierSpy, 'selected-end-no-selected-start');
          expect(selectedEndNowidget_dateAdd.length).to.equal(1);
          expect(isSameDay(selectedEndNowidget_dateAdd[0].args[1], nextwidget_date_to)).to.equal(true);
        });

        it('calls getStateForNewMonth with nextProps when date is not visible', () => {
          const getStateForNewMonthSpy = sinon.spy(
            DayPickerRangeController.prototype,
            'getStateForNewMonth',
          );
          const widget_date_to = moment();
          const nextwidget_date_to = widget_date_to.clone().add(2, 'months');

          const wrapper = shallow((
            <DayPickerRangeController {...props} widget_date_to={widget_date_to} />
          ));

          getStateForNewMonthSpy.resetHistory();

          wrapper.instance().componentWillReceiveProps({
            ...props,
            widget_date_to: nextwidget_date_to,
          });
        });
      });
    });

    describe('modifiers', () => {
      describe('selected-start modifier', () => {
        describe('props.widget_date did not change', () => {
          it('does not call this.addModifier with `selected-start', () => {
            const addModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifier');
            const widget_date = today;
            const wrapper = shallow(<DayPickerRangeController {...props} widget_date={widget_date} />);
            wrapper.instance().componentWillReceiveProps({ ...props, widget_date });
            expect(getCallsByModifier(addModifierSpy, 'selected-start').length).to.equal(0);
          });

          it('does not call this.deleteModifier with `selected-start', () => {
            const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
            const widget_date = today;
            const wrapper = shallow(<DayPickerRangeController {...props} widget_date={widget_date} />);
            wrapper.instance().componentWillReceiveProps({ ...props, widget_date });
            expect(getCallsByModifier(deleteModifierSpy, 'selected-start').length).to.equal(0);
          });
        });

        describe('props.widget_date changed', () => {
          it('deleteModifier gets called with old widget_date and `selected-start`', () => {
            const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
            const widget_date = today;
            const newwidget_date = moment().add(1, 'day');
            const wrapper = shallow(<DayPickerRangeController {...props} widget_date={widget_date} />);
            wrapper.instance().componentWillReceiveProps({ ...props, widget_date: newwidget_date });
            const selectedStartCalls = getCallsByModifier(deleteModifierSpy, 'selected-start');
            expect(selectedStartCalls.length).to.equal(1);
            expect(selectedStartCalls[0].args[1]).to.equal(widget_date);
          });

          it('addModifier gets called with new widget_date and `selected-start`', () => {
            const addModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifier');
            const widget_date = today;
            const newwidget_date = moment().add(1, 'day');
            const wrapper = shallow(<DayPickerRangeController {...props} widget_date={widget_date} />);
            wrapper.instance().componentWillReceiveProps({ ...props, widget_date: newwidget_date });
            const selectedStartCalls = getCallsByModifier(addModifierSpy, 'selected-start');
            expect(selectedStartCalls.length).to.equal(1);
            expect(selectedStartCalls[0].args[1]).to.equal(newwidget_date);
          });
        });
      });

      describe('selected-end modifier', () => {
        describe('props.widget_date_to did not change', () => {
          it('does not call this.addModifier with `selected-end`', () => {
            const addModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifier');
            const widget_date_to = today;
            const wrapper = shallow(<DayPickerRangeController {...props} widget_date_to={widget_date_to} />);
            wrapper.instance().componentWillReceiveProps({ ...props, widget_date_to });
            expect(getCallsByModifier(addModifierSpy, 'selected-end').length).to.equal(0);
          });

          it('does not call this.deleteModifier with `selected-end`', () => {
            const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
            const widget_date_to = today;
            const wrapper = shallow(<DayPickerRangeController {...props} widget_date_to={widget_date_to} />);
            wrapper.instance().componentWillReceiveProps({ ...props, widget_date_to });
            expect(getCallsByModifier(deleteModifierSpy, 'selected-end').length).to.equal(0);
          });
        });

        describe('props.widget_date_to changed', () => {
          it('deleteModifier gets called with old widget_date_to and `selected-end`', () => {
            const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
            const widget_date_to = today;
            const newwidget_date_to = moment().add(1, 'day');
            const wrapper = shallow(<DayPickerRangeController {...props} widget_date_to={widget_date_to} />);
            wrapper.instance().componentWillReceiveProps({ ...props, widget_date_to: newwidget_date_to });
            const selectedEndCalls = getCallsByModifier(deleteModifierSpy, 'selected-end');
            expect(selectedEndCalls.length).to.equal(1);
            expect(selectedEndCalls[0].args[1]).to.equal(widget_date_to);
          });

          it('addModifier gets called with new widget_date_to and `selected-end`', () => {
            const addModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifier');
            const widget_date_to = today;
            const newwidget_date_to = moment().add(1, 'day');
            const wrapper = shallow(<DayPickerRangeController {...props} widget_date_to={widget_date_to} />);
            wrapper.instance().componentWillReceiveProps({ ...props, widget_date_to: newwidget_date_to });
            const selectedEndCalls = getCallsByModifier(addModifierSpy, 'selected-end');
            expect(selectedEndCalls.length).to.equal(1);
            expect(selectedEndCalls[0].args[1]).to.equal(newwidget_date_to);
          });
        });
      });

      describe('hovered-span modifier', () => {
        describe('widget_date changed', () => {
          describe('new widget_date does not exist', () => {
            it('deleteModifierFromRange does not get called with `hovered-span`', () => {
              const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
              const widget_date_to = moment().add(10, 'days');
              const wrapper = shallow(<DayPickerRangeController {...props} widget_date={today} />);
              wrapper.instance().componentWillReceiveProps({ ...props, widget_date: null, widget_date_to });
              const hoverSpanCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'hovered-span');
              expect(hoverSpanCalls.length).to.equal(0);
            });
          });

          describe('new widget_date_to does not exist', () => {
            it('deleteModifierFromRange does not get called with `hovered-span`', () => {
              const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
              const widget_date = today;
              const wrapper = shallow(<DayPickerRangeController {...props} />);
              wrapper.instance().componentWillReceiveProps({ ...props, widget_date, widget_date_to: null });
              const hoverSpanCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'hovered-span');
              expect(hoverSpanCalls.length).to.equal(0);
            });
          });

          describe('new widget_date and new widget_date_to both exist', () => {
            it('deleteModifierFromRange gets called with widget_date, widget_date_to + 1 day, and `hovered-span`', () => {
              const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
              const widget_date = today;
              const widget_date_to = today.clone().add(10, 'days');
              const dayAfterwidget_date_to = widget_date_to.clone().add(1, 'day');
              const wrapper = shallow(<DayPickerRangeController {...props} />);
              wrapper.instance().componentWillReceiveProps({ ...props, widget_date, widget_date_to });
              const hoverSpanCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'hovered-span');
              expect(hoverSpanCalls.length).to.equal(1);
              expect(hoverSpanCalls[0].args[1]).to.equal(widget_date);
              expect(isSameDay(hoverSpanCalls[0].args[2], dayAfterwidget_date_to)).to.equal(true);
            });
          });
        });
      });

      describe('selected-span modifier', () => {
        describe('widget_date changed', () => {
          describe('old widget_date and old widget_date_to both exist', () => {
            it('deleteModifierFromRange gets called with old widget_date + 1 day, old widget_date_to, and `selected-span`', () => {
              const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
              const widget_date = today;
              const newwidget_date = moment().add(7, 'days');
              const widget_date_to = moment().add(10, 'days');
              const dayAfterwidget_date_to = widget_date_to.clone().add(1, 'day');
              const wrapper = shallow((
                <DayPickerRangeController {...props} widget_date={widget_date} widget_date_to={widget_date_to} />
              ));
              wrapper.instance().componentWillReceiveProps({
                ...props,
                widget_date: newwidget_date,
                widget_date_to,
              });
              const selectedSpanCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'selected-span');
              expect(selectedSpanCalls.length).to.equal(1);
              expect(selectedSpanCalls[0].args[1]).to.equal(widget_date);
              expect(isSameDay(selectedSpanCalls[0].args[2], dayAfterwidget_date_to)).to.equal(true);
            });
          });

          describe('new widget_date and new widget_date_to both exist', () => {
            it('addModifierToRange gets calls with new widget_date + 1 day, widget_date_to, and `selected-span`', () => {
              const addModifierToRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifierToRange');
              const widget_date = moment().add(1, 'day');
              const newwidget_date = today;
              const dayAfterwidget_date = newwidget_date.clone().add(1, 'day');
              const widget_date_to = today.clone().add(10, 'days');
              const wrapper = shallow((
                <DayPickerRangeController {...props} widget_date={widget_date} widget_date_to={widget_date_to} />
              ));
              wrapper.instance().componentWillReceiveProps({
                ...props,
                widget_date: newwidget_date,
                widget_date_to,
              });
              const selectedStartCalls = getCallsByModifier(addModifierToRangeSpy, 'selected-span');
              expect(selectedStartCalls.length).to.equal(1);
              expect(isSameDay(selectedStartCalls[0].args[1], dayAfterwidget_date)).to.equal(true);
              expect(selectedStartCalls[0].args[2]).to.equal(widget_date_to);
            });
          });
        });

        describe('widget_date_to changed', () => {
          describe('old widget_date and old widget_date_to both exist', () => {
            it('deleteModifierFromRange gets called with old widget_date + 1 day, old widget_date_to, and `selected-span`', () => {
              const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
              const widget_date = today;
              const widget_date_to = today.clone().add(10, 'days');
              const dayAfterwidget_date_to = widget_date_to.clone().add(1, 'day');
              const wrapper = shallow((
                <DayPickerRangeController {...props} widget_date={widget_date} widget_date_to={widget_date_to} />
              ));
              wrapper.instance().componentWillReceiveProps({
                ...props,
                widget_date,
                widget_date_to: moment().add(11, 'day'),
              });
              const selectedSpanCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'selected-span');
              expect(selectedSpanCalls.length).to.equal(1);
              expect(selectedSpanCalls[0].args[1]).to.equal(widget_date);
              expect(isSameDay(selectedSpanCalls[0].args[2], dayAfterwidget_date_to)).to.equal(true);
            });
          });

          describe('new widget_date and new widget_date_to both exist', () => {
            it('addModifierToRange gets calls with widget_date + 1 day, widget_date_to, and `selected-span`', () => {
              const addModifierToRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifierToRange');
              const widget_date = today;
              const dayAfterwidget_date = widget_date.clone().add(1, 'day');
              const widget_date_to = moment().add(1, 'day');
              const newwidget_date_to = today.clone().add(10, 'days');
              const wrapper = shallow(<DayPickerRangeController
                {...props}
                widget_date={widget_date}
                widget_date_to={widget_date_to}
              />);
              wrapper.instance().componentWillReceiveProps({
                ...props,
                widget_date,
                widget_date_to: newwidget_date_to,
              });
              const selectedSpanCalls = getCallsByModifier(addModifierToRangeSpy, 'selected-span');
              expect(selectedSpanCalls.length).to.equal(1);
              expect(isSameDay(selectedSpanCalls[0].args[1], dayAfterwidget_date)).to.equal(true);
              expect(selectedSpanCalls[0].args[2]).to.equal(newwidget_date_to);
            });
          });
        });
      });

      describe('after-hovered-start modifier', () => {
        describe('start date changed, is truthy, and there is no end date', () => {
          it('calls addModifierToRange with `after-hovered-start`', () => {
            const addModifierToRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifierToRange');
            const wrapper = shallow(<DayPickerRangeController {...props} />);
            wrapper.instance().componentWillReceiveProps({ ...props, widget_date: moment() });
            const afterHoverStartCalls = getCallsByModifier(addModifierToRangeSpy, 'after-hovered-start');
            expect(afterHoverStartCalls.length).to.equal(1);
          });

          it('`after-hovered-start` addModifierToRange has span beginning with day after widget_date', () => {
            const addModifierToRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifierToRange');
            const widget_date = moment();
            const startSpan = toISODateString(widget_date.clone().add(1, 'day'));
            const wrapper = shallow(<DayPickerRangeController {...props} />);
            wrapper.instance().componentWillReceiveProps({ ...props, widget_date });
            const afterHoverStartCalls = getCallsByModifier(addModifierToRangeSpy, 'after-hovered-start');
            expect(toISODateString(afterHoverStartCalls[0].args[1])).to.equal(startSpan);
          });

          it('`after-hovered-start` addModifierToRange has span ending with widget_date + minimumNights + 1', () => {
            const addModifierToRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifierToRange');
            const minimumNights = 3;
            const widget_date = moment();
            const endSpan = toISODateString(widget_date.clone().add(minimumNights + 1, 'day'));
            const wrapper = shallow((
              <DayPickerRangeController {...props} minimumNights={minimumNights} />
            ));
            wrapper.instance().componentWillReceiveProps({ ...props, widget_date, minimumNights });
            const afterHoverStartCalls = getCallsByModifier(addModifierToRangeSpy, 'after-hovered-start');
            expect(toISODateString(afterHoverStartCalls[0].args[2])).to.equal(endSpan);
          });
        });

        describe('start date did not change', () => {
          it('does not call addModifierToRange with `after-hovered-start`', () => {
            const widget_date = moment();
            const addModifierToRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifierToRange');
            const wrapper = shallow(<DayPickerRangeController {...props} widget_date={widget_date} />);
            wrapper.instance().componentWillReceiveProps({ ...props, widget_date });
            const afterHoverStartCalls = getCallsByModifier(addModifierToRangeSpy, 'after-hovered-start');
            expect(afterHoverStartCalls.length).to.equal(0);
          });
        });

        describe('new start date is falsy', () => {
          it('does not call addModifierToRange with `after-hovered-start`', () => {
            const widget_date = moment();
            const addModifierToRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifierToRange');
            const wrapper = shallow(<DayPickerRangeController {...props} widget_date={widget_date} />);
            wrapper.instance().componentWillReceiveProps({ ...props, widget_date: null });
            const afterHoverStartCalls = getCallsByModifier(addModifierToRangeSpy, 'after-hovered-start');
            expect(afterHoverStartCalls.length).to.equal(0);
          });
        });

        describe('end date exists', () => {
          it('does not call addModifierToRange with `after-hovered-start`', () => {
            const addModifierToRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifierToRange');
            const wrapper = shallow(<DayPickerRangeController {...props} />);
            wrapper.instance().componentWillReceiveProps({
              ...props,
              widget_date: moment(),
              widget_date_to: moment(),
            });
            const afterHoverStartCalls = getCallsByModifier(addModifierToRangeSpy, 'after-hovered-start');
            expect(afterHoverStartCalls.length).to.equal(0);
          });
        });
      });

      describe('blocked-minimum-nights', () => {
        describe('old widget_date exists', () => {
          describe('neither widget_date nor focusedInput changed', () => {
            it('does not call deleteModifierFromRange with `blocked-minimum-nights`', () => {
              const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
              const widget_date = today;
              const focusedInput = END_DATE;
              const wrapper = shallow(<DayPickerRangeController
                {...props}
                widget_date={widget_date}
                widget_date_to={null}
                focusedInput={focusedInput}
              />);
              wrapper.instance().componentWillReceiveProps({
                ...props,
                widget_date,
                focusedInput,
              });
              const minimumNightsCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'blocked-minimum-nights');
              expect(minimumNightsCalls.length).to.equal(0);
            });
          });

          describe('widget_date changed', () => {
            it('calls deleteModifierFromRange with old start date, + min nights, and `blocked-minimum-nights', () => {
              const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
              const widget_date = today;
              const focusedInput = END_DATE;
              const minimumNights = 5;
              const wrapper = shallow(<DayPickerRangeController
                {...props}
                widget_date={widget_date}
                focusedInput={focusedInput}
                minimumNights={minimumNights}
              />);
              wrapper.instance().componentWillReceiveProps({
                ...props,
                widget_date: moment().add(5, 'days'),
                focusedInput,
                minimumNights,
              });
              const minimumNightsEndSpan = widget_date.clone().add(minimumNights, 'days');
              const minimumNightsCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'blocked-minimum-nights');
              expect(minimumNightsCalls.length).to.equal(1);
              expect(minimumNightsCalls[0].args[1]).to.equal(widget_date);
              expect(isSameDay(minimumNightsCalls[0].args[2], minimumNightsEndSpan)).to.equal(true);
            });
          });

          describe('focusedInput changed', () => {
            it('calls deleteModifierFromRange with old start date, + min nights, and `blocked-minimum-nights`', () => {
              const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
              const widget_date = today;
              const focusedInput = END_DATE;
              const minimumNights = 5;
              const wrapper = shallow(<DayPickerRangeController
                widget_date={widget_date}
                focusedInput={START_DATE}
                minimumNights={minimumNights}
              />);
              wrapper.instance().componentWillReceiveProps({
                ...props,
                widget_date,
                focusedInput,
                minimumNights,
              });
              const minimumNightsEndSpan = widget_date.clone().add(minimumNights, 'days');
              const minimumNightsCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'blocked-minimum-nights');
              expect(minimumNightsCalls.length).to.equal(1);
              expect(minimumNightsCalls[0].args[1]).to.equal(widget_date);
              expect(isSameDay(minimumNightsCalls[0].args[2], minimumNightsEndSpan)).to.equal(true);
            });
          });

          describe('minimumNights changed', () => {
            it('calls deleteModifierFromRange with start date + old min nights, and `blocked-minimum-nights`', () => {
              const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
              const widget_date = today;
              const focusedInput = START_DATE;
              const minimumNights = 5;
              const wrapper = shallow(<DayPickerRangeController
                widget_date={widget_date}
                focusedInput={focusedInput}
                minimumNights={minimumNights}
              />);
              wrapper.instance().componentWillReceiveProps({
                ...props,
                focusedInput,
                widget_date,
                minimumNights: 1,
              });
              const minimumNightsEndSpan = widget_date.clone().add(minimumNights, 'days');
              const minimumNightsCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'blocked-minimum-nights');
              expect(minimumNightsCalls.length).to.equal(1);
              expect(minimumNightsCalls[0].args[1]).to.equal(widget_date);
              expect(isSameDay(minimumNightsCalls[0].args[2], minimumNightsEndSpan)).to.equal(true);
            });
          });
        });

        describe('new widget_date exists', () => {
          describe('new focusedInput !== END_DATE', () => {
            it('does not call addModifierFromRange with `blocked-minimum-nights', () => {
              const addModifierToRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifierToRange');
              const widget_date = moment(today);
              const wrapper = shallow(<DayPickerRangeController
                {...props}
                focusedInput={END_DATE}
                widget_date={widget_date}
                minimumNights={5}
              />);
              wrapper.instance().componentWillReceiveProps({
                ...props,
                widget_date: today,
                focusedInput: START_DATE,
                minimumNights: 5,
              });
              const minimumNightsCalls = getCallsByModifier(addModifierToRangeSpy, 'blocked-minimum-nights');
              expect(minimumNightsCalls.length).to.equal(0);
            });

            it('updates state to remove `blocked-minimum-nights` and `blocked` from the appropriate days', () => {
              const widget_date = today;
              const minimumNights = 5;
              const wrapper = shallow(<DayPickerRangeController
                {...props}
                focusedInput={END_DATE}
                widget_date={widget_date}
                minimumNights={minimumNights}
              />);
              const { visibleDays } = wrapper.state();
              let day = moment(today);
              for (let i = 0; i < minimumNights; i += 1) {
                const monthString = toISOMonthString(day);
                const dateString = toISODateString(day);
                expect(visibleDays[monthString][dateString]).to.include('blocked-minimum-nights');
                expect(visibleDays[monthString][dateString]).to.include('blocked');
                day.add(1, 'day');
              }

              wrapper.instance().componentWillReceiveProps({
                ...props,
                widget_date,
                focusedInput: START_DATE,
                minimumNights,
              });

              const { visibleDays: newVisibleDays } = wrapper.state();
              day = moment(today);
              for (let i = 0; i < minimumNights; i += 1) {
                const monthString = toISOMonthString(day);
                const dateString = toISODateString(day);
                expect(newVisibleDays[monthString][dateString]).not.to.include('blocked-minimum-nights');
                expect(newVisibleDays[monthString][dateString]).not.to.include('blocked');
                day.add(1, 'day');
              }
            });
          });

          describe('focusedInput === END_DATE', () => {
            it('calls addModifierFromRange with widget_date, + min nights, `blocked-minimum-nights`', () => {
              const addModifierToRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifierToRange');
              const widget_date = today;
              const minimumNights = 5;
              const minimumNightsEndSpan = widget_date.clone().add(minimumNights, 'days');
              const wrapper = shallow(<DayPickerRangeController
                {...props}
                widget_date={widget_date}
                minimumNights={minimumNights}
              />);
              wrapper.instance().componentWillReceiveProps({
                ...props,
                widget_date,
                focusedInput: END_DATE,
                minimumNights,
              });
              const minimumNightsCalls = getCallsByModifier(addModifierToRangeSpy, 'blocked-minimum-nights');
              expect(minimumNightsCalls.length).to.equal(1);
              expect(minimumNightsCalls[0].args[1]).to.equal(widget_date);
              expect(isSameDay(minimumNightsCalls[0].args[2], minimumNightsEndSpan)).to.equal(true);
            });

            it('updates state to include `blocked-minimum-nights` on the appropriate days', () => {
              const widget_date = today;
              const minimumNights = 5;
              const wrapper = shallow(<DayPickerRangeController
                {...props}
                widget_date={widget_date}
                minimumNights={minimumNights}
              />);
              wrapper.instance().componentWillReceiveProps({
                ...props,
                widget_date,
                focusedInput: END_DATE,
                minimumNights,
              });
              const { visibleDays } = wrapper.state();
              const day = moment(today);
              for (let i = 0; i < minimumNights; i += 1) {
                const monthString = toISOMonthString(day);
                const dateString = toISODateString(day);
                expect(visibleDays[monthString][dateString]).to.include('blocked-minimum-nights');
                day.add(1, 'day');
              }
            });

            it('updates state to include `blocked` on the appropriate days', () => {
              const widget_date = today;
              const minimumNights = 5;
              const wrapper = shallow(<DayPickerRangeController
                {...props}
                widget_date={widget_date}
                minimumNights={minimumNights}
              />);
              wrapper.instance().componentWillReceiveProps({
                ...props,
                widget_date,
                focusedInput: END_DATE,
                minimumNights,
              });
              const { visibleDays } = wrapper.state();
              const day = moment(today);
              for (let i = 0; i < minimumNights; i += 1) {
                const monthString = toISOMonthString(day);
                const dateString = toISODateString(day);
                expect(visibleDays[monthString][dateString]).to.include('blocked');
                day.add(1, 'day');
              }
            });
          });
        });
      });

      describe('blocked-out-of-range', () => {
        describe('focusedInput did not change', () => {
          it('does not call isOutsideRange if unchanged', () => {
            const isOutsideRangeStub = sinon.stub();
            const wrapper = shallow(<DayPickerRangeController
              {...props}
              isOutsideRange={isOutsideRangeStub}
            />);
            const prevCallCount = isOutsideRangeStub.callCount;
            wrapper.instance().componentWillReceiveProps({
              ...props,
              isOutsideRange: isOutsideRangeStub,
            });
            expect(isOutsideRangeStub.callCount).to.equal(prevCallCount);
          });

          it('calls isOutsideRange if changed', () => {
            const isOutsideRangeStub = sinon.stub();
            const wrapper = shallow(<DayPickerRangeController {...props} />);
            wrapper.instance().componentWillReceiveProps({
              ...props,
              isOutsideRange: isOutsideRangeStub,
            });
            expect(isOutsideRangeStub.callCount).to.not.equal(0);
          });
        });

        describe('focusedInput changed', () => {
          const numVisibleDays = 3;
          let visibleDays;
          beforeEach(() => {
            const startOfMonth = today.clone().startOf('month');
            visibleDays = {
              [toISOMonthString(startOfMonth)]: {
                [toISODateString(startOfMonth)]: new Set(),
                [toISODateString(startOfMonth.clone().add(1, 'day'))]: new Set(),
                [toISODateString(startOfMonth.clone().add(2, 'days'))]: new Set(),
              },
            };
          });

          it('calls isOutsideRange for every visible day', () => {
            const isOutsideRangeStub = sinon.stub();
            const wrapper = shallow(<DayPickerRangeController {...props} />);
            wrapper.setState({ visibleDays });
            wrapper.instance().componentWillReceiveProps({
              ...props,
              focusedInput: END_DATE,
              isOutsideRange: isOutsideRangeStub,
            });
            expect(isOutsideRangeStub.callCount).to.equal(numVisibleDays);
          });

          it('if isOutsideRange(day) is true calls addModifier with `blocked-out-of-range` for each day', () => {
            const addModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifier');
            const isOutsideRangeStub = sinon.stub().returns(true);
            const wrapper = shallow(<DayPickerRangeController {...props} />);
            wrapper.setState({ visibleDays });
            wrapper.instance().componentWillReceiveProps({
              ...props,
              focusedInput: START_DATE,
              isOutsideRange: isOutsideRangeStub,
            });
            const blockedCalendarCalls = getCallsByModifier(addModifierSpy, 'blocked-out-of-range');
            expect(blockedCalendarCalls.length).to.equal(numVisibleDays);
          });

          it('if isOutsideRange(day) is false calls deleteModifier with day and `blocked-out-of-range`', () => {
            const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
            const isOutsideRangeStub = sinon.stub().returns(false);
            const wrapper = shallow(<DayPickerRangeController {...props} />);
            wrapper.setState({ visibleDays });
            wrapper.instance().componentWillReceiveProps({
              ...props,
              focusedInput: END_DATE,
              isOutsideRange: isOutsideRangeStub,
            });
            const blockedCalendarCalls = getCallsByModifier(deleteModifierSpy, 'blocked-out-of-range');
            expect(blockedCalendarCalls.length).to.equal(numVisibleDays);
          });
        });
      });

      describe('blocked-calendar', () => {
        describe('focusedInput did not change', () => {
          it('does not call isDayBlocked if unchanged', () => {
            const isDayBlockedStub = sinon.stub();
            const wrapper = shallow(<DayPickerRangeController
              {...props}
              isDayBlocked={isDayBlockedStub}
            />);
            const prevCallCount = isDayBlockedStub.callCount;
            wrapper.instance().componentWillReceiveProps({
              ...props,
              isDayBlocked: isDayBlockedStub,
            });
            expect(isDayBlockedStub.callCount).to.equal(prevCallCount);
          });

          it('calls isDayBlocked if changed', () => {
            const isDayBlockedStub = sinon.stub();
            const wrapper = shallow(<DayPickerRangeController {...props} />);
            wrapper.instance().componentWillReceiveProps({
              ...props,
              isDayBlocked: isDayBlockedStub,
            });
            expect(isDayBlockedStub.callCount).to.not.equal(0);
          });
        });

        describe('focusedInput changed', () => {
          const numVisibleDays = 3;
          let visibleDays;
          beforeEach(() => {
            const startOfMonth = today.clone().startOf('month');
            visibleDays = {
              [toISOMonthString(startOfMonth)]: {
                [toISODateString(startOfMonth)]: new Set(),
                [toISODateString(startOfMonth.clone().add(1, 'day'))]: new Set(),
                [toISODateString(startOfMonth.clone().add(2, 'days'))]: new Set(),
              },
            };
          });

          it('calls isDayBlocked for every visible day', () => {
            const isDayBlockedStub = sinon.stub();
            const wrapper = shallow(<DayPickerRangeController {...props} />);
            wrapper.setState({ visibleDays });
            wrapper.instance().componentWillReceiveProps({
              ...props,
              focusedInput: END_DATE,
              isDayBlocked: isDayBlockedStub,
            });
            expect(isDayBlockedStub.callCount).to.equal(numVisibleDays);
          });

          it('if isDayBlocked(day) is true calls addModifier with `blocked-calendar` for each day', () => {
            const addModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifier');
            const isDayBlockedStub = sinon.stub().returns(true);
            const wrapper = shallow(<DayPickerRangeController {...props} />);
            wrapper.setState({ visibleDays });
            wrapper.instance().componentWillReceiveProps({
              ...props,
              focusedInput: START_DATE,
              isDayBlocked: isDayBlockedStub,
            });
            const blockedCalendarCalls = getCallsByModifier(addModifierSpy, 'blocked-calendar');
            expect(blockedCalendarCalls.length).to.equal(numVisibleDays);
          });

          it('if isDayBlocked(day) is false calls deleteModifier with day and `blocked-calendar`', () => {
            const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
            const isDayBlockedStub = sinon.stub().returns(false);
            const wrapper = shallow(<DayPickerRangeController {...props} />);
            wrapper.setState({ visibleDays });
            wrapper.instance().componentWillReceiveProps({
              ...props,
              focusedInput: END_DATE,
              isDayBlocked: isDayBlockedStub,
            });
            const blockedCalendarCalls = getCallsByModifier(deleteModifierSpy, 'blocked-calendar');
            expect(blockedCalendarCalls.length).to.equal(numVisibleDays);
          });
        });
      });

      describe('highlighted-calendar', () => {
        describe('focusedInput did not change', () => {
          it('does not call isDayHighlighted', () => {
            const isDayHighlightedStub = sinon.stub();
            const wrapper = shallow(<DayPickerRangeController
              {...props}
              isDayHighlighted={isDayHighlightedStub}
            />);
            const prevCallCount = isDayHighlightedStub.callCount;
            wrapper.instance().componentWillReceiveProps({
              ...props,
              isDayHighlighted: isDayHighlightedStub,
            });
            expect(isDayHighlightedStub.callCount).to.equal(prevCallCount);
          });

          it('calls isDayHighlighted if changed', () => {
            const isDayHighlightedStub = sinon.stub();
            const wrapper = shallow(<DayPickerRangeController {...props} />);
            wrapper.instance().componentWillReceiveProps({
              ...props,
              isDayHighlighted: isDayHighlightedStub,
            });
            expect(isDayHighlightedStub.callCount).to.not.equal(0);
          });
        });

        describe('focusedInput changed', () => {
          const numVisibleDays = 3;
          let visibleDays;
          beforeEach(() => {
            const startOfMonth = today.clone().startOf('month');
            visibleDays = {
              [toISOMonthString(startOfMonth)]: {
                [toISODateString(startOfMonth)]: new Set(),
                [toISODateString(startOfMonth.clone().add(1, 'day'))]: new Set(),
                [toISODateString(startOfMonth.clone().add(2, 'days'))]: new Set(),
              },
            };
          });

          it('calls isDayHighlighted for every visible day', () => {
            const isDayHighlightedStub = sinon.stub();
            const wrapper = shallow(<DayPickerRangeController {...props} />);
            wrapper.setState({ visibleDays });
            wrapper.instance().componentWillReceiveProps({
              ...props,
              focusedInput: END_DATE,
              isDayHighlighted: isDayHighlightedStub,
            });
            expect(isDayHighlightedStub.callCount).to.equal(numVisibleDays);
          });

          it('if isDayHighlighted(day) is true calls addModifier with day and `highlighted-calendar`', () => {
            const addModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifier');
            const isDayHighlightedStub = sinon.stub().returns(true);
            const wrapper = shallow(<DayPickerRangeController {...props} />);
            wrapper.setState({ visibleDays });
            wrapper.instance().componentWillReceiveProps({
              ...props,
              focusedInput: END_DATE,
              isDayHighlighted: isDayHighlightedStub,
            });
            const highlightedCalendarCalls = getCallsByModifier(addModifierSpy, 'highlighted-calendar');
            expect(highlightedCalendarCalls.length).to.equal(numVisibleDays);
          });

          it('if isDayHighlighted(day) is false calls deleteModifier with day and `highlighted-calendar`', () => {
            const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
            const isDayHighlightedStub = sinon.stub().returns(false);
            const wrapper = shallow(<DayPickerRangeController {...props} />);
            wrapper.setState({ visibleDays });
            wrapper.instance().componentWillReceiveProps({
              ...props,
              focusedInput: END_DATE,
              isDayHighlighted: isDayHighlightedStub,
            });
            const highlightedCalendarCalls = getCallsByModifier(deleteModifierSpy, 'highlighted-calendar');
            expect(highlightedCalendarCalls.length).to.equal(numVisibleDays);
          });
        });
      });

      describe('today', () => {
        describe('this.today matches today', () => {
          it('does not call deleteModifier with `today`', () => {
            const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
            const wrapper = shallow(<DayPickerRangeController {...props} />);
            wrapper.instance().today = today;
            wrapper.instance().componentWillReceiveProps(props);
            const todayCalls = getCallsByModifier(deleteModifierSpy, 'today');
            expect(todayCalls.length).to.equal(0);
          });

          it('does not call addModifier with `today`', () => {
            const addModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifier');
            const wrapper = shallow(<DayPickerRangeController {...props} />);
            wrapper.instance().today = today;
            wrapper.instance().componentWillReceiveProps(props);
            const todayCalls = getCallsByModifier(addModifierSpy, 'today');
            expect(todayCalls.length).to.equal(0);
          });
        });

        describe('this.today is no longer today', () => {
          it('calls deleteModifier with this.today and `today` modifier', () => {
            const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
            const wrapper = shallow(<DayPickerRangeController {...props} />);
            wrapper.instance().today = moment().subtract(1, 'day');
            wrapper.instance().componentWillReceiveProps(props);
            const todayCalls = getCallsByModifier(deleteModifierSpy, 'today');
            expect(todayCalls.length).to.equal(1);
          });

          it('calls addModifier with new today and `today` modifiers', () => {
            const addModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifier');
            const wrapper = shallow(<DayPickerRangeController {...props} />);
            wrapper.instance().today = moment().subtract(1, 'day');
            wrapper.instance().componentWillReceiveProps(props);
            const todayCalls = getCallsByModifier(addModifierSpy, 'today');
            expect(todayCalls.length).to.equal(1);
          });
        });
      });

      describe('hovered-start-blocked-minimum-nights', () => {
        describe('focusedInput did not change', () => {
          it('does not call getMinNightsForHoverDate', () => {
            const getMinNightsForHoverDateStub = sinon.stub();
            const wrapper = shallow(<DayPickerRangeController
              {...props}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
            />);
            wrapper.instance().componentWillReceiveProps({
              ...props,
              getMinNightsForHoverDate: getMinNightsForHoverDateStub,
            });
            expect(getMinNightsForHoverDateStub.callCount).to.equal(0);
          });
        });

        describe('focusedInput did change', () => {
          it('does not call getMinNightsForHoverDate when there is no hoverDate state', () => {
            const getMinNightsForHoverDateStub = sinon.stub();
            const wrapper = shallow(<DayPickerRangeController
              {...props}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
            />);
            wrapper.instance().componentWillReceiveProps({
              ...props,
              focusedInput: START_DATE,
              getMinNightsForHoverDate: getMinNightsForHoverDateStub,
            });
            expect(getMinNightsForHoverDateStub.callCount).to.equal(0);
          });

          it('calls getMinNightsForHoverDate when there is hoverDate state', () => {
            const getMinNightsForHoverDateStub = sinon.stub();
            const wrapper = shallow(<DayPickerRangeController
              {...props}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
            />);
            wrapper.setState({ hoverDate: today });
            wrapper.instance().componentWillReceiveProps({
              ...props,
              focusedInput: START_DATE,
              getMinNightsForHoverDate: getMinNightsForHoverDateStub,
            });
            expect(getMinNightsForHoverDateStub.callCount).to.equal(1);
          });

          describe('focusedInput === START_DATE', () => {
            it('calls addModifierToRange with `hovered-start-blocked-minimum-nights` if getMinNightsForHoverDate returns a positive integer', () => {
              const addModifierToRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifierToRange');
              const getMinNightsForHoverDateStub = sinon.stub().returns(2);
              const wrapper = shallow(<DayPickerRangeController
                {...props}
                getMinNightsForHoverDate={getMinNightsForHoverDateStub}
              />);
              wrapper.setState({ hoverDate: today });
              wrapper.instance().componentWillReceiveProps({
                ...props,
                focusedInput: START_DATE,
                getMinNightsForHoverDate: getMinNightsForHoverDateStub,
              });
              const hoveredStartBlockedMinNightsCalls = getCallsByModifier(addModifierToRangeSpy, 'hovered-start-blocked-minimum-nights');
              expect(hoveredStartBlockedMinNightsCalls.length).to.equal(1);
              expect(isSameDay(hoveredStartBlockedMinNightsCalls[0].args[1], today.clone().add(1, 'days'))).to.equal(true);
              expect(isSameDay(hoveredStartBlockedMinNightsCalls[0].args[2], today.clone().add(2, 'days'))).to.equal(true);
            });

            it('does not call addModifierToRange with `hovered-start-blocked-minimum-nights` if the hovered date is blocked', () => {
              const addModifierToRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifierToRange');
              const getMinNightsForHoverDateStub = sinon.stub().returns(2);
              const wrapper = shallow(
                <DayPickerRangeController
                  {...props}
                  getMinNightsForHoverDate={getMinNightsForHoverDateStub}
                  isDayBlocked={(day) => isSameDay(day, today)}
                />,
              );
              wrapper.setState({ hoverDate: today });
              wrapper.instance().componentWillReceiveProps({
                ...props,
                focusedInput: START_DATE,
                getMinNightsForHoverDate: getMinNightsForHoverDateStub,
              });
              const hoveredStartBlockedMinNightsCalls = getCallsByModifier(addModifierToRangeSpy, 'hovered-start-blocked-minimum-nights');
              expect(hoveredStartBlockedMinNightsCalls.length).to.equal(0);
            });

            it('does not call addModifierToRange with `hovered-start-blocked-minimum-nights` if getMinNightsForHoverDate does not return a positive integer', () => {
              const addModifierToRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifierToRange');
              const getMinNightsForHoverDateStub = sinon.stub().returns(0);
              const wrapper = shallow(<DayPickerRangeController
                {...props}
                getMinNightsForHoverDate={getMinNightsForHoverDateStub}
              />);
              wrapper.setState({ hoverDate: today });
              wrapper.instance().componentWillReceiveProps({
                ...props,
                focusedInput: START_DATE,
                getMinNightsForHoverDate: getMinNightsForHoverDateStub,
              });
              const hoveredStartBlockedMinNightsCalls = getCallsByModifier(addModifierToRangeSpy, 'hovered-start-blocked-minimum-nights');
              expect(hoveredStartBlockedMinNightsCalls.length).to.equal(0);
            });

            it('does not call addModifierToRange with `hovered-start-blocked-minimum-nights` if getMinNightsForHoverDate is not supplied as a prop', () => {
              const addModifierToRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifierToRange');
              const wrapper = shallow(<DayPickerRangeController
                {...props}
              />);
              wrapper.setState({ hoverDate: today });
              wrapper.instance().componentWillReceiveProps({
                ...props,
                focusedInput: START_DATE,
              });
              const hoveredStartBlockedMinNightsCalls = getCallsByModifier(addModifierToRangeSpy, 'hovered-start-blocked-minimum-nights');
              expect(hoveredStartBlockedMinNightsCalls.length).to.equal(0);
            });
          });

          describe('focusedInput === END_DATE', () => {
            it('calls deleteModifierFromRange with `hovered-start-blocked-minimum-nights` if getMinNightsForHoverDate returns a positive integer', () => {
              const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
              const getMinNightsForHoverDateStub = sinon.stub().returns(2);
              const wrapper = shallow(<DayPickerRangeController
                {...props}
                getMinNightsForHoverDate={getMinNightsForHoverDateStub}
              />);
              wrapper.setState({ hoverDate: today });
              wrapper.instance().componentWillReceiveProps({
                ...props,
                focusedInput: END_DATE,
                getMinNightsForHoverDate: getMinNightsForHoverDateStub,
              });
              const hoveredStartBlockedMinNightsCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'hovered-start-blocked-minimum-nights');
              expect(hoveredStartBlockedMinNightsCalls.length).to.equal(1);
              expect(isSameDay(hoveredStartBlockedMinNightsCalls[0].args[1], today.clone().add(1, 'days'))).to.equal(true);
              expect(isSameDay(hoveredStartBlockedMinNightsCalls[0].args[2], today.clone().add(2, 'days'))).to.equal(true);
            });

            it('does not call deleteModifierFromRange with `hovered-start-blocked-minimum-nights` if the hovered date is blocked', () => {
              const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
              const getMinNightsForHoverDateStub = sinon.stub().returns(2);
              const wrapper = shallow(
                <DayPickerRangeController
                  {...props}
                  getMinNightsForHoverDate={getMinNightsForHoverDateStub}
                  isDayBlocked={(day) => isSameDay(day, today)}
                />,
              );
              wrapper.setState({ hoverDate: today });
              wrapper.instance().componentWillReceiveProps({
                ...props,
                focusedInput: START_DATE,
                getMinNightsForHoverDate: getMinNightsForHoverDateStub,
              });
              const hoveredStartBlockedMinNightsCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'hovered-start-blocked-minimum-nights');
              expect(hoveredStartBlockedMinNightsCalls.length).to.equal(0);
            });

            it('does not call deleteModifierFromRange with `hovered-start-blocked-minimum-nights` if getMinNightsForHoverDate does not return a positive integer', () => {
              const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
              const getMinNightsForHoverDateStub = sinon.stub().returns(0);
              const wrapper = shallow(<DayPickerRangeController
                {...props}
                getMinNightsForHoverDate={getMinNightsForHoverDateStub}
              />);
              wrapper.setState({ hoverDate: today });
              wrapper.instance().componentWillReceiveProps({
                ...props,
                focusedInput: END_DATE,
                getMinNightsForHoverDate: getMinNightsForHoverDateStub,
              });
              const hoveredStartBlockedMinNightsCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'hovered-start-blocked-minimum-nights');
              expect(hoveredStartBlockedMinNightsCalls.length).to.equal(0);
            });

            it('does not call deleteModifierFromRange with `hovered-start-blocked-minimum-nights` if getMinNightsForHoverDate is not supplied as a prop', () => {
              const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
              const wrapper = shallow(<DayPickerRangeController
                {...props}
              />);
              wrapper.setState({ hoverDate: today });
              wrapper.instance().componentWillReceiveProps({
                ...props,
                focusedInput: END_DATE,
              });
              const hoveredStartBlockedMinNightsCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'hovered-start-blocked-minimum-nights');
              expect(hoveredStartBlockedMinNightsCalls.length).to.equal(0);
            });
          });
        });
      });

      describe('hovered-start-first-possible-end', () => {
        describe('focusedInput did not change', () => {
          it('does not call getMinNightsForHoverDate', () => {
            const getMinNightsForHoverDateStub = sinon.stub();
            const wrapper = shallow(<DayPickerRangeController
              {...props}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
            />);
            wrapper.instance().componentWillReceiveProps({
              ...props,
              getMinNightsForHoverDate: getMinNightsForHoverDateStub,
            });
            expect(getMinNightsForHoverDateStub.callCount).to.equal(0);
          });
        });

        describe('focusedInput did change', () => {
          it('does not call getMinNightsForHoverDate when there is no hoverDate state', () => {
            const getMinNightsForHoverDateStub = sinon.stub();
            const wrapper = shallow(<DayPickerRangeController
              {...props}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
            />);
            wrapper.instance().componentWillReceiveProps({
              ...props,
              focusedInput: START_DATE,
              getMinNightsForHoverDate: getMinNightsForHoverDateStub,
            });
            expect(getMinNightsForHoverDateStub.callCount).to.equal(0);
          });

          it('calls getMinNightsForHoverDate when there is hoverDate state', () => {
            const getMinNightsForHoverDateStub = sinon.stub();
            const wrapper = shallow(<DayPickerRangeController
              {...props}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
            />);
            wrapper.setState({ hoverDate: today });
            wrapper.instance().componentWillReceiveProps({
              ...props,
              focusedInput: START_DATE,
              getMinNightsForHoverDate: getMinNightsForHoverDateStub,
            });
            expect(getMinNightsForHoverDateStub.callCount).to.equal(1);
          });

          describe('focusedInput === START_DATE', () => {
            it('calls addModifier with `hovered-start-first-possible-end` if getMinNightsForHoverDate returns a positive integer', () => {
              const addModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifier');
              const getMinNightsForHoverDateStub = sinon.stub().returns(2);
              const wrapper = shallow(<DayPickerRangeController
                {...props}
                getMinNightsForHoverDate={getMinNightsForHoverDateStub}
              />);
              wrapper.setState({ hoverDate: today });
              wrapper.instance().componentWillReceiveProps({
                ...props,
                focusedInput: START_DATE,
                getMinNightsForHoverDate: getMinNightsForHoverDateStub,
              });
              const hoveredStartFirstPossibleEndCalls = getCallsByModifier(addModifierSpy, 'hovered-start-first-possible-end');
              expect(hoveredStartFirstPossibleEndCalls.length).to.equal(1);
              expect(isSameDay(hoveredStartFirstPossibleEndCalls[0].args[1], today.clone().add(2, 'days'))).to.equal(true);
            });

            it('does not call addModifierToRange with `hovered-start-first-possible-end` if the hovered date is blocked', () => {
              const addModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifier');
              const getMinNightsForHoverDateStub = sinon.stub().returns(2);
              const wrapper = shallow(
                <DayPickerRangeController
                  {...props}
                  getMinNightsForHoverDate={getMinNightsForHoverDateStub}
                  isDayBlocked={(day) => isSameDay(day, today)}
                />,
              );
              wrapper.setState({ hoverDate: today });
              wrapper.instance().componentWillReceiveProps({
                ...props,
                focusedInput: START_DATE,
                getMinNightsForHoverDate: getMinNightsForHoverDateStub,
              });
              const hoveredStartFirstPossibleEndCalls = getCallsByModifier(addModifierSpy, 'hovered-start-first-possible-end');
              expect(hoveredStartFirstPossibleEndCalls.length).to.equal(0);
            });

            it('does not call addModifier with `hovered-start-first-possible-end` if getMinNightsForHoverDate does not return a positive integer', () => {
              const addModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifier');
              const getMinNightsForHoverDateStub = sinon.stub().returns(0);
              const wrapper = shallow(<DayPickerRangeController
                {...props}
                getMinNightsForHoverDate={getMinNightsForHoverDateStub}
              />);
              wrapper.setState({ hoverDate: today });
              wrapper.instance().componentWillReceiveProps({
                ...props,
                focusedInput: START_DATE,
                getMinNightsForHoverDate: getMinNightsForHoverDateStub,
              });
              const hoveredStartFirstPossibleEndCalls = getCallsByModifier(addModifierSpy, 'hovered-start-first-possible-end');
              expect(hoveredStartFirstPossibleEndCalls.length).to.equal(0);
            });

            it('does not call addModifier with `hovered-start-first-possible-end` if getMinNightsForHoverDate is not supplied as a prop', () => {
              const addModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifier');
              const wrapper = shallow(<DayPickerRangeController
                {...props}
              />);
              wrapper.setState({ hoverDate: today });
              wrapper.instance().componentWillReceiveProps({
                ...props,
                focusedInput: START_DATE,
              });
              const hoveredStartFirstPossibleEndCalls = getCallsByModifier(addModifierSpy, 'hovered-start-first-possible-end');
              expect(hoveredStartFirstPossibleEndCalls.length).to.equal(0);
            });
          });

          describe('focusedInput === END_DATE', () => {
            it('calls deleteModifier with `hovered-start-first-possible-end` if getMinNightsForHoverDate returns a positive integer', () => {
              const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
              const getMinNightsForHoverDateStub = sinon.stub().returns(2);
              const wrapper = shallow(<DayPickerRangeController
                {...props}
                getMinNightsForHoverDate={getMinNightsForHoverDateStub}
              />);
              wrapper.setState({ hoverDate: today });
              wrapper.instance().componentWillReceiveProps({
                ...props,
                focusedInput: END_DATE,
                getMinNightsForHoverDate: getMinNightsForHoverDateStub,
              });
              const hoveredStartFirstPossibleEndCalls = getCallsByModifier(deleteModifierSpy, 'hovered-start-first-possible-end');
              expect(hoveredStartFirstPossibleEndCalls.length).to.equal(1);
              expect(isSameDay(hoveredStartFirstPossibleEndCalls[0].args[1], today.clone().add(2, 'days'))).to.equal(true);
            });

            it('does not call deleteModifierFromRange with `hovered-start-first-possible-end` if the hovered date is blocked', () => {
              const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
              const getMinNightsForHoverDateStub = sinon.stub().returns(2);
              const wrapper = shallow(
                <DayPickerRangeController
                  {...props}
                  getMinNightsForHoverDate={getMinNightsForHoverDateStub}
                  isDayBlocked={(day) => isSameDay(day, today)}
                />,
              );
              wrapper.setState({ hoverDate: today });
              wrapper.instance().componentWillReceiveProps({
                ...props,
                focusedInput: START_DATE,
                getMinNightsForHoverDate: getMinNightsForHoverDateStub,
              });
              const hoveredStartFirstPossibleEndCalls = getCallsByModifier(deleteModifierSpy, 'hovered-start-first-possible-end');
              expect(hoveredStartFirstPossibleEndCalls.length).to.equal(0);
            });

            it('does not call deleteModifierFromRange with `hovered-start-first-possible-end` if getMinNightsForHoverDate does not return a positive integer', () => {
              const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
              const getMinNightsForHoverDateStub = sinon.stub().returns(0);
              const wrapper = shallow(<DayPickerRangeController
                {...props}
                getMinNightsForHoverDate={getMinNightsForHoverDateStub}
              />);
              wrapper.setState({ hoverDate: today });
              wrapper.instance().componentWillReceiveProps({
                ...props,
                focusedInput: END_DATE,
                getMinNightsForHoverDate: getMinNightsForHoverDateStub,
              });
              const hoveredStartFirstPossibleEndCalls = getCallsByModifier(deleteModifierSpy, 'hovered-start-first-possible-end');
              expect(hoveredStartFirstPossibleEndCalls.length).to.equal(0);
            });

            it('does not call deleteModifier with `hovered-start-first-possible-end` if getMinNightsForHoverDate is not supplied as a prop', () => {
              const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
              const wrapper = shallow(<DayPickerRangeController
                {...props}
              />);
              wrapper.setState({ hoverDate: today });
              wrapper.instance().componentWillReceiveProps({
                ...props,
                focusedInput: END_DATE,
              });
              const hoveredStartFirstPossibleEndCalls = getCallsByModifier(deleteModifierSpy, 'hovered-start-first-possible-end');
              expect(hoveredStartFirstPossibleEndCalls.length).to.equal(0);
            });
          });
        });
      });

      describe('no-selected-start-before-selected-end', () => {
        describe('start or end date has changed, start date is falsey, and end date is truthy', () => {
          it('calls addModifier with `no-selected-start-before-selected-end` if day is before selected end date', () => {
            const addModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifier');
            const widget_date_to = today.clone();
            const wrapper = shallow(
              <DayPickerRangeController
                {...props}
                widget_date={null}
                widget_date_to={widget_date_to}
              />,
            );
            const newwidget_date_to = widget_date_to.clone().add(1, 'days');
            wrapper.instance().componentWillReceiveProps({
              ...props,
              widget_date_to: newwidget_date_to,
            });
            const noSelectedStartBeforeSelectedEndCalls = getCallsByModifier(addModifierSpy, 'no-selected-start-before-selected-end');
            noSelectedStartBeforeSelectedEndCalls.forEach((eachCall) => {
              const day = eachCall.args[1];

              expect(isBeforeDay(day, newwidget_date_to)).to.equal(true);
            });
          });
        });

        describe('start date has changed, previous start date is falsey, start and end date is truthy', () => {
          it('calls deleteModifier with `no-selected-start-before-selected-end` if day is before selected end date', () => {
            const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
            const widget_date_to = today.clone().add(10, 'days');
            const wrapper = shallow(
              <DayPickerRangeController
                {...props}
                widget_date={null}
                widget_date_to={widget_date_to}
              />,
            );
            const newwidget_date = today;
            const { visibleDays } = wrapper.instance().state;
            const numberOfVisibleDays = Object.values(visibleDays).reduce(
              (total, visibleDayArray) => total + Object.keys(visibleDayArray).length,
              0,
            );
            wrapper.instance().componentWillReceiveProps({
              ...props,
              widget_date_to,
              widget_date: newwidget_date,
            });
            const noSelectedStartBeforeSelectedEndCalls = getCallsByModifier(deleteModifierSpy, 'no-selected-start-before-selected-end');
            expect(noSelectedStartBeforeSelectedEndCalls.length).to.equal(numberOfVisibleDays);
          });
        });
      });

      describe('selected-start-no-selected-end', () => {
        describe('start date is truthy, and end date is falsey', () => {
          it('calls addModifier with `selected-start-no-selected-end`', () => {
            const addModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifier');
            const wrapper = shallow(<DayPickerRangeController {...props} />);
            const widget_date = moment();
            wrapper.instance().componentWillReceiveProps({ ...props, widget_date });
            const selectedStartNoSelectedEndCalls = getCallsByModifier(addModifierSpy, 'selected-start-no-selected-end');
            expect(selectedStartNoSelectedEndCalls.length).to.equal(1);
            expect(selectedStartNoSelectedEndCalls[0].args[1]).to.equal(widget_date);
          });
        });

        describe('start date has changed, and end date or previous end date are falsey', () => {
          it('calls deleteModifier with `selected-start-no-selected-end`', () => {
            const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
            const widget_date = moment();
            const wrapper = shallow(<DayPickerRangeController {...props} widget_date={widget_date} />);
            const newwidget_date = widget_date.clone().add(1, 'days');
            wrapper.instance().componentWillReceiveProps({ ...props, widget_date: newwidget_date });
            const selectedStartNoSelectedEndCalls = getCallsByModifier(deleteModifierSpy, 'selected-start-no-selected-end');
            expect(selectedStartNoSelectedEndCalls.length).to.equal(1);
            expect(selectedStartNoSelectedEndCalls[0].args[1]).to.equal(widget_date);
          });
        });
      });

      describe('selected-end-no-selected-start', () => {
        describe('end date is truthy, and start date is falsey', () => {
          it('calls addModifier with `selected-end-no-selected-start`', () => {
            const addModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifier');
            const wrapper = shallow(<DayPickerRangeController {...props} />);
            const widget_date_to = moment();
            wrapper.instance().componentWillReceiveProps({ ...props, widget_date_to });
            const selectedStartNoSelectedEndCalls = getCallsByModifier(addModifierSpy, 'selected-end-no-selected-start');
            expect(selectedStartNoSelectedEndCalls.length).to.equal(1);
            expect(selectedStartNoSelectedEndCalls[0].args[1]).to.equal(widget_date_to);
          });
        });

        describe('end date has changed, and start date or previous start date are falsey', () => {
          it('calls deleteModifier with `selected-end-no-selected-start`', () => {
            const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
            const widget_date_to = moment();
            const wrapper = shallow(<DayPickerRangeController {...props} widget_date_to={widget_date_to} />);
            const newwidget_date_to = widget_date_to.clone().add(1, 'days');
            wrapper.instance().componentWillReceiveProps({ ...props, widget_date_to: newwidget_date_to });
            const selectedStartNoSelectedEndCalls = getCallsByModifier(deleteModifierSpy, 'selected-end-no-selected-start');
            expect(selectedStartNoSelectedEndCalls.length).to.equal(1);
            expect(selectedStartNoSelectedEndCalls[0].args[1]).to.equal(widget_date_to);
          });
        });

        describe('start date has changed, and start date is truthy, and previous start date was falsey', () => {
          it('calls deleteModifier with `selected-end-no-selected-start`', () => {
            const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
            const widget_date_to = moment();
            const wrapper = shallow(<DayPickerRangeController {...props} widget_date_to={widget_date_to} />);
            const newwidget_date = widget_date_to.clone().subtract(1, 'days');
            wrapper.instance().componentWillReceiveProps({ ...props, widget_date: newwidget_date });
            const selectedStartNoSelectedEndCalls = getCallsByModifier(deleteModifierSpy, 'selected-end-no-selected-start');
            expect(selectedStartNoSelectedEndCalls.length).to.equal(1);
            expect(selectedStartNoSelectedEndCalls[0].args[1]).to.equal(widget_date_to);
          });
        });
      });

      describe('before-hovered-end', () => {
        describe('end date changed, end date is truthy and start date is falsey', () => {
          it('calls addModifierToRange with `before-hovered-end`', () => {
            const minimumNights = 1;
            const addModifierToRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifierToRange');
            const widget_date_to = moment();
            const wrapper = shallow(
              <DayPickerRangeController
                {...props}
                minimumNights={minimumNights}
                widget_date_to={widget_date_to}
              />,
            );
            const newwidget_date_to = widget_date_to.clone().add(1, 'days');
            addModifierToRangeSpy.resetHistory();
            wrapper.instance().componentWillReceiveProps({ ...props, widget_date_to: newwidget_date_to });
            const beforeHoveredEndCalls = getCallsByModifier(addModifierToRangeSpy, 'before-hovered-end');
            expect(beforeHoveredEndCalls.length).to.equal(1);
            expect(toISODateString(beforeHoveredEndCalls[0].args[1])).to.equal(
              toISODateString(newwidget_date_to.clone().subtract(minimumNights, 'days')),
            );
            expect(toISODateString(beforeHoveredEndCalls[0].args[2])).to.equal(
              toISODateString(newwidget_date_to),
            );
          });
        });
      });

      describe('selected-end-in-hovered-span', () => {
        describe('start date has changed', () => {
          describe('start and end date are truthy, and previous start date is falsey', () => {
            it('calls deleteModifier with `selected-end-in-hovered-span`', () => {
              const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
              const widget_date_to = today;
              const wrapper = shallow(
                <DayPickerRangeController
                  {...props}
                  widget_date_to={widget_date_to}
                />,
              );
              const newwidget_date = widget_date_to.clone().subtract(3, 'days');
              deleteModifierSpy.resetHistory();
              wrapper.instance().componentWillReceiveProps({
                ...props,
                widget_date_to,
                widget_date: newwidget_date,
              });
              const deleteModifierCalls = getCallsByModifier(deleteModifierSpy, 'selected-end-in-hovered-span');
              expect(deleteModifierCalls.length).to.equal(1);
              expect(deleteModifierCalls[0].args[1]).to.equal(widget_date_to);
            });
          });
        });
      });
    });

    describe('phrases', () => {
      const phrases = {
        chooseAvailableDate: 'test1',
        chooseAvailablewidget_date: 'test2',
        chooseAvailablewidget_date_to: 'test3',
      };

      describe('neither props.focusedInput nor props.phrases have changed', () => {
        it('state.phrases does not change', () => {
          const phrasesObject = { hello: 'world' };
          const wrapper = shallow(<DayPickerRangeController
            {...props}
            phrases={phrases}
          />);
          wrapper.setState({ phrases: phrasesObject });
          wrapper.instance().componentWillReceiveProps({ ...props, phrases });
          expect(wrapper.state().phrases).to.equal(phrasesObject);
        });
      });

      describe('props.focusedInput has changed', () => {
        describe('new focusedInput is START_DATE', () => {
          it('state.phrases.chooseAvailableDate equals props.phrases.chooseAvailablewidget_date', () => {
            const wrapper = shallow(<DayPickerRangeController
              {...props}
              phrases={phrases}
            />);
            wrapper.setState({ phrases: {} });
            wrapper.instance().componentWillReceiveProps({
              ...props,
              focusedInput: START_DATE,
              phrases,
            });
            const newAvailableDatePhrase = wrapper.state().phrases.chooseAvailableDate;
            expect(newAvailableDatePhrase).to.equal(phrases.chooseAvailablewidget_date);
          });
        });

        describe('new focusedInput is END_DATE', () => {
          it('state.phrases.chooseAvailableDate equals props.phrases.chooseAvailablewidget_date_to', () => {
            const wrapper = shallow(<DayPickerRangeController
              {...props}
              phrases={phrases}
            />);
            wrapper.setState({ phrases: {} });
            wrapper.instance().componentWillReceiveProps({
              ...props,
              focusedInput: END_DATE,
              phrases,
            });
            const newAvailableDatePhrase = wrapper.state().phrases.chooseAvailableDate;
            expect(newAvailableDatePhrase).to.equal(phrases.chooseAvailablewidget_date_to);
          });
        });

        describe('new focusedInput is null', () => {
          it('state.phrases.chooseAvailableDate equals props.phrases.chooseAvailableDate', () => {
            const wrapper = shallow(<DayPickerRangeController
              {...props}
              focusedInput={START_DATE}
              phrases={phrases}
            />);
            wrapper.setState({ phrases: {} });
            wrapper.instance().componentWillReceiveProps({
              ...props,
              phrases,
            });
            const newAvailableDatePhrase = wrapper.state().phrases.chooseAvailableDate;
            expect(newAvailableDatePhrase).to.equal(phrases.chooseAvailableDate);
          });
        });
      });

      describe('props.phrases has changed', () => {
        describe('focusedInput is START_DATE', () => {
          it('state.phrases.chooseAvailableDate equals props.phrases.chooseAvailablewidget_date', () => {
            const wrapper = shallow(<DayPickerRangeController
              {...props}
              focusedInput={START_DATE}
              phrases={{}}
            />);
            wrapper.setState({ phrases: {} });
            wrapper.instance().componentWillReceiveProps({
              ...props,
              focusedInput: START_DATE,
              phrases,
            });
            const newAvailableDatePhrase = wrapper.state().phrases.chooseAvailableDate;
            expect(newAvailableDatePhrase).to.equal(phrases.chooseAvailablewidget_date);
          });
        });

        describe('focusedInput is END_DATE', () => {
          it('state.phrases.chooseAvailableDate equals props.phrases.chooseAvailablewidget_date_to', () => {
            const wrapper = shallow(<DayPickerRangeController
              {...props}
              focusedInput={END_DATE}
              phrases={{}}
            />);
            wrapper.setState({ phrases: {} });
            wrapper.instance().componentWillReceiveProps({
              ...props,
              focusedInput: END_DATE,
              phrases,
            });
            const newAvailableDatePhrase = wrapper.state().phrases.chooseAvailableDate;
            expect(newAvailableDatePhrase).to.equal(phrases.chooseAvailablewidget_date_to);
          });
        });

        describe('focusedInput is null', () => {
          it('state.phrases.chooseAvailableDate equals props.phrases.chooseAvailableDate', () => {
            const wrapper = shallow(<DayPickerRangeController
              {...props}
              phrases={{}}
            />);
            wrapper.setState({ phrases: {} });
            wrapper.instance().componentWillReceiveProps({ ...props, phrases });
            const newAvailableDatePhrase = wrapper.state().phrases.chooseAvailableDate;
            expect(newAvailableDatePhrase).to.equal(phrases.chooseAvailableDate);
          });
        });
      });
    });
  });

  describe('#onDayClick', () => {
    describe('day argument is a blocked day', () => {
      it('props.onFocusChange is not called', () => {
        const onFocusChangeStub = sinon.stub();
        const wrapper = shallow(<DayPickerRangeController
          onFocusChange={onFocusChangeStub}
          isDayBlocked={() => true}
        />);
        wrapper.instance().onDayClick(today);
        expect(onFocusChangeStub.callCount).to.equal(0);
      });

      it('props.onDatesChange is not called', () => {
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow(<DayPickerRangeController
          onDatesChange={onDatesChangeStub}
          isDayBlocked={() => true}
        />);
        wrapper.instance().onDayClick(today);
        expect(onDatesChangeStub.callCount).to.equal(0);
      });
    });

    describe('daysViolatingMinNightsCanBeClicked is true', () => {
      it('props.onDatesChange is called and props.onFocusChange is not called when the day does not meet min nights', () => {
        const onFocusChangeStub = sinon.stub();
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow(<DayPickerRangeController
          daysViolatingMinNightsCanBeClicked
          focusedInput={END_DATE}
          minimumNights={3}
          onFocusChange={onFocusChangeStub}
          onDatesChange={onDatesChangeStub}
          widget_date={today}
        />);
        wrapper.instance().onDayClick(today.clone().add(1, 'days'));
        expect(onFocusChangeStub.callCount).to.equal(0);
        expect(onDatesChangeStub.callCount).to.equal(1);
      });
    });

    describe('props.focusedInput === START_DATE', () => {
      describe('props.onFocusChange', () => {
        it('is called once', () => {
          const onFocusChangeStub = sinon.stub();
          const wrapper = shallow(<DayPickerRangeController
            focusedInput={START_DATE}
            onFocusChange={onFocusChangeStub}
          />);
          wrapper.instance().onDayClick(today);
          expect(onFocusChangeStub.callCount).to.equal(1);
        });

        it('is called with END_DATE', () => {
          const onFocusChangeStub = sinon.stub();
          const wrapper = shallow(<DayPickerRangeController
            focusedInput={START_DATE}
            onFocusChange={onFocusChangeStub}
          />);
          wrapper.instance().onDayClick(today);
          expect(onFocusChangeStub.getCall(0).args[0]).to.equal(END_DATE);
        });
      });

      it('calls props.onDatesChange', () => {
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DayPickerRangeController focusedInput={START_DATE} onDatesChange={onDatesChangeStub} />
        ));
        wrapper.instance().onDayClick(today);
        expect(onDatesChangeStub.callCount).to.equal(1);
      });

      describe('arg is after props.widget_date_to', () => {
        it('calls props.onDatesChange with widget_date === arg and widget_date_to === null', () => {
          const onDatesChangeStub = sinon.stub();
          const wrapper = shallow((
            <DayPickerRangeController
              focusedInput={START_DATE}
              widget_date_to={today}
              onDatesChange={onDatesChangeStub}
            />
          ));
          const tomorrow = moment(today).add(1, 'days');
          wrapper.instance().onDayClick(tomorrow);
          expect(onDatesChangeStub.calledWith({
            widget_date: tomorrow,
            widget_date_to: null,
          })).to.equal(true);
        });
      });

      describe('arg is before props.widget_date_to', () => {
        it('calls props.onDatesChange with widget_date === arg and widget_date_to === props.widget_date_to', () => {
          const onDatesChangeStub = sinon.stub();
          const tomorrow = moment(today).add(1, 'days');
          const wrapper = shallow((
            <DayPickerRangeController
              focusedInput={START_DATE}
              widget_date_to={tomorrow}
              onDatesChange={onDatesChangeStub}
            />
          ));
          wrapper.instance().onDayClick(today);
          expect(onDatesChangeStub.calledWith({
            widget_date: today,
            widget_date_to: tomorrow,
          })).to.equal(true);
        });
      });

      describe('props.widget_date_to is null', () => {
        it('calls props.onDatesChange with widget_date === arg and widget_date_to === null', () => {
          const onDatesChangeStub = sinon.stub();
          const wrapper = shallow((
            <DayPickerRangeController
              focusedInput={START_DATE}
              widget_date_to={null}
              onDatesChange={onDatesChangeStub}
            />
          ));
          wrapper.instance().onDayClick(today);
          expect(onDatesChangeStub.calledWith({
            widget_date: today,
            widget_date_to: null,
          })).to.equal(true);
        });
      });

      describe('minimumNights is 0', () => {
        it(
          'calls props.onDatesChange with widget_date === today and widget_date_to === today',
          () => {
            const onDatesChangeStub = sinon.stub();
            const wrapper = shallow((
              <DayPickerRangeController
                focusedInput={START_DATE}
                minimumNights={0}
                onDatesChange={onDatesChangeStub}
                widget_date_to={today}
              />
            ));
            wrapper.instance().onDayClick(today);
            expect(onDatesChangeStub.calledWith({
              widget_date: today,
              widget_date_to: today,
            })).to.equal(true);
          },
        );
      });
    });

    describe('props.focusedInput === END_DATE', () => {
      describe('arg is before props.widget_date', () => {
        it('calls props.onDatesChange with widget_date === arg and widget_date_to === null', () => {
          const onDatesChangeStub = sinon.stub();
          const wrapper = shallow((
            <DayPickerRangeController
              focusedInput={END_DATE}
              widget_date={moment(today).add(1, 'days')}
              onDatesChange={onDatesChangeStub}
            />
          ));
          wrapper.instance().onDayClick(today);
          const args = onDatesChangeStub.getCall(0).args[0];
          expect(args.widget_date).to.equal(today);
          expect(args.widget_date_to).to.equal(null);
        });
      });

      describe('arg is not before props.widget_date', () => {
        it(
          'calls props.onDatesChange with widget_date === props.widget_date and widget_date_to === arg',
          () => {
            const onDatesChangeStub = sinon.stub();
            const wrapper = shallow((
              <DayPickerRangeController
                focusedInput={END_DATE}
                onDatesChange={onDatesChangeStub}
              />
            ));
            wrapper.instance().onDayClick(today);
            const args = onDatesChangeStub.getCall(0).args[0];
            expect(args.widget_date).to.equal(wrapper.props().widget_date);
            expect(args.widget_date_to).to.equal(today);
          },
        );

        describe('props.onFocusChange', () => {
          describe('props.widget_date === null', () => {
            it('is called once', () => {
              const onFocusChangeStub = sinon.stub();
              const wrapper = shallow((
                <DayPickerRangeController
                  focusedInput={END_DATE}
                  onFocusChange={onFocusChangeStub}
                />
              ));
              wrapper.instance().onDayClick(today);
              expect(onFocusChangeStub.callCount).to.equal(1);
            });

            it('is called with START_DATE', () => {
              const onFocusChangeStub = sinon.stub();
              const wrapper = shallow((
                <DayPickerRangeController
                  focusedInput={END_DATE}
                  onFocusChange={onFocusChangeStub}
                />
              ));
              wrapper.instance().onDayClick(today);
              expect(onFocusChangeStub.getCall(0).args[0]).to.equal(START_DATE);
            });
          });

          describe('props.widget_date is truthy', () => {
            it('is called once', () => {
              const onFocusChangeStub = sinon.stub();
              const wrapper = shallow((
                <DayPickerRangeController
                  focusedInput={END_DATE}
                  widget_date={today}
                  onFocusChange={onFocusChangeStub}
                />
              ));
              wrapper.instance().onDayClick(moment(today).add(1, 'days'));
              expect(onFocusChangeStub.callCount).to.equal(1);
            });

            it('is called with null', () => {
              const onFocusChangeStub = sinon.stub();
              const wrapper = shallow((
                <DayPickerRangeController
                  focusedInput={END_DATE}
                  widget_date={today}
                  onFocusChange={onFocusChangeStub}
                />
              ));
              wrapper.instance().onDayClick(moment(today).add(1, 'days'));
              expect(onFocusChangeStub.getCall(0).args[0]).to.equal(null);
            });
          });
        });

        describe('props.onClose', () => {
          describe('props.widget_date is truthy', () => {
            it('is called with widget_date and widget_date_to', () => {
              const onCloseStub = sinon.stub();
              const wrapper = shallow((
                <DayPickerRangeController
                  focusedInput={END_DATE}
                  widget_date={today}
                  onClose={onCloseStub}
                />
              ));

              const widget_date_to = moment(today).add(1, 'days');

              wrapper.instance().onDayClick(widget_date_to);
              const args = onCloseStub.getCall(0).args[0];
              expect(args.widget_date).to.equal(today);
              expect(args.widget_date_to).to.equal(widget_date_to);
            });
          });
        });
      });

      describe('minimumNights is 0', () => {
        it(
          'calls props.onDatesChange with widget_date === today and widget_date_to === today',
          () => {
            const onDatesChangeStub = sinon.stub();
            const wrapper = shallow((
              <DayPickerRangeController
                focusedInput={END_DATE}
                minimumNights={0}
                onDatesChange={onDatesChangeStub}
                widget_date={today}
              />
            ));
            wrapper.instance().onDayClick(today);
            const args = onDatesChangeStub.getCall(0).args[0];
            expect(args.widget_date).to.equal(today);
            expect(args.widget_date_to).to.equal(today);
          },
        );
      });
    });

    describe('props.widget_dateOffset / props.widget_date_toOffset', () => {
      it('calls props.onDatesChange with widget_date === widget_dateOffset(date) and widget_date_to === widget_date_toOffset(date)', () => {
        const clickDate = moment(today).clone().add(2, 'days');
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DayPickerRangeController
            onDatesChange={onDatesChangeStub}
            widget_dateOffset={(day) => day.subtract(2, 'days')}
            widget_date_toOffset={(day) => day.add(4, 'days')}
          />
        ));
        wrapper.instance().onDayClick(clickDate);
        const args = onDatesChangeStub.getCall(0).args[0];
        expect(args.widget_date.format()).to.equal(clickDate.clone().subtract(2, 'days').format());
        expect(args.widget_date_to.format()).to.equal(clickDate.clone().add(4, 'days').format());
      });

      it('does not call props.onDatesChange with widget_date === widget_dateOffset(date) and widget_date_to === widget_date_toOffset(date)', () => {
        const clickDate = moment(today).clone().add(2, 'days');
        const onDatesChangeStub = sinon.spy();
        const wrapper = shallow((
          <DayPickerRangeController
            onDatesChange={onDatesChangeStub}
            widget_dateOffset={(day) => day.subtract(2, 'days')}
            widget_date_toOffset={(day) => day.add(4, 'days')}
            isOutsideRange={(day) => day.isAfter(moment(today))}
          />
        ));
        wrapper.instance().onDayClick(clickDate);
        expect(onDatesChangeStub).to.have.property('callCount', 0);
      });

      it('does not call props.onDatesChange when dateOffset isOutsideRange', () => {
        const clickDate = moment(today);
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DayPickerRangeController
            onDatesChange={onDatesChangeStub}
            widget_date_toOffset={(day) => day.add(5, 'days')}
            isOutsideRange={(day) => day.isAfter(moment(today).clone().add(1, 'days'))}
          />
        ));
        wrapper.instance().onDayClick(clickDate);
        expect(onDatesChangeStub).to.have.property('callCount', 0);
      });

      it('calls props.onDatesChange with widget_date === widget_dateOffset(date) and widget_date_to === selectedDate when widget_date_toOffset not provided', () => {
        const clickDate = moment(today).clone().add(2, 'days');
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DayPickerRangeController
            onDatesChange={onDatesChangeStub}
            widget_dateOffset={(day) => day.subtract(5, 'days')}
          />
        ));
        wrapper.instance().onDayClick(clickDate);
        const args = onDatesChangeStub.getCall(0).args[0];
        expect(args.widget_date.format()).to.equal(clickDate.clone().subtract(5, 'days').format());
        expect(args.widget_date_to.format()).to.equal(clickDate.format());
      });

      it('calls props.onDatesChange with widget_date === selectedDate and widget_date_to === widget_date_toOffset(date) when widget_dateOffset not provided', () => {
        const clickDate = moment(today).clone().add(12, 'days');
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DayPickerRangeController
            onDatesChange={onDatesChangeStub}
            widget_date_toOffset={(day) => day.add(12, 'days')}
          />
        ));
        wrapper.instance().onDayClick(clickDate);
        const args = onDatesChangeStub.getCall(0).args[0];
        expect(args.widget_date.format()).to.equal(clickDate.format());
        expect(args.widget_date_to.format()).to.equal(clickDate.clone().add(12, 'days').format());
      });
    });

    describe('props.onDatesChange only called once in onDayClick', () => {
      it('calls props.onDatesChange once when focusedInput === START_DATE', () => {
        const clickDate = moment(today);
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DayPickerRangeController
            onDatesChange={onDatesChangeStub}
            focusedInput={START_DATE}
            widget_date_to={null}
          />
        ));
        wrapper.instance().onDayClick(clickDate);
        expect(onDatesChangeStub).to.have.property('callCount', 1);
        const args = onDatesChangeStub.getCall(0).args[0];
        expect(args.widget_date.format()).to.equal(clickDate.clone().format());
        expect(args.widget_date_to).to.equal(null);
      });

      it('calls props.onDatesChange once when focusedInput === END_DATE and there is no widget_date', () => {
        const clickDate = moment(today);
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DayPickerRangeController
            onDatesChange={onDatesChangeStub}
            focusedInput={END_DATE}
            widget_date={null}
          />
        ));
        wrapper.instance().onDayClick(clickDate);
        expect(onDatesChangeStub).to.have.property('callCount', 1);
        const args = onDatesChangeStub.getCall(0).args[0];
        expect(args.widget_date).to.equal(null);
        expect(args.widget_date_to.format()).to.equal(clickDate.clone().format());
      });

      it('calls props.onDatesChange once when focusedInput === END_DATE and the day is a valid widget_date_to', () => {
        const clickDate = moment(today);
        const widget_date = clickDate.clone().subtract(2, 'days');
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DayPickerRangeController
            onDatesChange={onDatesChangeStub}
            focusedInput={END_DATE}
            minimumNights={2}
            widget_date={widget_date}
          />
        ));
        wrapper.instance().onDayClick(clickDate);
        expect(onDatesChangeStub).to.have.property('callCount', 1);
        const args = onDatesChangeStub.getCall(0).args[0];
        expect(args.widget_date.format()).to.equal(widget_date.clone().format());
        expect(args.widget_date_to.format()).to.equal(clickDate.clone().format());
      });

      it('calls props.onDatesChange once when focusedInput === END_DATE, the day is an invalid widget_date_to, and disabled !== START_DATE', () => {
        const clickDate = moment(today);
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DayPickerRangeController
            onDatesChange={onDatesChangeStub}
            focusedInput={END_DATE}
            minimumNights={2}
            widget_date={clickDate.clone().add(1, 'days')}
            widget_date_to={null}
          />
        ));
        wrapper.instance().onDayClick(clickDate);
        expect(onDatesChangeStub).to.have.property('callCount', 1);
        const args = onDatesChangeStub.getCall(0).args[0];
        expect(args.widget_date.format()).to.equal(clickDate.clone().format());
        expect(args.widget_date_to).to.equal(null);
      });

      it('calls props.onDatesChange once when focusedInput === END_DATE and the day is an invalid widget_date_to', () => {
        const clickDate = moment(today);
        const widget_date = clickDate.clone().add(1, 'days');
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DayPickerRangeController
            onDatesChange={onDatesChangeStub}
            focusedInput={END_DATE}
            disabled={START_DATE}
            minimumNights={2}
            widget_date={widget_date}
            widget_date_to={null}
          />
        ));
        wrapper.instance().onDayClick(clickDate);
        expect(onDatesChangeStub).to.have.property('callCount', 1);
        const args = onDatesChangeStub.getCall(0).args[0];
        expect(args.widget_date.format()).to.equal(widget_date.clone().format());
        expect(args.widget_date_to).to.equal(null);
      });

      it('calls props.onDatesChange once when there is a widget_dateOffset', () => {
        const clickDate = moment(today);
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DayPickerRangeController
            onDatesChange={onDatesChangeStub}
            widget_dateOffset={(day) => day.subtract(2, 'days')}
          />
        ));
        wrapper.instance().onDayClick(clickDate);
        expect(onDatesChangeStub).to.have.property('callCount', 1);
        const args = onDatesChangeStub.getCall(0).args[0];
        expect(args.widget_date.format()).to.equal(clickDate.clone().subtract(2, 'days').format());
        expect(args.widget_date_to.format()).to.equal(clickDate.clone().format());
      });

      it('calls props.onDatesChange once when there is a widget_date_toOffset', () => {
        const clickDate = moment(today);
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DayPickerRangeController
            onDatesChange={onDatesChangeStub}
            widget_date_toOffset={(day) => day.add(4, 'days')}
          />
        ));
        wrapper.instance().onDayClick(clickDate);
        expect(onDatesChangeStub).to.have.property('callCount', 1);
        const args = onDatesChangeStub.getCall(0).args[0];
        expect(args.widget_date.format()).to.equal(clickDate.clone().format());
        expect(args.widget_date_to.format()).to.equal(clickDate.clone().add(4, 'days').format());
      });
    });

    describe('logic in props.onDatesChange affects props.onFocusChange', () => {
      let preventFocusChange;
      let focusedInput;
      let onDatesChange;
      let onFocusChange;
      beforeEach(() => {
        preventFocusChange = false;
        focusedInput = START_DATE;
        onDatesChange = ({ widget_date }) => {
          if (isSameDay(widget_date, today)) preventFocusChange = true;
        };
        onFocusChange = (input) => {
          if (!preventFocusChange) {
            focusedInput = input;
          } else {
            preventFocusChange = false;
          }
        };
      });

      it('calls onDayClick with a day that prevents a focus change', () => {
        const clickDate = moment(today);
        const wrapper = shallow((
          <DayPickerRangeController
            onDatesChange={onDatesChange}
            onFocusChange={onFocusChange}
            focusedInput={START_DATE}
          />
        ));
        wrapper.instance().onDayClick(clickDate);
        expect(focusedInput).to.equal(START_DATE);
        wrapper.instance().onDayClick(clickDate.clone().add(1, 'days'));
        expect(focusedInput).to.equal(END_DATE);
      });

      it('calls onDayClick with a day that does not prevent a focus change', () => {
        const clickDate = moment(today).clone().add(2, 'days');
        const wrapper = shallow((
          <DayPickerRangeController
            onDatesChange={onDatesChange}
            onFocusChange={onFocusChange}
            focusedInput={START_DATE}
          />
        ));
        wrapper.instance().onDayClick(clickDate);
        expect(focusedInput).to.equal(END_DATE);
      });
    });
  });

  describe('#onDayMouseEnter', () => {
    it('sets state.hoverDate to the day arg', () => {
      const wrapper = shallow(<DayPickerRangeController focusedInput={START_DATE} />);
      wrapper.instance().onDayMouseEnter(today);
      expect(wrapper.state().hoverDate).to.equal(today);
    });

    it('sets state.dateOffset to the start and end date range when range included', () => {
      const wrapper = shallow((
        <DayPickerRangeController
          focusedInput={START_DATE}
          widget_date_toOffset={(day) => day.add(2, 'days')}
        />
      ));
      wrapper.instance().onDayMouseEnter(today);
      expect(wrapper.state().dateOffset.start.format()).to.equal(today.format());
      expect(wrapper.state().dateOffset.end.format()).to.equal(today.clone().add(3, 'days').format());
    });

    describe('modifiers', () => {
      it('calls addModifier', () => {
        const addModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifier');
        const wrapper = shallow(<DayPickerRangeController
          focusedInput={START_DATE}
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />);
        wrapper.setState({
          hoverDate: null,
        });
        addModifierSpy.resetHistory();
        wrapper.instance().onDayMouseEnter(today);
        expect(addModifierSpy.callCount).to.equal(1);
        expect(addModifierSpy.getCall(0).args[1]).to.equal(today);
        expect(addModifierSpy.getCall(0).args[2]).to.equal('hovered');
      });

      it('calls deleteModifier', () => {
        const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
        const wrapper = shallow(<DayPickerRangeController
          focusedInput={START_DATE}
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />);
        wrapper.setState({
          hoverDate: today,
        });
        deleteModifierSpy.resetHistory();
        wrapper.instance().onDayMouseEnter(moment().add(10, 'days'));
        expect(deleteModifierSpy.callCount).to.equal(1);
        expect(deleteModifierSpy.getCall(0).args[1]).to.equal(today);
        expect(deleteModifierSpy.getCall(0).args[2]).to.equal('hovered');
      });

      describe('widget_date and !widget_date_to and focusedInput === `END_DATE`', () => {
        describe('old hoverDate is after widget_date', () => {
          it('calls deleteModifierFromRange with widget_date, old hoverDate and `hovered-span`', () => {
            const widget_date = today;
            const hoverDate = today.clone().add(5, 'days');
            const dayAfterHoverDate = hoverDate.clone().add(1, 'day');
            const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
            const wrapper = shallow((
              <DayPickerRangeController
                widget_date={widget_date}
                widget_date_to={null}
                onDatesChange={sinon.stub()}
                focusedInput={END_DATE}
                onFocusChange={sinon.stub()}
              />
            ));
            wrapper.setState({ hoverDate });
            deleteModifierFromRangeSpy.resetHistory();
            wrapper.instance().onDayMouseEnter(moment().add(10, 'days'));
            const hoverSpanCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'hovered-span');
            expect(hoverSpanCalls.length).to.equal(1);
            expect(hoverSpanCalls[0].args[1]).to.equal(widget_date);
            expect(isSameDay(hoverSpanCalls[0].args[2], dayAfterHoverDate)).to.equal(true);
          });
        });

        describe('new hoverDate is not blocked and is after widget_date', () => {
          it('calls addModifierFromRange with widget_date, new hoverDate, and `hovered-span`', () => {
            const widget_date = today;
            const hoverDate = today.clone().add(5, 'days');
            const dayAfterHoverDate = hoverDate.clone().add(1, 'day');
            const addModifierToRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifierToRange');
            const wrapper = shallow((
              <DayPickerRangeController
                widget_date={widget_date}
                widget_date_to={null}
                onDatesChange={sinon.stub()}
                focusedInput={END_DATE}
                onFocusChange={sinon.stub()}
              />
            ));
            wrapper.setState({ hoverDate: null });
            addModifierToRangeSpy.resetHistory();
            wrapper.instance().onDayMouseEnter(hoverDate);
            const hoverSpanCalls = getCallsByModifier(addModifierToRangeSpy, 'hovered-span');
            expect(hoverSpanCalls.length).to.equal(1);
            expect(hoverSpanCalls[0].args[1]).to.equal(widget_date);
            expect(isSameDay(hoverSpanCalls[0].args[2], dayAfterHoverDate)).to.equal(true);
          });
        });
      });

      describe('!widget_date and widget_date_to and focusedInput === `START_DATE`', () => {
        describe('old hoverDate is before widget_date_to', () => {
          it('calls deleteModifierFromRange', () => {
            const hoverDate = today;
            const widget_date_to = today.clone().add(5, 'days');
            const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
            const wrapper = shallow((
              <DayPickerRangeController
                widget_date={null}
                widget_date_to={widget_date_to}
                onDatesChange={sinon.stub()}
                focusedInput={START_DATE}
                onFocusChange={sinon.stub()}
              />
            ));
            wrapper.setState({ hoverDate });
            deleteModifierFromRangeSpy.resetHistory();
            wrapper.instance().onDayMouseEnter(moment().add(10, 'days'));
            expect(deleteModifierFromRangeSpy.callCount).to.equal(2);
            expect(deleteModifierFromRangeSpy.getCall(0).args[1]).to.equal(hoverDate);
            expect(deleteModifierFromRangeSpy.getCall(0).args[2]).to.equal(widget_date_to);
            expect(deleteModifierFromRangeSpy.getCall(0).args[3]).to.equal('hovered-span');
            expect(isSameDay(deleteModifierFromRangeSpy.getCall(1).args[1], widget_date_to.subtract(DayPickerRangeController.defaultProps.minimumNights, 'days'))).to.equal(true);
            expect(deleteModifierFromRangeSpy.getCall(1).args[2]).to.equal(widget_date_to);
            expect(deleteModifierFromRangeSpy.getCall(1).args[3]).to.equal('before-hovered-end');
          });
        });

        describe('new hoverDate is not blocked and is before widget_date_to', () => {
          it('calls addModifierFromRange', () => {
            const hoverDate = today;
            const widget_date_to = today.clone().add(5, 'days');
            const addModifierToRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifierToRange');
            const wrapper = shallow((
              <DayPickerRangeController
                widget_date={null}
                widget_date_to={widget_date_to}
                onDatesChange={sinon.stub()}
                focusedInput={START_DATE}
                onFocusChange={sinon.stub()}
              />
            ));
            wrapper.setState({ hoverDate: null });
            addModifierToRangeSpy.resetHistory();
            wrapper.instance().onDayMouseEnter(hoverDate);
            expect(addModifierToRangeSpy.callCount).to.equal(1);
            expect(addModifierToRangeSpy.getCall(0).args[1]).to.equal(hoverDate);
            expect(addModifierToRangeSpy.getCall(0).args[2]).to.equal(widget_date_to);
            expect(addModifierToRangeSpy.getCall(0).args[3]).to.equal('hovered-span');
          });
        });
      });

      describe('after-hovered-start modifier', () => {
        describe('widget_date does not exist', () => {
          it('does not remove old `after-hovered-start` range (cos it doesnt exist)', () => {
            const minimumNights = 5;
            const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
            const wrapper = shallow((
              <DayPickerRangeController
                onDatesChange={sinon.stub()}
                onFocusChange={sinon.stub()}
                focusedInput={START_DATE}
                minimumNights={minimumNights}
              />
            ));
            deleteModifierFromRangeSpy.resetHistory();
            wrapper.instance().onDayMouseEnter(today);
            const afterHoverStartCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'after-hovered-start');
            expect(afterHoverStartCalls.length).to.equal(0);
          });
        });

        describe('widget_date exists', () => {
          describe('hoverDate is widget_date', () => {
            it('adds new `after-hovered-start` range', () => {
              const minimumNights = 5;
              const widget_date = moment().add(7, 'days');
              const dayAfterwidget_date = widget_date.clone().add(1, 'day');
              const firstAvailableDate = widget_date.clone().add(minimumNights + 1, 'days');
              const addModifierToRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifierToRange');
              const wrapper = shallow((
                <DayPickerRangeController
                  onDatesChange={sinon.stub()}
                  onFocusChange={sinon.stub()}
                  widget_date={widget_date}
                  focusedInput={START_DATE}
                  minimumNights={minimumNights}
                />
              ));
              addModifierToRangeSpy.resetHistory();
              wrapper.instance().onDayMouseEnter(widget_date);
              const afterHoverStartCalls = getCallsByModifier(addModifierToRangeSpy, 'after-hovered-start');
              expect(afterHoverStartCalls.length).to.equal(1);
              expect(isSameDay(afterHoverStartCalls[0].args[1], dayAfterwidget_date)).to.equal(true);
              expect(isSameDay(afterHoverStartCalls[0].args[2], firstAvailableDate)).to.equal(true);
            });
          });

          describe('hoverDate is not widget_date', () => {
            it('does not add new `after-hovered-start` range', () => {
              const minimumNights = 5;
              const widget_date = moment().add(7, 'days');
              const addModifierToRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifierToRange');
              const wrapper = shallow((
                <DayPickerRangeController
                  onDatesChange={sinon.stub()}
                  onFocusChange={sinon.stub()}
                  widget_date={widget_date}
                  focusedInput={START_DATE}
                  minimumNights={minimumNights}
                />
              ));
              addModifierToRangeSpy.resetHistory();
              wrapper.instance().onDayMouseEnter(today);
              const afterHoverStartCalls = getCallsByModifier(addModifierToRangeSpy, 'after-hovered-start');
              expect(afterHoverStartCalls.length).to.equal(0);
            });
          });
        });
      });

      describe('hovered-start-first-possible-end modifier', () => {
        it('does not call deleteModifier with `hovered-start-first-possible-end` if there is no previous hoverDate', () => {
          const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
          const getMinNightsForHoverDateStub = sinon.stub().returns(2);
          const wrapper = shallow(<DayPickerRangeController
            onDatesChange={sinon.stub()}
            onFocusChange={sinon.stub()}
            focusedInput={START_DATE}
            getMinNightsForHoverDate={getMinNightsForHoverDateStub}
          />);
          wrapper.instance().onDayMouseEnter(today);
          const hoveredStartFirstPossibleEndCalls = getCallsByModifier(deleteModifierSpy, 'hovered-start-first-possible-end');
          expect(hoveredStartFirstPossibleEndCalls.length).to.equal(0);
        });

        describe('focusedInput === START_DATE', () => {
          it('calls deleteModifier with `hovered-start-first-possible-end` if getMinNightsForHoverDate returns a positive integer', () => {
            const hoverDate = today.clone().subtract(1, 'days');
            const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
            const getMinNightsForHoverDateStub = sinon.stub().returns(2);
            const wrapper = shallow(<DayPickerRangeController
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
              focusedInput={START_DATE}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
            />);
            wrapper.setState({ hoverDate });
            wrapper.instance().onDayMouseEnter(today);
            const hoveredStartFirstPossibleEndCalls = getCallsByModifier(deleteModifierSpy, 'hovered-start-first-possible-end');
            expect(hoveredStartFirstPossibleEndCalls.length).to.equal(1);
            expect(isSameDay(hoveredStartFirstPossibleEndCalls[0].args[1], hoverDate.clone().add(2, 'days'))).to.equal(true);
          });

          it('does not call deleteModifier with `hovered-start-first-possible-end` if the previous hovered date is blocked', () => {
            const hoverDate = today.clone().subtract(1, 'days');
            const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
            const getMinNightsForHoverDateStub = sinon.stub().returns(2);
            const wrapper = shallow(<DayPickerRangeController
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
              focusedInput={START_DATE}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
              isDayBlocked={(day) => isSameDay(day, hoverDate)}
            />);
            wrapper.setState({ hoverDate });
            wrapper.instance().onDayMouseEnter(today);
            const hoveredStartFirstPossibleEndCalls = getCallsByModifier(deleteModifierSpy, 'hovered-start-first-possible-end');
            expect(hoveredStartFirstPossibleEndCalls.length).to.equal(0);
          });

          it('does not call deleteModifier with `hovered-start-first-possible-end` if getMinNightsForHoverDate does not return a positive integer', () => {
            const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
            const getMinNightsForHoverDateStub = sinon.stub().returns(0);
            const wrapper = shallow(<DayPickerRangeController
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
              focusedInput={START_DATE}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
            />);
            wrapper.setState({ hoverDate: today.clone().subtract(1, 'days') });
            wrapper.instance().onDayMouseEnter(today);
            const hoveredStartFirstPossibleEndCalls = getCallsByModifier(deleteModifierSpy, 'hovered-start-first-possible-end');
            expect(hoveredStartFirstPossibleEndCalls.length).to.equal(0);
          });

          it('calls addModifier with `hovered-start-first-possible-end` if getMinNightsForHoverDate returns a positive integer', () => {
            const addModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifier');
            const getMinNightsForHoverDateStub = sinon.stub().returns(2);
            const wrapper = shallow(<DayPickerRangeController
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
              focusedInput={START_DATE}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
            />);
            wrapper.instance().onDayMouseEnter(today);
            const hoveredStartFirstPossibleEndCalls = getCallsByModifier(addModifierSpy, 'hovered-start-first-possible-end');
            expect(hoveredStartFirstPossibleEndCalls.length).to.equal(1);
            expect(isSameDay(hoveredStartFirstPossibleEndCalls[0].args[1], today.clone().add(2, 'days'))).to.equal(true);
          });

          it('does not call addModifier with `hovered-start-first-possible-end` if the new hovered date is blocked', () => {
            const hoverDate = today.clone().subtract(1, 'days');
            const addModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifier');
            const getMinNightsForHoverDateStub = sinon.stub().returns(2);
            const wrapper = shallow(<DayPickerRangeController
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
              focusedInput={START_DATE}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
              isDayBlocked={(day) => isSameDay(day, today)}
            />);
            wrapper.setState({ hoverDate });
            wrapper.instance().onDayMouseEnter(today);
            const hoveredStartFirstPossibleEndCalls = getCallsByModifier(addModifierSpy, 'hovered-start-first-possible-end');
            expect(hoveredStartFirstPossibleEndCalls.length).to.equal(0);
          });

          it('does not call addModifier with `hovered-start-first-possible-end` if getMinNightsForHoverDate does not return a positive integer', () => {
            const addModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifier');
            const getMinNightsForHoverDateStub = sinon.stub().returns(0);
            const wrapper = shallow(<DayPickerRangeController
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
              focusedInput={START_DATE}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
            />);
            wrapper.instance().onDayMouseEnter(today);
            const hoveredStartFirstPossibleEndCalls = getCallsByModifier(addModifierSpy, 'hovered-start-first-possible-end');
            expect(hoveredStartFirstPossibleEndCalls.length).to.equal(0);
          });

          it('does not call addModifier with `hovered-start-first-possible-end` if getMinNightsForHoverDate is not supplied as a prop', () => {
            const addModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifier');
            const wrapper = shallow(<DayPickerRangeController
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
              focusedInput={START_DATE}
            />);
            wrapper.instance().onDayMouseEnter(today);
            const hoveredStartFirstPossibleEndCalls = getCallsByModifier(addModifierSpy, 'hovered-start-first-possible-end');
            expect(hoveredStartFirstPossibleEndCalls.length).to.equal(0);
          });
        });

        describe('focusedInput === END_DATE', () => {
          it('does not call deleteModifier with `hovered-start-first-possible-end`', () => {
            const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
            const getMinNightsForHoverDateStub = sinon.stub().returns(2);
            const wrapper = shallow(<DayPickerRangeController
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
              focusedInput={END_DATE}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
            />);
            wrapper.setState({ hoverDate: today.clone().subtract(1, 'days') });
            wrapper.instance().onDayMouseEnter(today);
            const hoveredStartFirstPossibleEndCalls = getCallsByModifier(deleteModifierSpy, 'hovered-start-first-possible-end');
            expect(hoveredStartFirstPossibleEndCalls.length).to.equal(0);
          });

          it('does not call addModifier with `hovered-start-first-possible-end`', () => {
            const addModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifier');
            const getMinNightsForHoverDateStub = sinon.stub().returns(2);
            const wrapper = shallow(<DayPickerRangeController
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
              focusedInput={END_DATE}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
            />);
            wrapper.instance().onDayMouseEnter(today);
            const hoveredStartFirstPossibleEndCalls = getCallsByModifier(addModifierSpy, 'hovered-start-first-possible-end');
            expect(hoveredStartFirstPossibleEndCalls.length).to.equal(0);
          });
        });
      });

      describe('hovered-start-blocked-minimum-nights modifier', () => {
        it('does not call deleteModifierFromRange with `hovered-start-blocked-minimum-nights` if there is no previous hoverDate', () => {
          const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
          const getMinNightsForHoverDateStub = sinon.stub().returns(2);
          const wrapper = shallow(<DayPickerRangeController
            onDatesChange={sinon.stub()}
            onFocusChange={sinon.stub()}
            focusedInput={START_DATE}
            getMinNightsForHoverDate={getMinNightsForHoverDateStub}
          />);
          wrapper.instance().onDayMouseEnter(today);
          const hoveredStartBlockedMinNightsCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'hovered-start-blocked-minimum-nights');
          expect(hoveredStartBlockedMinNightsCalls.length).to.equal(0);
        });

        describe('focusedInput === START_DATE', () => {
          it('calls deleteModifierFromRange with `hovered-start-blocked-minimum-nights` if getMinNightsForHoverDate returns a positive integer', () => {
            const hoverDate = today.clone().subtract(1, 'days');
            const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
            const getMinNightsForHoverDateStub = sinon.stub().returns(2);
            const wrapper = shallow(<DayPickerRangeController
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
              focusedInput={START_DATE}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
            />);
            wrapper.setState({ hoverDate });
            wrapper.instance().onDayMouseEnter(today);
            const hoveredStartBlockedMinNightsCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'hovered-start-blocked-minimum-nights');
            expect(hoveredStartBlockedMinNightsCalls.length).to.equal(1);
            expect(isSameDay(hoveredStartBlockedMinNightsCalls[0].args[1], hoverDate.clone().add(1, 'days'))).to.equal(true);
            expect(isSameDay(hoveredStartBlockedMinNightsCalls[0].args[2], hoverDate.clone().add(2, 'days'))).to.equal(true);
          });

          it('does not call deleteModifierFromRange with `hovered-start-blocked-minimum-nights` if the previous hovered date is blocked', () => {
            const hoverDate = today.clone().subtract(1, 'days');
            const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
            const getMinNightsForHoverDateStub = sinon.stub().returns(2);
            const wrapper = shallow(<DayPickerRangeController
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
              focusedInput={START_DATE}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
              isDayBlocked={(day) => isSameDay(day, hoverDate)}
            />);
            wrapper.setState({ hoverDate });
            wrapper.instance().onDayMouseEnter(today);
            const hoveredStartBlockedMinNightsCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'hovered-start-blocked-minimum-nights');
            expect(hoveredStartBlockedMinNightsCalls.length).to.equal(0);
          });

          it('does not call deleteModifierFromRange with `hovered-start-blocked-minimum-nights` if getMinNightsForHoverDate does not return a positive integer', () => {
            const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
            const getMinNightsForHoverDateStub = sinon.stub().returns(0);
            const wrapper = shallow(<DayPickerRangeController
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
              focusedInput={START_DATE}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
            />);
            wrapper.setState({ hoverDate: today.clone().subtract(1, 'days') });
            wrapper.instance().onDayMouseEnter(today);
            const hoveredStartBlockedMinNightsCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'hovered-start-blocked-minimum-nights');
            expect(hoveredStartBlockedMinNightsCalls.length).to.equal(0);
          });

          it('calls addModifierToRange with `hovered-start-blocked-minimum-nights` if getMinNightsForHoverDate returns a positive integer', () => {
            const addModifierToRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifierToRange');
            const getMinNightsForHoverDateStub = sinon.stub().returns(2);
            const wrapper = shallow(<DayPickerRangeController
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
              focusedInput={START_DATE}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
            />);
            wrapper.instance().onDayMouseEnter(today);
            const hoveredStartBlockedMinNightsCalls = getCallsByModifier(addModifierToRangeSpy, 'hovered-start-blocked-minimum-nights');
            expect(hoveredStartBlockedMinNightsCalls.length).to.equal(1);
            expect(isSameDay(hoveredStartBlockedMinNightsCalls[0].args[1], today.clone().add(1, 'days'))).to.equal(true);
            expect(isSameDay(hoveredStartBlockedMinNightsCalls[0].args[2], today.clone().add(2, 'days'))).to.equal(true);
          });

          it('does not call addModifier with `hovered-start-blocked-minimum-nights` if the new hovered date is blocked', () => {
            const hoverDate = today.clone().subtract(1, 'days');
            const addModifierToRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifierToRange');
            const getMinNightsForHoverDateStub = sinon.stub().returns(2);
            const wrapper = shallow(<DayPickerRangeController
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
              focusedInput={START_DATE}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
              isDayBlocked={(day) => isSameDay(day, today)}
            />);
            wrapper.setState({ hoverDate });
            wrapper.instance().onDayMouseEnter(today);
            const hoveredStartBlockedMinNightsCalls = getCallsByModifier(addModifierToRangeSpy, 'hovered-start-blocked-minimum-nights');
            expect(hoveredStartBlockedMinNightsCalls.length).to.equal(0);
          });

          it('does not call addModifier with `hovered-start-blocked-minimum-nights` if getMinNightsForHoverDate does not return a positive integer', () => {
            const addModifierToRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifierToRange');
            const getMinNightsForHoverDateStub = sinon.stub().returns(0);
            const wrapper = shallow(<DayPickerRangeController
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
              focusedInput={START_DATE}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
            />);
            wrapper.instance().onDayMouseEnter(today);
            const hoveredStartBlockedMinNightsCalls = getCallsByModifier(addModifierToRangeSpy, 'hovered-start-blocked-minimum-nights');
            expect(hoveredStartBlockedMinNightsCalls.length).to.equal(0);
          });

          it('does not call addModifier with `hovered-start-blocked-minimum-nights` if getMinNightsForHoverDate is not supplied as a prop', () => {
            const addModifierToRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifierToRange');
            const wrapper = shallow(<DayPickerRangeController
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
              focusedInput={START_DATE}
            />);
            wrapper.instance().onDayMouseEnter(today);
            const hoveredStartBlockedMinNightsCalls = getCallsByModifier(addModifierToRangeSpy, 'hovered-start-blocked-minimum-nights');
            expect(hoveredStartBlockedMinNightsCalls.length).to.equal(0);
          });
        });

        describe('focusedInput === END_DATE', () => {
          it('does not call deleteModifierFromRangeFromRange with `hovered-start-blocked-minimum-nights`', () => {
            const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
            const getMinNightsForHoverDateStub = sinon.stub().returns(2);
            const wrapper = shallow(<DayPickerRangeController
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
              focusedInput={END_DATE}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
            />);
            wrapper.setState({ hoverDate: today.clone().subtract(1, 'days') });
            wrapper.instance().onDayMouseEnter(today);
            const hoveredStartBlockedMinNightsCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'hovered-start-blocked-minimum-nights');
            expect(hoveredStartBlockedMinNightsCalls.length).to.equal(0);
          });

          it('does not call addModifier with `hovered-start-blocked-minimum-nights`', () => {
            const addModifierToRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifierToRange');
            const getMinNightsForHoverDateStub = sinon.stub().returns(2);
            const wrapper = shallow(<DayPickerRangeController
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
              focusedInput={END_DATE}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
            />);
            wrapper.instance().onDayMouseEnter(today);
            const hoveredStartBlockedMinNightsCalls = getCallsByModifier(addModifierToRangeSpy, 'hovered-start-blocked-minimum-nights');
            expect(hoveredStartBlockedMinNightsCalls.length).to.equal(0);
          });
        });
      });

      describe('selected-start-in-hovered-span modifier', () => {
        describe('end date is falsey and focusedInput === `END_DATE`', () => {
          describe('day is start date or before start date', () => {
            it('calls deleteModifier with `selected-start-in-hovered-span` on start date', () => {
              const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
              const widget_date = today;
              const wrapper = shallow(<DayPickerRangeController
                focusedInput={END_DATE}
                widget_date={widget_date}
              />);
              const yesterday = today.clone().subtract(1, 'days');
              deleteModifierSpy.resetHistory();
              wrapper.instance().onDayMouseEnter(yesterday);
              const deleteModifierCalls = getCallsByModifier(deleteModifierSpy, 'selected-start-in-hovered-span');
              expect(deleteModifierCalls.length).to.equal(1);
              expect(deleteModifierCalls[0].args[1]).to.equal(widget_date);
            });
          });

          describe('day is not blocked, and is after the start date', () => {
            it('calls addModifier with `selected-start-in-hovered-span` on start date', () => {
              const addModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifier');
              const widget_date = today;
              const wrapper = shallow(<DayPickerRangeController
                focusedInput={END_DATE}
                widget_date={widget_date}
              />);
              const tomorrow = today.clone().add(1, 'days');
              addModifierSpy.resetHistory();
              wrapper.instance().onDayMouseEnter(tomorrow);
              const addModifierCalls = getCallsByModifier(addModifierSpy, 'selected-start-in-hovered-span');
              expect(addModifierCalls.length).to.equal(1);
              expect(addModifierCalls[0].args[1]).to.equal(widget_date);
            });
          });
        });
      });

      describe('selected-end-in-hovered-span modifier', () => {
        describe('start date is falsey and focusedInput === `START_DATE`', () => {
          describe('day is end date or after start date', () => {
            it('calls deleteModifier with `selected-end-in-hovered-span` on end date', () => {
              const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
              const widget_date_to = today;
              const wrapper = shallow(<DayPickerRangeController
                focusedInput={START_DATE}
                widget_date_to={widget_date_to}
              />);
              const tomorrow = today.clone().add(1, 'days');
              deleteModifierSpy.resetHistory();
              wrapper.instance().onDayMouseEnter(tomorrow);
              const deleteModifierCalls = getCallsByModifier(deleteModifierSpy, 'selected-end-in-hovered-span');
              expect(deleteModifierCalls.length).to.equal(1);
              expect(deleteModifierCalls[0].args[1]).to.equal(widget_date_to);
            });
          });

          describe('day is not blocked, and is before the end date', () => {
            it('calls addModifier with `selected-end-in-hovered-span`', () => {
              const addModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifier');
              const widget_date_to = today;
              const wrapper = shallow(<DayPickerRangeController
                focusedInput={START_DATE}
                widget_date_to={widget_date_to}
              />);
              const yesterday = today.clone().subtract(1, 'days');
              addModifierSpy.resetHistory();
              wrapper.instance().onDayMouseEnter(yesterday);
              const addModifierCalls = getCallsByModifier(addModifierSpy, 'selected-end-in-hovered-span');
              expect(addModifierCalls.length).to.equal(1);
              expect(addModifierCalls[0].args[1]).to.equal(today);
            });
          });
        });
      });

      describe('before-hovered-end modifier', () => {
        describe('end date is truthy and focusedInput is truthy', () => {
          it('calls deleteModifierFromRange with `before-hovered-end` on minimum nights days before end date', () => {
            const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
            const widget_date_to = today;
            const minimumNights = 5;
            const wrapper = shallow(<DayPickerRangeController
              focusedInput={START_DATE}
              minimumNights={minimumNights}
              widget_date_to={widget_date_to}
            />);
            const minimumNightStartSpan = widget_date_to.clone().subtract(minimumNights, 'days');
            deleteModifierFromRangeSpy.resetHistory();
            wrapper.instance().onDayMouseEnter(today);
            const deleteModifierFromRangeCalls = getCallsByModifier(
              deleteModifierFromRangeSpy,
              'before-hovered-end',
            );
            expect(deleteModifierFromRangeCalls.length).to.equal(1);
            expect(toISODateString(deleteModifierFromRangeCalls[0].args[1])).to.equal(
              toISODateString(minimumNightStartSpan),
            );
            expect(deleteModifierFromRangeCalls[0].args[2]).to.equal(widget_date_to);
          });
        });

        describe('day is equal to end date', () => {
          it('calls addModifierToRange with `before-hovered-end`', () => {
            const addModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifierToRange');
            const widget_date_to = today;
            const minimumNights = 5;
            const wrapper = shallow(<DayPickerRangeController
              focusedInput={START_DATE}
              minimumNights={minimumNights}
              widget_date_to={widget_date_to}
            />);
            const minimumNightStartSpan = widget_date_to.clone().subtract(minimumNights, 'days');
            addModifierFromRangeSpy.resetHistory();
            wrapper.instance().onDayMouseEnter(today);
            const addModifierFromRangeCalls = getCallsByModifier(addModifierFromRangeSpy, 'before-hovered-end');
            expect(addModifierFromRangeCalls.length).to.equal(1);
            expect(toISODateString(addModifierFromRangeCalls[0].args[1])).to.equal(
              toISODateString(minimumNightStartSpan),
            );
            expect(addModifierFromRangeCalls[0].args[2]).to.equal(widget_date_to);
          });
        });
      });
    });
  });

  describe('#onDayMouseLeave', () => {
    it('sets state.hoverDate to null', () => {
      const wrapper = shallow(<DayPickerRangeController />);
      wrapper.setState({
        hoverDate: today,
      });
      wrapper.instance().onDayMouseLeave(today);
      expect(wrapper.state().hoverDate).to.equal(null);
    });

    describe('modifiers', () => {
      it('calls deleteModifier with hoverDate and `hovered` modifier', () => {
        const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
        const wrapper = shallow((
          <DayPickerRangeController
            onDatesChange={sinon.stub()}
            onFocusChange={sinon.stub()}
          />
        ));
        wrapper.setState({
          hoverDate: today,
        });
        deleteModifierSpy.resetHistory();
        wrapper.instance().onDayMouseLeave(today);
        expect(deleteModifierSpy.callCount).to.equal(1);
        expect(deleteModifierSpy.getCall(0).args[1]).to.equal(today);
        expect(deleteModifierSpy.getCall(0).args[2]).to.equal('hovered');
      });

      describe('widget_date and !widget_date_to and hoverDate is after widget_date', () => {
        it('calls deleteModifierFromRange with widget_date, hoverDate and `hovered-span`', () => {
          const widget_date = today;
          const hoverDate = today.clone().add(5, 'days');
          const dayAfterHoverDate = hoverDate.clone().add(1, 'day');
          const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
          const wrapper = shallow((
            <DayPickerRangeController
              widget_date={widget_date}
              widget_date_to={null}
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
            />
          ));
          wrapper.setState({ hoverDate });
          deleteModifierFromRangeSpy.resetHistory();
          wrapper.instance().onDayMouseLeave(today);
          const hoveredSpanCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'hovered-span');
          expect(hoveredSpanCalls.length).to.equal(1);
          expect(hoveredSpanCalls[0].args[1]).to.equal(widget_date);
          expect(isSameDay(hoveredSpanCalls[0].args[2], dayAfterHoverDate)).to.equal(true);
        });
      });

      describe('!widget_date and widget_date_to and hoverDate is before widget_date_to', () => {
        it('calls deleteModifierFromRange with hoverDate, widget_date_to, and `hovered-span`', () => {
          const hoverDate = today;
          const widget_date_to = today.clone().add(5, 'days');
          const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
          const wrapper = shallow((
            <DayPickerRangeController
              widget_date={null}
              widget_date_to={widget_date_to}
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
            />
          ));
          wrapper.setState({ hoverDate });
          deleteModifierFromRangeSpy.resetHistory();
          wrapper.instance().onDayMouseLeave(today);
          expect(deleteModifierFromRangeSpy.callCount).to.equal(1);
          expect(deleteModifierFromRangeSpy.getCall(0).args[1]).to.equal(hoverDate);
          expect(deleteModifierFromRangeSpy.getCall(0).args[2]).to.equal(widget_date_to);
          expect(deleteModifierFromRangeSpy.getCall(0).args[3]).to.equal('hovered-span');
        });
      });

      describe('after-hovered-start modifier', () => {
        describe('widget_date exists and is same as arg', () => {
          it('clears previous `after-hovered-start` range', () => {
            const minimumNights = 5;
            const widget_date = moment().add(13, 'days');
            const dayAfterwidget_date = widget_date.clone().add(1, 'day');
            const firstAvailableDate = widget_date.clone().add(minimumNights + 1, 'days');
            const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
            const wrapper = shallow((
              <DayPickerRangeController
                onDatesChange={sinon.stub()}
                onFocusChange={sinon.stub()}
                widget_date={widget_date}
                minimumNights={minimumNights}
              />
            ));
            wrapper.setState({ hoverDate: today });
            deleteModifierFromRangeSpy.resetHistory();
            wrapper.instance().onDayMouseLeave(widget_date);
            const afterHoverStartCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'after-hovered-start');
            expect(afterHoverStartCalls.length).to.equal(1);
            expect(isSameDay(afterHoverStartCalls[0].args[1], dayAfterwidget_date)).to.equal(true);
            expect(isSameDay(afterHoverStartCalls[0].args[2], firstAvailableDate)).to.equal(true);
          });
        });

        describe('widget_date exists and is not the same as arg', () => {
          it('does not call deleteModifierFromRange with `after-hovered-start`', () => {
            const minimumNights = 5;
            const widget_date = moment().add(13, 'days');
            const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
            const wrapper = shallow((
              <DayPickerRangeController
                onDatesChange={sinon.stub()}
                onFocusChange={sinon.stub()}
                widget_date={widget_date}
                minimumNights={minimumNights}
              />
            ));
            wrapper.setState({ hoverDate: today });
            deleteModifierFromRangeSpy.resetHistory();
            wrapper.instance().onDayMouseLeave(today);
            const afterHoverStartCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'after-hovered-start');
            expect(afterHoverStartCalls.length).to.equal(0);
          });
        });

        describe('widget_date does not exist', () => {
          it('does not call deleteModifierFromRange with `after-hovered-start`', () => {
            const minimumNights = 5;
            const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
            const wrapper = shallow((
              <DayPickerRangeController
                onDatesChange={sinon.stub()}
                onFocusChange={sinon.stub()}
                widget_date={null}
                minimumNights={minimumNights}
              />
            ));
            wrapper.setState({ hoverDate: today });
            deleteModifierFromRangeSpy.resetHistory();
            wrapper.instance().onDayMouseLeave(today);
            const afterHoverStartCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'after-hovered-start');
            expect(afterHoverStartCalls.length).to.equal(0);
          });
        });
      });

      describe('hovered-start-first-possible-end modifier', () => {
        describe('focusedInput === START_DATE', () => {
          it('calls deleteModifier with `hovered-start-first-possible-end` if getMinNightsForHoverDate returns a positive integer', () => {
            const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
            const getMinNightsForHoverDateStub = sinon.stub().returns(2);
            const wrapper = shallow(<DayPickerRangeController
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
              focusedInput={START_DATE}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
            />);
            wrapper.setState({ hoverDate: today });
            wrapper.instance().onDayMouseLeave(today);
            const hoveredStartFirstPossibleEndCalls = getCallsByModifier(deleteModifierSpy, 'hovered-start-first-possible-end');
            expect(hoveredStartFirstPossibleEndCalls.length).to.equal(1);
            expect(isSameDay(hoveredStartFirstPossibleEndCalls[0].args[1], today.clone().add(2, 'days'))).to.equal(true);
          });

          it('does not call deleteModifier with `hovered-start-first-possible-end` if the hovered date is blocked', () => {
            const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
            const getMinNightsForHoverDateStub = sinon.stub().returns(2);
            const wrapper = shallow(<DayPickerRangeController
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
              focusedInput={START_DATE}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
              isDayBlocked={(day) => isSameDay(day, today)}
            />);
            wrapper.setState({ hoverDate: today });
            wrapper.instance().onDayMouseLeave(today);
            const hoveredStartFirstPossibleEndCalls = getCallsByModifier(deleteModifierSpy, 'hovered-start-first-possible-end');
            expect(hoveredStartFirstPossibleEndCalls.length).to.equal(0);
          });

          it('does not call deleteModifier with `hovered-start-first-possible-end` if getMinNightsForHoverDate does not return a positive integer', () => {
            const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
            const getMinNightsForHoverDateStub = sinon.stub().returns(0);
            const wrapper = shallow(<DayPickerRangeController
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
              focusedInput={START_DATE}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
            />);
            wrapper.setState({ hoverDate: today });
            wrapper.instance().onDayMouseEnter(today);
            const hoveredStartFirstPossibleEndCalls = getCallsByModifier(deleteModifierSpy, 'hovered-start-first-possible-end');
            expect(hoveredStartFirstPossibleEndCalls.length).to.equal(0);
          });
        });

        describe('focusedInput === END_DATE', () => {
          it('does not call deleteModifier with `hovered-start-first-possible-end`', () => {
            const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
            const getMinNightsForHoverDateStub = sinon.stub().returns(2);
            const wrapper = shallow(<DayPickerRangeController
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
              focusedInput={END_DATE}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
            />);
            wrapper.setState({ hoverDate: today.clone().subtract(1, 'days') });
            wrapper.instance().onDayMouseEnter(today);
            const hoveredStartFirstPossibleEndCalls = getCallsByModifier(deleteModifierSpy, 'hovered-start-first-possible-end');
            expect(hoveredStartFirstPossibleEndCalls.length).to.equal(0);
          });
        });
      });

      describe('hovered-start-blocked-minimum-nights modifier', () => {
        describe('focusedInput === START_DATE', () => {
          it('calls deleteModifierFromRange with `hovered-start-blocked-minimum-nights` if getMinNightsForHoverDate returns a positive integer', () => {
            const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
            const getMinNightsForHoverDateStub = sinon.stub().returns(2);
            const wrapper = shallow(<DayPickerRangeController
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
              focusedInput={START_DATE}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
            />);
            wrapper.setState({ hoverDate: today });
            wrapper.instance().onDayMouseEnter(today);
            const hoveredStartBlockedMinNightsCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'hovered-start-blocked-minimum-nights');
            expect(hoveredStartBlockedMinNightsCalls.length).to.equal(1);
            expect(isSameDay(hoveredStartBlockedMinNightsCalls[0].args[1], today.clone().add(1, 'days'))).to.equal(true);
            expect(isSameDay(hoveredStartBlockedMinNightsCalls[0].args[2], today.clone().add(2, 'days'))).to.equal(true);
          });

          it('does not call deleteModifierFromRange with `hovered-start-blocked-minimum-nights` if the hovered date is blocked', () => {
            const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
            const getMinNightsForHoverDateStub = sinon.stub().returns(2);
            const wrapper = shallow(<DayPickerRangeController
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
              focusedInput={START_DATE}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
              isDayBlocked={(day) => isSameDay(day, today)}
            />);
            wrapper.setState({ hoverDate: today });
            wrapper.instance().onDayMouseLeave(today);
            const hoveredStartBlockedMinNightsCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'hovered-start-blocked-minimum-nights');
            expect(hoveredStartBlockedMinNightsCalls.length).to.equal(0);
          });

          it('does not call deleteModifierFromRange with `hovered-start-blocked-minimum-nights` if getMinNightsForHoverDate does not return a positive integer', () => {
            const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
            const getMinNightsForHoverDateStub = sinon.stub().returns(0);
            const wrapper = shallow(<DayPickerRangeController
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
              focusedInput={START_DATE}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
            />);
            wrapper.setState({ hoverDate: today });
            wrapper.instance().onDayMouseEnter(today);
            const hoveredStartBlockedMinNightsCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'hovered-start-blocked-minimum-nights');
            expect(hoveredStartBlockedMinNightsCalls.length).to.equal(0);
          });
        });

        describe('focusedInput === END_DATE', () => {
          it('does not call deleteModifierFromRangeFromRange with `hovered-start-blocked-minimum-nights`', () => {
            const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
            const getMinNightsForHoverDateStub = sinon.stub().returns(2);
            const wrapper = shallow(<DayPickerRangeController
              onDatesChange={sinon.stub()}
              onFocusChange={sinon.stub()}
              focusedInput={END_DATE}
              getMinNightsForHoverDate={getMinNightsForHoverDateStub}
            />);
            wrapper.setState({ hoverDate: today.clone().subtract(1, 'days') });
            wrapper.instance().onDayMouseEnter(today);
            const hoveredStartBlockedMinNightsCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'hovered-start-blocked-minimum-nights');
            expect(hoveredStartBlockedMinNightsCalls.length).to.equal(0);
          });
        });
      });

      describe('selected-start-in-hovered-span modifier', () => {
        describe('start date is truthy, end date is falsey and day is after start date', () => {
          it('calls deleteModifier with `selected-start-in-hovered-span` on start date', () => {
            const widget_date = today;
            const dayAfterwidget_date = widget_date.clone().add(1, 'day');
            const hoverDate = today.clone().add(5, 'days');
            const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
            const wrapper = shallow((
              <DayPickerRangeController
                widget_date={widget_date}
                widget_date_to={null}
                onDatesChange={sinon.stub()}
                onFocusChange={sinon.stub()}
              />
            ));
            wrapper.setState({ hoverDate });
            deleteModifierSpy.resetHistory();
            wrapper.instance().onDayMouseLeave(dayAfterwidget_date);
            const deleteModifierCalls = getCallsByModifier(deleteModifierSpy, 'selected-start-in-hovered-span');
            expect(deleteModifierCalls.length).to.equal(1);
            expect(deleteModifierCalls[0].args[1]).to.equal(widget_date);
          });
        });
      });

      describe('selected-end-in-hovered-span modifier', () => {
        describe('end date is truthy, start date is falsey and day is before end date', () => {
          it('calls deleteModifier with `selected-end-in-hovered-span` on end date', () => {
            const widget_date_to = today;
            const dayBeforewidget_date_to = widget_date_to.clone().subtract(1, 'day');
            const hoverDate = today.clone().add(5, 'days');
            const deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
            const wrapper = shallow((
              <DayPickerRangeController
                widget_date={null}
                widget_date_to={widget_date_to}
                onDatesChange={sinon.stub()}
                onFocusChange={sinon.stub()}
              />
            ));
            wrapper.setState({ hoverDate });
            deleteModifierSpy.resetHistory();
            wrapper.instance().onDayMouseLeave(dayBeforewidget_date_to);
            const deleteModifierCalls = getCallsByModifier(deleteModifierSpy, 'selected-end-in-hovered-span');
            expect(deleteModifierCalls.length).to.equal(1);
            expect(deleteModifierCalls[0].args[1]).to.equal(widget_date_to);
          });
        });
      });

      describe('before-hovered-end modifier', () => {
        describe('end date is truthy and day is end date', () => {
          it('calls deleteModifierFromRange with `before-hovered-end` on span of end date to end date minus minimum nights', () => {
            const widget_date_to = today;
            const hoverDate = today.clone().subtract(5, 'days');
            const deleteModifierFromRangeSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifierFromRange');
            const minimumNights = 5;
            const minimumNightStartSpan = widget_date_to.clone().subtract(minimumNights, 'days');
            const wrapper = shallow((
              <DayPickerRangeController
                widget_date={null}
                minimumNights={minimumNights}
                widget_date_to={widget_date_to}
                onDatesChange={sinon.stub()}
                onFocusChange={sinon.stub()}
              />
            ));
            deleteModifierFromRangeSpy.resetHistory();
            wrapper.setState({ hoverDate });
            wrapper.instance().onDayMouseLeave(widget_date_to);
            const deleteModifierFromRangeCalls = getCallsByModifier(deleteModifierFromRangeSpy, 'before-hovered-end');
            expect(deleteModifierFromRangeCalls.length).to.equal(1);
            expect(toISODateString(deleteModifierFromRangeCalls[0].args[1])).to.equal(
              toISODateString(minimumNightStartSpan),
            );
            expect(deleteModifierFromRangeCalls[0].args[2]).to.equal(widget_date_to);
          });
        });
      });
    });
  });

  describe('#onPrevMonthClick', () => {
    it('updates state.currentMonth to subtract 1 month', () => {
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      wrapper.setState({
        currentMonth: today,
      });
      wrapper.instance().onPrevMonthClick();
      expect(wrapper.state().currentMonth.month()).to.equal(today.clone().subtract(1, 'month').month());
    });

    it('new visibleDays has previous month', () => {
      const numberOfMonths = 2;
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
          numberOfMonths={numberOfMonths}
        />
      ));
      wrapper.setState({
        currentMonth: today,
      });
      const newMonth = moment().subtract(1, 'month');
      wrapper.instance().onPrevMonthClick();
      const visibleDays = Object.keys(wrapper.state().visibleDays);
      expect(visibleDays).to.include(toISOMonthString(newMonth));
    });

    it('new visibleDays does not have current last month', () => {
      const numberOfMonths = 2;
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
          numberOfMonths={numberOfMonths}
        />
      ));
      wrapper.setState({
        currentMonth: today,
      });
      wrapper.instance().onPrevMonthClick();
      const visibleDays = Object.keys(wrapper.state().visibleDays);
      expect(visibleDays).to.not.include(toISOMonthString(moment().add(numberOfMonths, 'months')));
    });

    it('calls this.getModifiers', () => {
      const getModifiersSpy = sinon.spy(DayPickerRangeController.prototype, 'getModifiers');
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      getModifiersSpy.resetHistory();
      wrapper.instance().onPrevMonthClick();
      expect(getModifiersSpy.callCount).to.equal(1);
    });

    it('calls props.onPrevMonthClick with new month', () => {
      const onPrevMonthClickStub = sinon.stub();
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
          onPrevMonthClick={onPrevMonthClickStub}
        />
      ));
      wrapper.setState({
        currentMonth: today,
      });
      const newMonth = moment().subtract(1, 'month');
      wrapper.instance().onPrevMonthClick();
      expect(onPrevMonthClickStub.callCount).to.equal(1);
      expect(onPrevMonthClickStub.firstCall.args[0].year()).to.equal(newMonth.year());
      expect(onPrevMonthClickStub.firstCall.args[0].month()).to.equal(newMonth.month());
    });

    it('calls this.shouldDisableMonthNavigation twice', () => {
      const shouldDisableMonthNavigationSpy = sinon.spy(DayPickerRangeController.prototype, 'shouldDisableMonthNavigation');
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      shouldDisableMonthNavigationSpy.resetHistory();
      wrapper.instance().onPrevMonthClick();
      expect(shouldDisableMonthNavigationSpy.callCount).to.equal(2);
    });

    it('sets disablePrev and disablePrev as false on onPrevMonthClick call withouth maxDate and minDate set', () => {
      const numberOfMonths = 2;
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
          numberOfMonths={numberOfMonths}
        />
      ));
      wrapper.setState({
        currentMonth: today,
      });
      wrapper.instance().onPrevMonthClick();
      expect(wrapper.state().disablePrev).to.equal(false);
      expect(wrapper.state().disableNext).to.equal(false);
    });

    it('sets disableNext as true when maxDate is in visible month', () => {
      const numberOfMonths = 2;
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
          numberOfMonths={numberOfMonths}
          maxDate={today}
        />
      ));
      wrapper.setState({
        currentMonth: today,
      });
      wrapper.instance().onPrevMonthClick();
      expect(wrapper.state().disableNext).to.equal(true);
      expect(wrapper.state().disablePrev).to.equal(false);
    });

    it('sets disablePrev as true when minDate is in visible month', () => {
      const numberOfMonths = 2;
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
          numberOfMonths={numberOfMonths}
          minDate={today.clone().subtract(1, 'month')}
        />
      ));
      wrapper.setState({
        currentMonth: today,
      });
      wrapper.instance().onPrevMonthClick();
      expect(wrapper.state().disableNext).to.equal(false);
      expect(wrapper.state().disablePrev).to.equal(true);
    });
  });

  describe('#onNextMonthClick', () => {
    it('updates state.currentMonth to add 1 month', () => {
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      wrapper.setState({
        currentMonth: today,
      });
      wrapper.instance().onNextMonthClick();
      expect(wrapper.state().currentMonth.month()).to.equal(today.clone().add(1, 'month').month());
    });

    it('new visibleDays has next month', () => {
      const numberOfMonths = 2;
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
          numberOfMonths={numberOfMonths}
        />
      ));
      wrapper.setState({
        currentMonth: today,
      });
      const newMonth = moment().add(numberOfMonths + 1, 'months');
      wrapper.instance().onNextMonthClick();
      const visibleDays = Object.keys(wrapper.state().visibleDays);
      expect(visibleDays).to.include(toISOMonthString(newMonth));
    });

    it('new visibleDays does not have current month - 1', () => {
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
          numberOfMonths={2}
        />
      ));
      wrapper.setState({
        currentMonth: today,
      });
      wrapper.instance().onNextMonthClick();
      const visibleDays = Object.keys(wrapper.state().visibleDays);
      expect(visibleDays).to.not.include(toISOMonthString(today.clone().subtract(1, 'month')));
    });

    it('calls this.getModifiers', () => {
      const getModifiersSpy = sinon.spy(DayPickerRangeController.prototype, 'getModifiers');
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      getModifiersSpy.resetHistory();
      wrapper.instance().onNextMonthClick();
      expect(getModifiersSpy.callCount).to.equal(1);
    });

    it('calls props.onNextMonthClick with new month', () => {
      const onNextMonthClickStub = sinon.stub();
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
          onNextMonthClick={onNextMonthClickStub}
        />
      ));
      wrapper.setState({
        currentMonth: today,
      });
      const newMonth = moment().add(1, 'month');
      wrapper.instance().onNextMonthClick();
      expect(onNextMonthClickStub.callCount).to.equal(1);
      expect(onNextMonthClickStub.firstCall.args[0].year()).to.equal(newMonth.year());
      expect(onNextMonthClickStub.firstCall.args[0].month()).to.equal(newMonth.month());
    });
  });

  describe('#getFirstFocusableDay', () => {
    describe('focusedInput === START_DATE', () => {
      it('returns widget_date if exists and is not blocked', () => {
        sinon.stub(DayPickerRangeController.prototype, 'isBlocked').returns(false);
        const wrapper = shallow((
          <DayPickerRangeController
            focusedInput={START_DATE}
            widget_date={today}
            onFocusChange={sinon.stub()}
            onDatesChange={sinon.stub()}
          />
        ));
        const firstFocusableDay = wrapper.instance().getFirstFocusableDay(moment().subtract(10, 'days'));
        expect(firstFocusableDay.isSame(today, 'day')).to.equal(true);
      });

      it('returns first day of arg month if widget_date is falsy', () => {
        sinon.stub(DayPickerRangeController.prototype, 'isBlocked').returns(false);
        const wrapper = shallow((
          <DayPickerRangeController
            focusedInput={START_DATE}
            widget_date={null}
            onFocusChange={sinon.stub()}
            onDatesChange={sinon.stub()}
          />
        ));
        const startOfMonth = today.clone().startOf('month');
        const firstFocusableDay = wrapper.instance().getFirstFocusableDay(today);
        expect(firstFocusableDay.isSame(startOfMonth, 'day')).to.equal(true);
      });
    });

    describe('focusedInput === END_DATE', () => {
      it('returns widget_date_to if exists and is not blocked and widget_date is falsy', () => {
        sinon.stub(DayPickerRangeController.prototype, 'isBlocked').returns(false);
        const widget_date_to = moment().add(10, 'days');
        const wrapper = shallow((
          <DayPickerRangeController
            focusedInput={END_DATE}
            widget_date={null}
            widget_date_to={widget_date_to}
            onFocusChange={sinon.stub()}
            onDatesChange={sinon.stub()}
          />
        ));
        const firstFocusableDay = wrapper.instance().getFirstFocusableDay(today);
        expect(firstFocusableDay.isSame(widget_date_to, 'day')).to.equal(true);
      });

      it('returns widget_date + minimumNights if widget_date is truthy and widget_date_to is not', () => {
        sinon.stub(DayPickerRangeController.prototype, 'isBlocked').returns(false);
        const widget_date = moment().add(10, 'days');
        const minimumNights = 5;
        const wrapper = shallow((
          <DayPickerRangeController
            focusedInput={END_DATE}
            widget_date={widget_date}
            minimumNights={minimumNights}
            onFocusChange={sinon.stub()}
            onDatesChange={sinon.stub()}
          />
        ));
        const firstFocusableDay = wrapper.instance().getFirstFocusableDay(today);
        expect(firstFocusableDay.isSame(widget_date.clone().add(minimumNights, 'days'), 'day')).to.equal(true);
      });

      it('returns first day of arg month if widget_date and widget_date_to are falsy', () => {
        sinon.stub(DayPickerRangeController.prototype, 'isBlocked').returns(false);
        const wrapper = shallow((
          <DayPickerRangeController
            focusedInput={END_DATE}
            widget_date={null}
            minimumNights={null}
            onFocusChange={sinon.stub()}
            onDatesChange={sinon.stub()}
          />
        ));
        const firstFocusableDay = wrapper.instance().getFirstFocusableDay(today);
        expect(firstFocusableDay.isSame(today.clone().startOf('month'), 'day')).to.equal(true);
      });
    });

    describe('desired day is blocked', () => {
      it('returns next unblocked visible day after desired day if exists', () => {
        const isBlockedStub = sinon.stub(DayPickerRangeController.prototype, 'isBlocked');

        const widget_date = moment().endOf('month').subtract(10, 'days');
        const wrapper = shallow((
          <DayPickerRangeController
            focusedInput={END_DATE}
            widget_date={widget_date}
            numberOfMonths={1}
            onFocusChange={sinon.stub()}
            onDatesChange={sinon.stub()}
          />
        ));
        isBlockedStub.resetHistory();
        isBlockedStub.returns(true).onCall(8).returns(false);

        const firstFocusableDay = wrapper.instance().getFirstFocusableDay(today);
        expect(firstFocusableDay.isSame(widget_date.clone().add(9, 'days'), 'day')).to.equal(true);
      });
    });
  });

  describe('#getModifiers', () => {
    it('return object has the same number of days as input', () => {
      const monthISO = toISOMonthString(today);
      const visibleDays = {
        [monthISO]: [today, moment().add(1, 'day'), moment().add(2, 'days')],
      };
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      const modifiers = wrapper.instance().getModifiers(visibleDays);
      expect(Object.keys(modifiers[monthISO]).length).to.equal(visibleDays[monthISO].length);
    });

    it('calls this.getModifiersForDay for each day in input', () => {
      const getModifiersForDaySpy = sinon.spy(DayPickerRangeController.prototype, 'getModifiersForDay');
      const monthISO = toISOMonthString(today);
      const visibleDays = {
        [monthISO]: [today, moment().add(1, 'day'), moment().add(2, 'days')],
      };
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      getModifiersForDaySpy.resetHistory();
      wrapper.instance().getModifiers(visibleDays);

      expect(getModifiersForDaySpy.callCount).to.equal(visibleDays[monthISO].length);
    });
  });

  describe('#getModifiersForDay', () => {
    it('only contains `valid` if all modifier methods return false', () => {
      sinon.stub(DayPickerRangeController.prototype, 'isToday').returns(false);
      sinon.stub(DayPickerRangeController.prototype, 'isBlocked').returns(false);
      const isDayBlockedStub = sinon.stub().returns(false);
      const isOutsideRangeStub = sinon.stub().returns(false);
      const isDayHighlightedStub = sinon.stub().returns(false);
      sinon.stub(DayPickerRangeController.prototype, 'iswidget_date').returns(false);
      sinon.stub(DayPickerRangeController.prototype, 'iswidget_date_to').returns(false);
      sinon.stub(DayPickerRangeController.prototype, 'doesNotMeetMinimumNights').returns(false);
      sinon.stub(DayPickerRangeController.prototype, 'isInSelectedSpan').returns(false);
      sinon.stub(DayPickerRangeController.prototype, 'isLastInRange').returns(false);
      sinon.stub(DayPickerRangeController.prototype, 'isHovered').returns(false);
      sinon.stub(DayPickerRangeController.prototype, 'isInHoveredSpan').returns(false);
      sinon.stub(DayPickerRangeController.prototype, 'isDayAfterHoveredwidget_date').returns(false);
      sinon.stub(DayPickerRangeController.prototype, 'isFirstDayOfWeek').returns(false);
      sinon.stub(DayPickerRangeController.prototype, 'isLastDayOfWeek').returns(false);
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
          isDayBlocked={isDayBlockedStub}
          isOutsideRange={isOutsideRangeStub}
          isDayHighlighted={isDayHighlightedStub}
        />
      ));
      const modifiers = wrapper.instance().getModifiersForDay(moment());
      expect(modifiers.size).to.equal(1);
      expect(modifiers.has('valid')).to.equal(true);
    });

    it('contains `today` if this.isToday returns true', () => {
      sinon.stub(DayPickerRangeController.prototype, 'isToday').returns(true);
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      const modifiers = wrapper.instance().getModifiersForDay(moment());
      expect(modifiers.has('today')).to.equal(true);
    });

    it('contains `blocked` if this.isBlocked returns true', () => {
      sinon.stub(DayPickerRangeController.prototype, 'isBlocked').returns(true);
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      const modifiers = wrapper.instance().getModifiersForDay(moment());
      expect(modifiers.has('blocked')).to.equal(true);
    });

    it('contains `blocked-calendar` if props.isDayBlocked returns true', () => {
      const isDayBlockedStub = sinon.stub().returns(true);
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
          isDayBlocked={isDayBlockedStub}
        />
      ));
      const modifiers = wrapper.instance().getModifiersForDay(moment());
      expect(modifiers.has('blocked-calendar')).to.equal(true);
    });

    it('contains `blocked-out-of-range` if props.isOutsideRange returns true', () => {
      const isOutsideRangeStub = sinon.stub().returns(true);
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
          isOutsideRange={isOutsideRangeStub}
        />
      ));
      const modifiers = wrapper.instance().getModifiersForDay(moment());
      expect(modifiers.has('blocked-out-of-range')).to.equal(true);
    });

    it('contains `highlighted-calendar` if props.isDayHighlighted returns true', () => {
      const isDayHighlightedStub = sinon.stub().returns(true);
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
          isDayHighlighted={isDayHighlightedStub}
        />
      ));
      const modifiers = wrapper.instance().getModifiersForDay(moment());
      expect(modifiers.has('highlighted-calendar')).to.equal(true);
    });

    it('contains `valid` if this.isBlocked returns false', () => {
      sinon.stub(DayPickerRangeController.prototype, 'isBlocked').returns(false);
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      const modifiers = wrapper.instance().getModifiersForDay(moment());
      expect(modifiers.has('valid')).to.equal(true);
    });

    it('contains `selected-start` if this.iswidget_date returns true', () => {
      sinon.stub(DayPickerRangeController.prototype, 'iswidget_date').returns(true);
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      const modifiers = wrapper.instance().getModifiersForDay(moment());
      expect(modifiers.has('selected-start')).to.equal(true);
    });

    it('contains `selected-end` if this.iswidget_date_to returns true', () => {
      sinon.stub(DayPickerRangeController.prototype, 'iswidget_date_to').returns(true);
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      const modifiers = wrapper.instance().getModifiersForDay(moment());
      expect(modifiers.has('selected-end')).to.equal(true);
    });

    it('contains `blocked-minimum-nights` if this.doesNotMeetMinimumNights returns true', () => {
      sinon.stub(DayPickerRangeController.prototype, 'doesNotMeetMinimumNights').returns(true);
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      const modifiers = wrapper.instance().getModifiersForDay(moment());
      expect(modifiers.has('blocked-minimum-nights')).to.equal(true);
    });

    it('contains `selected-span` if this.isInSelectedSpan returns true', () => {
      sinon.stub(DayPickerRangeController.prototype, 'isInSelectedSpan').returns(true);
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      const modifiers = wrapper.instance().getModifiersForDay(moment());
      expect(modifiers.has('selected-span')).to.equal(true);
    });

    it('contains `last-in-range` if this.isLastInRange returns true', () => {
      sinon.stub(DayPickerRangeController.prototype, 'isLastInRange').returns(true);
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      const modifiers = wrapper.instance().getModifiersForDay(moment());
      expect(modifiers.has('last-in-range')).to.equal(true);
    });

    it('contains `hovered` if this.isHovered returns true', () => {
      sinon.stub(DayPickerRangeController.prototype, 'isHovered').returns(true);
      const wrapper = shallow(<DayPickerRangeController
        onDatesChange={sinon.stub()}
        onFocusChange={sinon.stub()}
      />);
      const modifiers = wrapper.instance().getModifiersForDay(moment());
      expect(modifiers.has('hovered')).to.equal(true);
    });

    it('contains `hovered-span` if this.isInHoveredSpan returns true', () => {
      sinon.stub(DayPickerRangeController.prototype, 'isInHoveredSpan').returns(true);
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      const modifiers = wrapper.instance().getModifiersForDay(moment());
      expect(modifiers.has('hovered-span')).to.equal(true);
    });

    it('contains `after-hovered-start` if this.isDayAfterHoveredwidget_date returns true', () => {
      sinon.stub(DayPickerRangeController.prototype, 'isDayAfterHoveredwidget_date').returns(true);
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      const modifiers = wrapper.instance().getModifiersForDay(moment());
      expect(modifiers.has('after-hovered-start')).to.equal(true);
    });
  });

  describe('#addModifier', () => {
    it('returns first arg if no day given', () => {
      const updatedDays = { foo: 'bar' };
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      const modifiers = wrapper.instance().addModifier(updatedDays);
      expect(modifiers).to.equal(updatedDays);
    });

    it('returns first arg if day is not visible', () => {
      const updatedDays = { foo: 'bar' };
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      sinon.stub(isDayVisible, 'default').returns(false);
      const modifiers = wrapper.instance().addModifier(updatedDays, moment());
      expect(modifiers).to.equal(updatedDays);
    });

    it('has day args month ISO as key', () => {
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      const modifiers = wrapper.instance().addModifier({}, today);
      expect(Object.keys(modifiers)).to.contain(toISOMonthString(today));
    });

    it('is resilient when visibleDays is an empty object', () => {
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      wrapper.instance().setState({ visibleDays: {} });
      const modifiers = wrapper.instance().addModifier({}, today);
      expect(Object.keys(modifiers[toISOMonthString(today)])).to.contain(toISODateString(today));
    });

    it('has day ISO as key one layer down', () => {
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      const modifiers = wrapper.instance().addModifier({}, today);
      expect(Object.keys(modifiers[toISOMonthString(today)])).to.contain(toISODateString(today));
    });

    it('return value now has modifier arg for day if was in first arg', () => {
      const modifierToAdd = 'foo';
      const monthISO = toISOMonthString(today);
      const todayISO = toISODateString(today);
      const updatedDays = {
        [monthISO]: { [todayISO]: new Set(['bar', 'baz']) },
      };
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      const modifiers = wrapper.instance().addModifier(updatedDays, today, modifierToAdd);
      expect(Array.from(modifiers[monthISO][todayISO])).to.contain(modifierToAdd);
    });

    it('return value now has modifier arg for day if was in state', () => {
      const modifierToAdd = 'foo';
      const monthISO = toISOMonthString(today);
      const todayISO = toISODateString(today);
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      wrapper.setState({
        visibleDays: {
          [monthISO]: { [todayISO]: new Set(['bar', 'baz']) },
        },
      });
      const modifiers = wrapper.instance().addModifier({}, today, modifierToAdd);
      expect(Array.from(modifiers[monthISO][todayISO])).to.contain(modifierToAdd);
    });

    it('return new modifier if vertically scrollable load more months', () => {
      const modifierToAdd = 'foo';
      const numberOfMonths = 2;
      const nextMonth = today.clone().add(numberOfMonths, 'month');
      const nextMonthISO = toISOMonthString(nextMonth);
      const nextMonthDayISO = toISODateString(nextMonth);
      const updatedDays = {
        [nextMonthISO]: { [nextMonthDayISO]: new Set(['bar', 'baz']) },
      };
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
          numberOfMonths={numberOfMonths}
          orientation={VERTICAL_SCROLLABLE}
        />
      ));
      wrapper.setState({
        currentMonth: today,
        visibleDays: {
          ...getVisibleDays(today, numberOfMonths),
          ...getVisibleDays(nextMonth, numberOfMonths),
        },
      });
      const modifiers = wrapper.instance().addModifier(updatedDays, nextMonth, modifierToAdd);
      expect(Array.from(modifiers[nextMonthISO][nextMonthDayISO])).to.contain(modifierToAdd);
    });
  });

  it('return value now has modifier arg for day after getting next scrollable months', () => {
    const modifierToAdd = 'foo';
    const futureDateAfterMultiply = today.clone().add(4, 'months');
    const monthISO = toISOMonthString(futureDateAfterMultiply);
    const todayISO = toISODateString(futureDateAfterMultiply);
    const updatedDays = {
      [monthISO]: { [todayISO]: new Set(['bar', 'baz']) },
    };
    const wrapper = shallow((
      <DayPickerRangeController
        onDatesChange={sinon.stub()}
        onFocusChange={sinon.stub()}
        orientation={VERTICAL_SCROLLABLE}
        numberOfMonths={3}
      />
    )).instance();
    let modifiers = wrapper.addModifier(updatedDays, futureDateAfterMultiply, modifierToAdd);
    expect(Array.from(modifiers[monthISO][todayISO])).to.not.contain(modifierToAdd);
    wrapper.onGetNextScrollableMonths();
    modifiers = wrapper.addModifier(updatedDays, futureDateAfterMultiply, modifierToAdd);
    expect(Array.from(modifiers[monthISO][todayISO])).to.contain(modifierToAdd);
  });

  it('return value now has modifier arg for day after getting previous scrollable months', () => {
    const modifierToAdd = 'foo';
    const pastDateAfterMultiply = today.clone().subtract(3, 'months');
    const monthISO = toISOMonthString(pastDateAfterMultiply);
    const dayISO = toISODateString(pastDateAfterMultiply);
    const updatedDays = {
      [monthISO]: { [dayISO]: new Set(['bar', 'baz']) },
    };
    const wrapper = shallow((
      <DayPickerRangeController
        onDatesChange={sinon.stub()}
        onFocusChange={sinon.stub()}
        orientation={VERTICAL_SCROLLABLE}
        numberOfMonths={3}
      />
    )).instance();
    let modifiers = wrapper.addModifier(updatedDays, pastDateAfterMultiply, modifierToAdd);
    expect(Array.from(modifiers[monthISO][dayISO])).to.not.contain(modifierToAdd);
    wrapper.onGetPrevScrollableMonths();
    modifiers = wrapper.addModifier(updatedDays, pastDateAfterMultiply, modifierToAdd);
    expect(Array.from(modifiers[monthISO][dayISO])).to.contain(modifierToAdd);
  });

  describe('#addModifierToRange', () => {
    let addModifierSpy;
    beforeEach(() => {
      addModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'addModifier');
    });

    it('calls addModifier for each day between the span start and the span end', () => {
      const numOfDays = 10;
      const spanStart = moment();
      const spanEnd = moment().add(numOfDays, 'days');
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      wrapper.instance().addModifierToRange({}, spanStart, spanEnd);
      expect(addModifierSpy.callCount).to.equal(numOfDays);
    });

    it('calls addModifier with modifier arg as modifier', () => {
      const modifier = 'foo-bar-baz';
      const spanStart = moment();
      const spanEnd = moment().add(10, 'days');
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      wrapper.instance().addModifierToRange({}, spanStart, spanEnd, modifier);
      expect(addModifierSpy.callCount).to.not.equal(0);
      for (let i = 0; i < addModifierSpy.callCount; i += 1) {
        expect(addModifierSpy.getCall(i).args[2]).to.equal(modifier);
      }
    });

    it('does not call addModifier if span end is after span start', () => {
      const spanStart = moment();
      const spanEnd = moment().subtract(10, 'days');
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      wrapper.instance().addModifierToRange({}, spanStart, spanEnd);
      expect(addModifierSpy.callCount).to.equal(0);
    });
  });

  describe('#deleteModifier', () => {
    it('returns first arg if no day given', () => {
      const updatedDays = { foo: 'bar' };
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      const modifiers = wrapper.instance().deleteModifier(updatedDays);
      expect(modifiers).to.equal(updatedDays);
    });

    it('returns first arg if day is not visible', () => {
      const updatedDays = { foo: 'bar' };
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      sinon.stub(isDayVisible, 'default').returns(false);
      const modifiers = wrapper.instance().deleteModifier(updatedDays, moment());
      expect(modifiers).to.equal(updatedDays);
    });

    it('has day args month ISO as key', () => {
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));

      const isoMonth = toISOMonthString(today);
      const isoDate = toISODateString(today);
      const modifiers = wrapper.instance()
        .deleteModifier({ [isoMonth]: { [isoDate]: new Set(['foo']) } }, today, 'foo');

      expect(Object.keys(modifiers)).to.contain(isoMonth);
      expect(modifiers[isoMonth][isoDate].size).to.equal(0);
    });

    it('has day ISO as key one layer down', () => {
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      const modifiers = wrapper.instance().addModifier({}, today);
      expect(Object.keys(modifiers[toISOMonthString(today)])).to.contain(toISODateString(today));
    });

    it('is resilient when visibleDays is an empty object', () => {
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      wrapper.instance().setState({ visibleDays: {} });
      expect(() => { wrapper.instance().deleteModifier({}, today); }).to.not.throw();
    });

    it('return value no longer has modifier arg for day if was in first arg', () => {
      const modifierToDelete = 'foo';
      const monthISO = toISOMonthString(today);
      const todayISO = toISODateString(today);
      const updatedDays = {
        [monthISO]: { [todayISO]: new Set([modifierToDelete, 'bar', 'baz']) },
      };
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      const modifiers = wrapper.instance().deleteModifier(updatedDays, today, modifierToDelete);
      expect(Array.from(modifiers[monthISO][todayISO])).to.not.contain(modifierToDelete);
    });

    it('return value no longer has modifier arg for day if was in state', () => {
      const modifierToDelete = 'foo';
      const monthISO = toISOMonthString(today);
      const todayISO = toISODateString(today);
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
        />
      ));
      wrapper.setState({
        visibleDays: {
          [monthISO]: { [todayISO]: new Set([modifierToDelete, 'bar', 'baz']) },
        },
      });
      const modifiers = wrapper.instance().deleteModifier({}, today, modifierToDelete);
      expect(Array.from(modifiers[monthISO][todayISO])).to.not.contain(modifierToDelete);
    });

    it('return new modifier if vertically scrollable load more months', () => {
      const modifierToDelete = 'foo';
      const numberOfMonths = 2;
      const nextMonth = today.clone().add(numberOfMonths, 'month');
      const nextMonthISO = toISOMonthString(nextMonth);
      const nextMonthDayISO = toISODateString(nextMonth);
      const updatedDays = {
        [nextMonthISO]: { [nextMonthDayISO]: new Set(['foo', 'bar', 'baz']) },
      };
      const wrapper = shallow((
        <DayPickerRangeController
          onDatesChange={sinon.stub()}
          onFocusChange={sinon.stub()}
          numberOfMonths={numberOfMonths}
          orientation={VERTICAL_SCROLLABLE}
        />
      ));
      wrapper.setState({
        currentMonth: today,
        visibleDays: {
          ...getVisibleDays(today, numberOfMonths),
          ...getVisibleDays(nextMonth, numberOfMonths),
        },
      });
      const modifiers = wrapper.instance().deleteModifier(updatedDays, nextMonth, modifierToDelete);
      expect(Array.from(modifiers[nextMonthISO][nextMonthDayISO])).to.not.contain(modifierToDelete);
    });
  });

  describe('#deleteModifierFromRange', () => {
    let deleteModifierSpy;
    beforeEach(() => {
      deleteModifierSpy = sinon.spy(DayPickerRangeController.prototype, 'deleteModifier');
    });

    it('calls deleteModifier for each day between the span start and the span end', () => {
      const numOfDays = 10;
      const spanStart = moment();
      const spanEnd = moment().add(numOfDays, 'days');
      const wrapper = shallow(<DayPickerRangeController
        onDatesChange={sinon.stub()}
        onFocusChange={sinon.stub()}
      />);
      wrapper.instance().deleteModifierFromRange({}, spanStart, spanEnd);
      expect(deleteModifierSpy.callCount).to.equal(numOfDays);
    });

    it('calls deleteModifier with modifier arg as modifier', () => {
      const modifier = 'foo-bar-baz';
      const spanStart = moment();
      const spanEnd = moment().add(10, 'days');
      const wrapper = shallow(<DayPickerRangeController
        onDatesChange={sinon.stub()}
        onFocusChange={sinon.stub()}
      />);
      wrapper.instance().deleteModifierFromRange({}, spanStart, spanEnd, modifier);
      expect(deleteModifierSpy.callCount).to.not.equal(0);
      for (let i = 0; i < deleteModifierSpy.callCount; i += 1) {
        expect(deleteModifierSpy.getCall(i).args[2]).to.equal(modifier);
      }
    });

    it('does not call deleteModifier if span end is after span start', () => {
      const spanStart = moment();
      const spanEnd = moment().subtract(10, 'days');
      const wrapper = shallow(<DayPickerRangeController
        onDatesChange={sinon.stub()}
        onFocusChange={sinon.stub()}
      />);
      wrapper.instance().deleteModifierFromRange({}, spanStart, spanEnd);
      expect(deleteModifierSpy.callCount).to.equal(0);
    });
  });

  describe('day modifier methods', () => {
    describe('#doesNotMeetMinimumNights', () => {
      const MIN_NIGHTS = 3;
      describe('state.widget_date !== null', () => {
        const widget_date = moment(today).add(3, 'days'); // rand day not equal to today
        describe('props.focusedInput === END_DATE', () => {
          it('returns true if arg is < props.minimumNights after props.widget_date', () => {
            const testDate = moment(widget_date).add(MIN_NIGHTS - 1, 'days');
            const wrapper = shallow(<DayPickerRangeController
              focusedInput={END_DATE}
              widget_date={widget_date}
              minimumNights={MIN_NIGHTS}
            />);
            expect(wrapper.instance().doesNotMeetMinimumNights(testDate)).to.equal(true);
          });

          it('returns false if arg is > props.minimumNights after props.widget_date', () => {
            const testDate = moment(widget_date).add(MIN_NIGHTS + 1, 'days');
            const wrapper = shallow(<DayPickerRangeController
              focusedInput={END_DATE}
              widget_date={widget_date}
              minimumNights={MIN_NIGHTS}
            />);
            expect(wrapper.instance().doesNotMeetMinimumNights(testDate)).to.equal(false);
          });

          it('handles time differences of less than 1 full day properly', () => {
            const partialDate = moment(widget_date).add(5, 'minutes');
            const testDate = moment(widget_date).add(MIN_NIGHTS, 'days');
            const wrapper = shallow(<DayPickerRangeController
              focusedInput={END_DATE}
              widget_date={partialDate}
              minimumNights={MIN_NIGHTS}
            />);
            expect(wrapper.instance().doesNotMeetMinimumNights(testDate)).to.equal(false);
          });
        });

        describe('props.focusedInput !== END_DATE', () => {
          it('returns false', () => {
            const testDate = moment(widget_date).add(MIN_NIGHTS - 1, 'days');
            const wrapper = shallow(<DayPickerRangeController
              focusedInput={START_DATE}
              widget_date={widget_date}
              minimumNights={MIN_NIGHTS}
            />);
            expect(wrapper.instance().doesNotMeetMinimumNights(testDate)).to.equal(false);
          });
        });
      });

      describe('props.widget_date === null', () => {
        describe('props.focusedInput === END_DATE', () => {
          it('returns true if arg - props.minimumNights is outside allowed range', () => {
            const isOutsideRange = (day) => !isInclusivelyAfterDay(day, today);
            const testDate = moment(today).add(MIN_NIGHTS - 1, 'days');
            const wrapper = shallow(<DayPickerRangeController
              focusedInput={END_DATE}
              widget_date={null}
              minimumNights={MIN_NIGHTS}
              isOutsideRange={isOutsideRange}
            />);
            expect(wrapper.instance().doesNotMeetMinimumNights(testDate)).to.equal(true);
          });

          it('returns false if arg - props.minimumNights is inside allowed range', () => {
            const isOutsideRange = (day) => !isInclusivelyAfterDay(day, today);
            const testDate = moment(today).add(MIN_NIGHTS, 'days');
            const wrapper = shallow(<DayPickerRangeController
              focusedInput={END_DATE}
              widget_date={null}
              minimumNights={MIN_NIGHTS}
              isOutsideRange={isOutsideRange}
            />);
            expect(wrapper.instance().doesNotMeetMinimumNights(testDate)).to.equal(false);
          });
        });

        describe('state.focusedInput !== END_DATE', () => {
          it('returns false', () => {
            const testDate = moment(today).add(MIN_NIGHTS - 1, 'days');
            const wrapper = shallow(<DayPickerRangeController
              focusedInput={START_DATE}
              widget_date={null}
              minimumNights={MIN_NIGHTS}
            />);
            expect(wrapper.instance().doesNotMeetMinimumNights(testDate)).to.equal(false);
          });
        });
      });
    });

    describe('#isDayAfterHoveredwidget_date', () => {
      it('returns true if arg widget_date is hovered and arg is the day after the widget_date', () => {
        const wrapper = shallow(<DayPickerRangeController widget_date={today} />);
        wrapper.setState({
          hoverDate: today,
        });
        const testDate = moment(today).add(1, 'days');
        expect(wrapper.instance().isDayAfterHoveredwidget_date(testDate)).to.equal(true);
      });

      it('returns false if props.widget_date is falsy', () => {
        const testDate = moment(today).add(1, 'days');
        const wrapper = shallow(<DayPickerRangeController widget_date={null} />);
        wrapper.setState({
          hoverDate: today,
        });
        expect(wrapper.instance().isDayAfterHoveredwidget_date(testDate)).to.equal(false);
      });

      it('returns false if props.widget_date_to is truthy', () => {
        const testDate = moment(today).add(1, 'days');
        const wrapper = shallow(<DayPickerRangeController
          widget_date={today}
          widget_date_to={moment(today).add(3, 'days')}
        />);
        wrapper.setState({
          hoverDate: today,
        });
        expect(wrapper.instance().isDayAfterHoveredwidget_date(testDate)).to.equal(false);
      });

      it('returns false if arg is not day after state.hoverDate', () => {
        const wrapper = shallow(<DayPickerRangeController widget_date={today} />);
        wrapper.setState({
          hoverDate: today,
        });
        const testDate = moment(today).add(2, 'days');
        expect(wrapper.instance().isDayAfterHoveredwidget_date(testDate)).to.equal(false);
      });

      it('returns false if state.hoverDate is not the same as props.widget_date', () => {
        const testDate = moment(today).add(1, 'days');
        const wrapper = shallow(<DayPickerRangeController widget_date={today} />);
        wrapper.setState({
          hoverDate: testDate,
        });
        expect(wrapper.instance().isDayAfterHoveredwidget_date(testDate)).to.equal(false);
      });

      it('returns false if arg is day after state.hoverDate and props.minimumNights is 0', () => {
        const testDate = moment(today).add(1, 'days');
        const wrapper = shallow(<DayPickerRangeController widget_date={today} minimumNights={0} />);
        wrapper.setState({
          hoverDate: today,
        });
        expect(wrapper.instance().isDayAfterHoveredwidget_date(testDate)).to.equal(false);
      });
    });

    describe('#iswidget_date_to', () => {
      it('returns true if arg === props.widget_date_to', () => {
        const wrapper = shallow(<DayPickerRangeController widget_date_to={today} />);
        expect(wrapper.instance().iswidget_date_to(today)).to.equal(true);
      });

      it('returns false if arg !== props.widget_date_to', () => {
        const wrapper = shallow((
          <DayPickerRangeController widget_date_to={moment(today).add(1, 'days')} />
        ));
        expect(wrapper.instance().iswidget_date_to(today)).to.equal(false);
      });
    });

    describe('#isHovered', () => {
      it('returns false if focusedInput is falsy', () => {
        const wrapper = shallow(<DayPickerRangeController focusedInput={null} />);
        wrapper.setState({
          hoverDate: today,
        });

        expect(wrapper.instance().isHovered(today)).to.equal(false);
      });

      it('returns true if arg === state.hoverDate', () => {
        const wrapper = shallow(<DayPickerRangeController focusedInput={START_DATE} />);
        wrapper.setState({
          hoverDate: today,
        });

        expect(wrapper.instance().isHovered(today)).to.equal(true);
      });

      it('returns false if arg !== state.hoverDate', () => {
        const wrapper = shallow(<DayPickerRangeController focusedInput={START_DATE} />);
        wrapper.setState({
          hoverDate: moment(today).add(1, 'days'),
        });
        expect(wrapper.instance().isHovered(today)).to.equal(false);
      });
    });

    describe('#isInHoveredSpan', () => {
      describe('props.widget_date_to === null', () => {
        it('returns true if arg is in between props.widget_date and state.hoverDate', () => {
          const HOVER_DATE_DIFF = 5;
          const wrapper = shallow(<DayPickerRangeController widget_date={today} widget_date_to={null} />);
          wrapper.setState({
            hoverDate: moment(today).add(HOVER_DATE_DIFF, 'days'),
          });
          const testDate = moment(today).add(HOVER_DATE_DIFF - 1, 'days');
          expect(wrapper.instance().isInHoveredSpan(testDate)).to.equal(true);
        });

        it('returns true if arg is equal to state.hoverDate', () => {
          const testDate = moment(today).add(3, 'days');
          const wrapper = shallow(<DayPickerRangeController widget_date={today} widget_date_to={null} />);
          wrapper.setState({
            hoverDate: testDate,
          });
          expect(wrapper.instance().isInHoveredSpan(testDate)).to.equal(true);
        });

        it('returns false if arg is < props.widget_date', () => {
          const wrapper = shallow(<DayPickerRangeController widget_date={today} widget_date_to={null} />);
          wrapper.setState({
            hoverDate: moment(today).add(3, 'days'),
          });
          const testDate = moment(today).subtract(1, 'days');
          expect(wrapper.instance().isInHoveredSpan(testDate)).to.equal(false);
        });

        it('returns false if arg is > state.hoverDate', () => {
          const hoverDate = moment(today).add(3, 'days');
          const wrapper = shallow(<DayPickerRangeController widget_date={today} widget_date_to={null} />);
          wrapper.setState({
            hoverDate,
          });
          const testDate = moment(hoverDate).add(1, 'days');
          expect(wrapper.instance().isInHoveredSpan(testDate)).to.equal(false);
        });
      });

      describe('props.widget_date === null', () => {
        it('returns true if arg is in between state.hoverDate and props.widget_date_to', () => {
          const widget_date_to = moment(today).add(5, 'days');
          const wrapper = shallow(<DayPickerRangeController
            widget_date={null}
            widget_date_to={moment(today).add(5, 'days')}
          />);
          wrapper.setState({
            hoverDate: today,
          });
          const testDate = moment(widget_date_to).subtract(1, 'days');
          expect(wrapper.instance().isInHoveredSpan(testDate)).to.equal(true);
        });

        it('returns true if arg is equal to state.hoverDate', () => {
          const wrapper = shallow(<DayPickerRangeController
            widget_date={null}
            widget_date_to={moment(today).add(5, 'days')}
          />);
          wrapper.setState({
            hoverDate: today,
          });
          expect(wrapper.instance().isInHoveredSpan(today)).to.equal(true);
        });

        it('returns false if arg is < state.hoverDate', () => {
          const wrapper = shallow(<DayPickerRangeController
            widget_date={null}
            widget_date_to={moment(today).add(5, 'days')}
          />);
          wrapper.setState({
            hoverDate: today,
          });
          const testDate = moment(today).subtract(1, 'days');
          expect(wrapper.instance().isInHoveredSpan(testDate)).to.equal(false);
        });

        it('returns false if arg is > props.widget_date_to', () => {
          const widget_date_to = moment(today).add(5, 'days');
          const wrapper = shallow(<DayPickerRangeController
            widget_date={null}
            widget_date_to={widget_date_to}
          />);
          wrapper.setState({
            hoverDate: today,
          });
          const testDate = moment(widget_date_to).add(1, 'days');
          expect(wrapper.instance().isInHoveredSpan(testDate)).to.equal(false);
        });
      });
    });

    describe('#isInSelectedSpan', () => {
      it('returns true if props.widget_date < arg < props.widget_date_to', () => {
        const widget_date_to = moment(today).add(5, 'days');
        const wrapper = shallow(<DayPickerRangeController
          widget_date={today}
          widget_date_to={widget_date_to}
        />);
        const testDate = moment(widget_date_to).subtract(1, 'days');
        expect(wrapper.instance().isInSelectedSpan(testDate)).to.equal(true);
      });

      it('returns false if arg = props.widget_date && arg < 12', () => {
        const widget_date_to = moment(today).add(5, 'days');
        const wrapper = shallow(<DayPickerRangeController
          widget_date={today}
          widget_date_to={widget_date_to}
        />);
        const testDate = moment(today.hours(10));
        expect(wrapper.instance().isInSelectedSpan(testDate)).to.equal(false);
      });

      it('returns false if arg = props.widget_date && arg > 12', () => {
        const widget_date_to = moment(today).add(5, 'days');
        const wrapper = shallow(<DayPickerRangeController
          widget_date={today}
          widget_date_to={widget_date_to}
        />);
        const testDate = moment(today.hours(16));
        expect(wrapper.instance().isInSelectedSpan(testDate)).to.equal(false);
      });

      it('returns false if arg < props.widget_date', () => {
        const widget_date_to = moment(today).add(5, 'days');
        const wrapper = shallow(<DayPickerRangeController
          widget_date={today}
          widget_date_to={widget_date_to}
        />);
        const testDate = moment(today).subtract(1, 'days');
        expect(wrapper.instance().isInSelectedSpan(testDate)).to.equal(false);
      });

      it('returns false if arg > props.widget_date_to', () => {
        const widget_date_to = moment(today).add(5, 'days');
        const wrapper = shallow(<DayPickerRangeController
          widget_date={today}
          widget_date_to={widget_date_to}
        />);
        const testDate = moment(widget_date_to).add(1, 'days');
        expect(wrapper.instance().isInSelectedSpan(testDate)).to.equal(false);
      });

      it('returns false if props.widget_date === null', () => {
        const wrapper = shallow(<DayPickerRangeController
          widget_date={null}
          widget_date_to={moment(today).add(5, 'days')}
        />);
        expect(wrapper.instance().isInSelectedSpan(today)).to.equal(false);
      });

      it('returns false if props.widget_date_to === null', () => {
        const wrapper = shallow(<DayPickerRangeController
          widget_date={today}
          widget_date_to={null}
        />);
        const testDate = moment(today).add(1, 'days');
        expect(wrapper.instance().isInSelectedSpan(testDate)).to.equal(false);
      });
    });

    describe('#isLastInRange', () => {
      let isInSelectedSpanStub;
      beforeEach(() => {
        isInSelectedSpanStub = sinon.stub(DayPickerRangeController.prototype, 'isInSelectedSpan');
      });

      it('returns true if arg is day before props.widget_date_to and is in the selected span', () => {
        isInSelectedSpanStub.returns(true);
        const wrapper = shallow(<DayPickerRangeController
          widget_date_to={moment(today).add(1, 'days')}
        />);
        expect(wrapper.instance().isLastInRange(today)).to.equal(true);
      });

      it('returns false if arg is not in the selected span', () => {
        isInSelectedSpanStub.returns(false);
        const wrapper = shallow(<DayPickerRangeController
          widget_date_to={moment(today).add(1, 'days')}
        />);
        expect(wrapper.instance().isLastInRange(today)).to.equal(false);
      });

      it('returns false if arg is not the day before props.widget_date_to', () => {
        isInSelectedSpanStub.returns(true);
        const wrapper = shallow(<DayPickerRangeController
          widget_date_to={moment(today).add(2, 'days')}
        />);
        expect(wrapper.instance().isLastInRange(today)).to.equal(false);
      });
    });

    describe('#iswidget_date', () => {
      it('returns true if arg === props.widget_date', () => {
        const wrapper = shallow(<DayPickerRangeController widget_date={today} />);
        expect(wrapper.instance().iswidget_date(today)).to.equal(true);
      });

      it('returns false if arg !== props.widget_date', () => {
        const wrapper = shallow((
          <DayPickerRangeController widget_date={moment(today).add(1, 'days')} />
        ));
        expect(wrapper.instance().iswidget_date(today)).to.equal(false);
      });
    });

    describe('#isBlocked', () => {
      let isDayBlockedStub;
      let isOutsideRangeStub;
      let doesNotMeetMinimumNightsStub;
      beforeEach(() => {
        isDayBlockedStub = sinon.stub();
        isOutsideRangeStub = sinon.stub();
        doesNotMeetMinimumNightsStub = sinon.stub(DayPickerRangeController.prototype, 'doesNotMeetMinimumNights');
      });

      it('returns true if arg is calendar blocked', () => {
        isDayBlockedStub.returns(true);
        isOutsideRangeStub.returns(false);
        doesNotMeetMinimumNightsStub.returns(false);

        const wrapper = shallow(<DayPickerRangeController
          isDayBlocked={isDayBlockedStub}
          isOutsideRange={isOutsideRangeStub}
        />);
        expect(wrapper.instance().isBlocked(today)).to.equal(true);
      });

      it('returns true if arg is out of range', () => {
        isDayBlockedStub.returns(false);
        isOutsideRangeStub.returns(true);
        doesNotMeetMinimumNightsStub.returns(false);

        const wrapper = shallow(<DayPickerRangeController
          isDayBlocked={isDayBlockedStub}
          isOutsideRange={isOutsideRangeStub}
        />);
        expect(wrapper.instance().isBlocked(today)).to.equal(true);
      });

      it('returns true if arg does not meet minimum nights', () => {
        isDayBlockedStub.returns(false);
        isOutsideRangeStub.returns(false);
        doesNotMeetMinimumNightsStub.returns(true);

        const wrapper = shallow(<DayPickerRangeController
          isDayBlocked={isDayBlockedStub}
          isOutsideRange={isOutsideRangeStub}
        />);
        expect(wrapper.instance().isBlocked(today)).to.equal(true);
      });

      it('returns false if arg is not blocked, not out of range, and meets minimum nights', () => {
        isDayBlockedStub.returns(false);
        isOutsideRangeStub.returns(false);
        doesNotMeetMinimumNightsStub.returns(false);

        const wrapper = shallow(<DayPickerRangeController
          isDayBlocked={isDayBlockedStub}
          isOutsideRange={isOutsideRangeStub}
        />);
        expect(wrapper.instance().isBlocked(today)).to.equal(false);
      });

      it('returns false if arg does not meet minimum nights but blockDaysViolatingMinNights is false', () => {
        isDayBlockedStub.returns(false);
        isOutsideRangeStub.returns(false);
        doesNotMeetMinimumNightsStub.returns(true);

        const wrapper = shallow(<DayPickerRangeController
          isDayBlocked={isDayBlockedStub}
          isOutsideRange={isOutsideRangeStub}
        />);
        expect(wrapper.instance().isBlocked(today, false)).to.equal(false);
      });
    });

    describe('#isToday', () => {
      it('returns true if today', () => {
        const wrapper = shallow(<DayPickerRangeController />);
        expect(wrapper.instance().isToday(today)).to.equal(true);
      });

      it('returns false if tomorrow', () => {
        const wrapper = shallow(<DayPickerRangeController />);
        expect(wrapper.instance().isToday(moment(today).add(1, 'days'))).to.equal(false);
      });

      it('returns false if last month', () => {
        const wrapper = shallow(<DayPickerRangeController />);
        expect(wrapper.instance().isToday(moment(today).subtract(1, 'months'))).to.equal(false);
      });
    });

    describe('#isFirstDayOfWeek', () => {
      it('returns true if first day of this week', () => {
        const wrapper = shallow(<DayPickerRangeController />);
        expect(wrapper.instance().isFirstDayOfWeek(moment().startOf('week'))).to.equal(true);
      });

      it('returns true if same day as firstDayOfWeek prop', () => {
        const firstDayOfWeek = 3;
        const wrapper = shallow(<DayPickerRangeController firstDayOfWeek={firstDayOfWeek} />);
        expect(wrapper.instance().isFirstDayOfWeek(moment().startOf('week').day(firstDayOfWeek))).to.equal(true);
      });

      it('returns false if not the first day of the week', () => {
        const wrapper = shallow(<DayPickerRangeController />);
        expect(wrapper.instance().isFirstDayOfWeek(moment().endOf('week'))).to.equal(false);
      });
    });

    describe('#isLastDayOfWeek', () => {
      it('returns true if last day of week', () => {
        const wrapper = shallow(<DayPickerRangeController />);
        expect(wrapper.instance().isLastDayOfWeek(moment().endOf('week'))).to.equal(true);
      });

      it('returns true if 6 days after firstDayOfWeek prop', () => {
        const firstDayOfWeek = 3;
        const wrapper = shallow(<DayPickerRangeController firstDayOfWeek={firstDayOfWeek} />);
        expect(wrapper.instance().isLastDayOfWeek(moment().day(firstDayOfWeek).add(6, 'days'))).to.equal(true);
      });

      it('returns false if not last of week', () => {
        const wrapper = shallow(<DayPickerRangeController />);
        expect(wrapper.instance().isLastDayOfWeek(moment().startOf('week').add(1, 'day'))).to.equal(false);
      });
    });

    describe('#beforeSelectedEnd', () => {
      it('returns true if day is before end date', () => {
        const widget_date_to = today;
        const dayBeforewidget_date_to = widget_date_to.clone().subtract(1, 'days');
        const wrapper = shallow(<DayPickerRangeController
          widget_date_to={widget_date_to}
        />);
        expect(wrapper.instance().beforeSelectedEnd(dayBeforewidget_date_to)).to.equal(true);
      });

      it('returns false if day is after or equal to end date', () => {
        const widget_date_to = today;
        const dayAfterwidget_date_to = widget_date_to.clone().add(1, 'days');
        const wrapper = shallow(<DayPickerRangeController
          widget_date_to={widget_date_to}
        />);
        expect(wrapper.instance().beforeSelectedEnd(dayAfterwidget_date_to)).to.equal(false);
      });
    });

    describe('#isDayBeforeHoveredwidget_date_to', () => {
      it('returns false if day is after hovered end date', () => {
        const widget_date_to = today;
        const dayAfterwidget_date_to = widget_date_to.clone().add(1, 'days');
        const wrapper = shallow(<DayPickerRangeController
          widget_date_to={widget_date_to}
        />);
        wrapper.setState({ hoverDate: widget_date_to });
        expect(wrapper.instance().isDayBeforeHoveredwidget_date_to(dayAfterwidget_date_to)).to.equal(false);
      });

      it('returns true if day is before hovered end date', () => {
        const widget_date_to = today;
        const dayBeforewidget_date_to = widget_date_to.clone().subtract(1, 'days');
        const wrapper = shallow(<DayPickerRangeController
          widget_date_to={widget_date_to}
        />);
        wrapper.setState({ hoverDate: widget_date_to });
        expect(wrapper.instance().isDayBeforeHoveredwidget_date_to(dayBeforewidget_date_to)).to.equal(true);
      });
    });

    describe('noNavButtons prop', () => {
      it('renders navigation button', () => {
        const wrapper = shallow(<DayPickerRangeController />).dive().dive();
        expect(wrapper.find(DayPickerNavigation)).to.have.lengthOf(1);
      });

      it('does not render navigation button when noNavButtons prop applied', () => {
        const wrapper = shallow(<DayPickerRangeController noNavButtons />).dive().dive();
        expect(wrapper.find(DayPickerNavigation)).to.have.lengthOf(0);
      });
    });

    describe('renderKeyboardShortcutsButton prop', () => {
      it('pass down custom button render function', () => {
        const testRenderKeyboardShortcutsButton = () => {};
        const wrapper = shallow(
          <DayPickerRangeController
            renderKeyboardShortcutsButton={testRenderKeyboardShortcutsButton}
          />,
        );
        const dayPicker = wrapper.find(DayPicker);
        expect(dayPicker).to.have.lengthOf(1);
        expect(dayPicker.prop('renderKeyboardShortcutsButton'))
          .to
          .eql(testRenderKeyboardShortcutsButton);
      });
    });

    describe('renderKeyboardShortcutsPanel prop', () => {
      it('passes down custom panel render function', () => {
        const testRenderKeyboardShortcutsPanel = () => {};
        const wrapper = shallow(
          <DayPickerRangeController
            renderKeyboardShortcutsPanel={testRenderKeyboardShortcutsPanel}
          />,
        );
        const dayPicker = wrapper.find(DayPicker);
        expect(dayPicker).to.have.lengthOf(1);
        expect(dayPicker.prop('renderKeyboardShortcutsPanel'))
          .to
          .eql(testRenderKeyboardShortcutsPanel);
      });
    });
  });
});
