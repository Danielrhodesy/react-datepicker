import React from 'react';
import { expect } from 'chai';
import moment from 'moment';
import sinon from 'sinon-sandbox';
import { shallow } from 'enzyme';

import DateRangePickerInputController
  from '../../src/components/DateRangePickerInputController';

import DateRangePickerInput from '../../src/components/DateRangePickerInput';

import isSameDay from '../../src/utils/isSameDay';

import {
  START_DATE,
  END_DATE,
} from '../../src/constants';

// Set to noon to mimic how days in the picker are configured internally
const today = moment().startOf('day').hours(12);

describe('DateRangePickerInputController', () => {
  describe('#render', () => {
    it('renders a DateRangePickerInput', () => {
      const wrapper = shallow(<DateRangePickerInputController />);
      expect(wrapper.find(DateRangePickerInput)).to.have.lengthOf(1);
    });

    it('should pass children to DateRangePickerInput when provided', () => {
      const Child = () => <div>CHILD</div>;

      const wrapper = shallow((
        <DateRangePickerInputController>
          <Child />
        </DateRangePickerInputController>
      ));
      expect(wrapper.find(DateRangePickerInput)).to.have.property('children');
      expect(wrapper.find(Child)).to.have.lengthOf(1);
    });
  });

  describe('#clearDates', () => {
    describe('props.reopenPickerOnClearDates is truthy', () => {
      describe('props.onFocusChange', () => {
        it('is called once', () => {
          const onFocusChangeStub = sinon.stub();
          const wrapper = shallow((
            <DateRangePickerInputController
              onFocusChange={onFocusChangeStub}
              reopenPickerOnClearDates
            />
          ));
          wrapper.instance().clearDates();
          expect(onFocusChangeStub.callCount).to.equal(1);
        });

        it('is called with arg START_DATE', () => {
          const onFocusChangeStub = sinon.stub();
          const wrapper = shallow((
            <DateRangePickerInputController
              onFocusChange={onFocusChangeStub}
              reopenPickerOnClearDates
            />
          ));
          wrapper.instance().clearDates();
          expect(onFocusChangeStub.getCall(0).args[0]).to.equal(START_DATE);
        });
      });
    });

    describe('props.reopenPickerOnClearDates is falsy', () => {
      describe('props.onFocusChange', () => {
        it('is not called', () => {
          const onFocusChangeStub = sinon.stub();
          const wrapper = shallow((
            <DateRangePickerInputController onFocusChange={onFocusChangeStub} />
          ));
          wrapper.instance().clearDates();
          expect(onFocusChangeStub.callCount).to.equal(0);
        });
      });
    });

    it('calls props.onDatesChange with arg { widget_date: null, widget_date_to: null }', () => {
      const onDatesChangeStub = sinon.stub();
      const wrapper = shallow((
        <DateRangePickerInputController onDatesChange={onDatesChangeStub} />
      ));
      wrapper.instance().clearDates();
      expect(onDatesChangeStub.callCount).to.equal(1);
    });
  });

  describe('#onClearFocus', () => {
    it('calls props.onFocusChange', () => {
      const onFocusChangeStub = sinon.stub();
      const wrapper = shallow(<DateRangePickerInputController onFocusChange={onFocusChangeStub} />);
      wrapper.instance().onClearFocus();
      expect(onFocusChangeStub.callCount).to.equal(1);
    });

    it('calls props.onFocusChange with null arg', () => {
      const onFocusChangeStub = sinon.stub();
      const wrapper = shallow(<DateRangePickerInputController onFocusChange={onFocusChangeStub} />);
      wrapper.instance().onClearFocus();
      expect(onFocusChangeStub.calledWith(null)).to.equal(true);
    });

    it('calls props.onClose with widget_date and widget_date_to args', () => {
      const onCloseStub = sinon.stub();
      const widget_date_to = moment(today).add(1, 'days');

      const wrapper = shallow((
        <DateRangePickerInputController
          onFocusChange={() => null}
          onClose={onCloseStub}
          widget_date={today}
          widget_date_to={widget_date_to}
        />
      ));

      wrapper.instance().onClearFocus();
      const args = onCloseStub.getCall(0).args[0];
      expect(args.widget_date).to.equal(today);
      expect(args.widget_date_to).to.equal(widget_date_to);
    });
  });

  describe('#onwidget_date_toChange', () => {
    describe('is a valid end date', () => {
      const validFutureDateString = moment(today).add(10, 'days').format('YYYY-MM-DD');
      describe('when props.widget_date is not provided', () => {
        it('calls props.onDatesChange with provided end date', () => {
          const onDatesChangeStub = sinon.stub();
          const wrapper = shallow((
            <DateRangePickerInputController onDatesChange={onDatesChangeStub} />
          ));
          wrapper.instance().onwidget_date_toChange(validFutureDateString);
          expect(onDatesChangeStub.callCount).to.equal(1);

          const [{ widget_date, widget_date_to }] = onDatesChangeStub.getCall(0).args;
          expect(widget_date).to.equal(wrapper.props().widget_date);
          expect(isSameDay(widget_date_to, moment(validFutureDateString))).to.equal(true);
        });

        describe('props.onFocusChange', () => {
          it('is called once', () => {
            const onFocusChangeStub = sinon.stub();
            const wrapper = shallow((
              <DateRangePickerInputController onFocusChange={onFocusChangeStub} />
            ));
            wrapper.instance().onwidget_date_toChange(validFutureDateString);
            expect(onFocusChangeStub.callCount).to.equal(1);
          });

          it('is called with null arg', () => {
            const onFocusChangeStub = sinon.stub();
            const wrapper = shallow((
              <DateRangePickerInputController onFocusChange={onFocusChangeStub} />
            ));
            wrapper.instance().onwidget_date_toChange(validFutureDateString);
            expect(onFocusChangeStub.calledWith(null)).to.equal(true);
          });
        });
      });

      describe('is before props.widget_date', () => {
        const widget_date = moment(today).add(15, 'days');
        it('calls props.onDatesChange with props.widget_date and null end date', () => {
          const onDatesChangeStub = sinon.stub();
          const wrapper = shallow((
            <DateRangePickerInputController
              onDatesChange={onDatesChangeStub}
              widget_date={widget_date}
            />
          ));
          wrapper.instance().onwidget_date_toChange(validFutureDateString);
          expect(onDatesChangeStub.callCount).to.equal(1);

          const onDatesChangeArgs = onDatesChangeStub.getCall(0).args[0];
          expect(onDatesChangeArgs.widget_date).to.equal(widget_date);
          expect(onDatesChangeArgs.widget_date_to).to.equal(null);
        });

        describe('props.onFocusChange', () => {
          it('is called once', () => {
            const onFocusChangeStub = sinon.stub();
            const wrapper = shallow((
              <DateRangePickerInputController onFocusChange={onFocusChangeStub} />
            ));
            wrapper.instance().onwidget_date_toChange(validFutureDateString);
            expect(onFocusChangeStub.callCount).to.equal(1);
          });

          it('is called with null arg', () => {
            const onFocusChangeStub = sinon.stub();
            const wrapper = shallow((
              <DateRangePickerInputController onFocusChange={onFocusChangeStub} />
            ));
            wrapper.instance().onwidget_date_toChange(validFutureDateString);
            expect(onFocusChangeStub.calledWith(null)).to.equal(true);
          });
        });
      });

      describe('is after props.widget_date', () => {
        const widget_date = moment(today);
        it('calls props.onDatesChange with props.widget_date and provided end date', () => {
          const onDatesChangeStub = sinon.stub();
          const wrapper = shallow((
            <DateRangePickerInputController
              onDatesChange={onDatesChangeStub}
              widget_date={widget_date}
            />
          ));
          wrapper.instance().onwidget_date_toChange(validFutureDateString);
          expect(onDatesChangeStub.callCount).to.equal(1);

          const onDatesChangeArgs = onDatesChangeStub.getCall(0).args[0];
          const futureDate = moment(validFutureDateString);
          expect(onDatesChangeArgs.widget_date).to.equal(widget_date);
          expect(isSameDay(onDatesChangeArgs.widget_date_to, futureDate)).to.equal(true);
        });

        describe('props.onFocusChange', () => {
          it('is called once', () => {
            const onFocusChangeStub = sinon.stub();
            const wrapper = shallow((
              <DateRangePickerInputController onFocusChange={onFocusChangeStub} />
            ));
            wrapper.instance().onwidget_date_toChange(validFutureDateString);
            expect(onFocusChangeStub.callCount).to.equal(1);
          });

          it('is called with null arg', () => {
            const onFocusChangeStub = sinon.stub();
            const wrapper = shallow((
              <DateRangePickerInputController onFocusChange={onFocusChangeStub} />
            ));
            wrapper.instance().onwidget_date_toChange(validFutureDateString);
            expect(onFocusChangeStub.calledWith(null)).to.equal(true);
          });
        });
      });

      describe('is the same day as props.widget_date', () => {
        const widget_date = moment(today).add(10, 'days');

        describe('props.minimumNights is 0', () => {
          it('calls props.onDatesChange with props.widget_date and provided end date', () => {
            const onDatesChangeStub = sinon.stub();
            const wrapper = shallow((
              <DateRangePickerInputController
                onDatesChange={onDatesChangeStub}
                widget_date={widget_date}
                minimumNights={0}
              />
            ));
            wrapper.instance().onwidget_date_toChange(validFutureDateString);
            expect(onDatesChangeStub.callCount).to.equal(1);

            const onDatesChangeArgs = onDatesChangeStub.getCall(0).args[0];
            const futureDate = moment(validFutureDateString);
            expect(onDatesChangeArgs.widget_date).to.equal(widget_date);
            expect(isSameDay(onDatesChangeArgs.widget_date_to, futureDate)).to.equal(true);
          });
        });

        describe('props.minimumNights is greater than 0', () => {
          it('calls props.onDatesChange with props.widget_date and null end date', () => {
            const onDatesChangeStub = sinon.stub();
            const wrapper = shallow((
              <DateRangePickerInputController
                onDatesChange={onDatesChangeStub}
                widget_date={widget_date}
                minimumNights={1}
              />
            ));
            wrapper.instance().onwidget_date_toChange(validFutureDateString);
            expect(onDatesChangeStub.callCount).to.equal(1);

            const onDatesChangeArgs = onDatesChangeStub.getCall(0).args[0];
            expect(onDatesChangeArgs.widget_date).to.equal(widget_date);
            expect(onDatesChangeArgs.widget_date_to).to.equal(null);
          });
        });

        describe('props.onFocusChange', () => {
          it('is called once', () => {
            const onFocusChangeStub = sinon.stub();
            const wrapper = shallow((
              <DateRangePickerInputController onFocusChange={onFocusChangeStub} />
            ));
            wrapper.instance().onwidget_date_toChange(validFutureDateString);
            expect(onFocusChangeStub.callCount).to.equal(1);
          });

          it('is called with null arg', () => {
            const onFocusChangeStub = sinon.stub();
            const wrapper = shallow((
              <DateRangePickerInputController onFocusChange={onFocusChangeStub} />
            ));
            wrapper.instance().onwidget_date_toChange(validFutureDateString);
            expect(onFocusChangeStub.calledWith(null)).to.equal(true);
          });
        });
      });
    });

    describe('matches custom display format', () => {
      const customFormat = 'YY|MM[foobar]DD';
      const customFormatDateString = moment(today).add(5, 'days').format(customFormat);
      it('calls props.onDatesChange with correct arguments', () => {
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DateRangePickerInputController
            displayFormat={customFormat}
            onDatesChange={onDatesChangeStub}
          />
        ));
        wrapper.instance().onwidget_date_toChange(customFormatDateString);
        expect(onDatesChangeStub.callCount).to.equal(1);

        const { widget_date, widget_date_to } = onDatesChangeStub.getCall(0).args[0];
        expect(widget_date).to.equal(wrapper.instance().props.widget_date);
        expect(widget_date_to.format(customFormat)).to.equal(customFormatDateString);
      });

      describe('props.onFocusChange', () => {
        it('is called once', () => {
          const onFocusChangeStub = sinon.stub();
          const wrapper = shallow((
            <DateRangePickerInputController
              displayFormat={customFormat}
              onFocusChange={onFocusChangeStub}
            />
          ));
          wrapper.instance().onwidget_date_toChange(customFormatDateString);
          expect(onFocusChangeStub.callCount).to.equal(1);
        });

        it('is called with null arg', () => {
          const onFocusChangeStub = sinon.stub();
          const wrapper = shallow((
            <DateRangePickerInputController
              displayFormat={customFormat}
              onFocusChange={onFocusChangeStub}
            />
          ));
          wrapper.instance().onwidget_date_toChange(customFormatDateString);
          expect(onFocusChangeStub.calledWith(null)).to.equal(true);
        });
      });
    });

    describe('is not a valid date string', () => {
      const invalidDateString = 'foo';
      it('calls props.onDatesChange', () => {
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DateRangePickerInputController onDatesChange={onDatesChangeStub} />
        ));
        wrapper.instance().onwidget_date_toChange(invalidDateString);
        expect(onDatesChangeStub.callCount).to.equal(1);
      });

      it('calls props.onDatesChange with widget_date === props.widget_date', () => {
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DateRangePickerInputController
            onDatesChange={onDatesChangeStub}
            widget_date={today}
          />
        ));
        wrapper.instance().onwidget_date_toChange(invalidDateString);
        const args = onDatesChangeStub.getCall(0).args[0];
        expect(args.widget_date).to.equal(today);
      });

      it('calls props.onDatesChange with widget_date_to === null', () => {
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DateRangePickerInputController onDatesChange={onDatesChangeStub} />
        ));
        wrapper.instance().onwidget_date_toChange(invalidDateString);
        const args = onDatesChangeStub.getCall(0).args[0];
        expect(args.widget_date_to).to.equal(null);
      });
    });

    describe('is outside range', () => {
      const futureDate = moment().add(7, 'day').toISOString();
      const isOutsideRange = (day) => day >= moment().add(3, 'day');

      it('calls props.onDatesChange', () => {
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DateRangePickerInputController
            onDatesChange={onDatesChangeStub}
            isOutsideRange={isOutsideRange}
          />
        ));
        wrapper.instance().onwidget_date_toChange(futureDate);
        expect(onDatesChangeStub.callCount).to.equal(1);
      });

      it('calls props.onDatesChange with widget_date === props.widget_date', () => {
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DateRangePickerInputController
            onDatesChange={onDatesChangeStub}
            widget_date={today}
            isOutsideRange={isOutsideRange}
          />
        ));
        wrapper.instance().onwidget_date_toChange(futureDate);
        const args = onDatesChangeStub.getCall(0).args[0];
        expect(args.widget_date).to.equal(today);
      });

      it('calls props.onDatesChange with widget_date_to === null', () => {
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DateRangePickerInputController
            onDatesChange={onDatesChangeStub}
            isOutsideRange={isOutsideRange}
          />
        ));
        wrapper.instance().onwidget_date_toChange(futureDate);
        const args = onDatesChangeStub.getCall(0).args[0];
        expect(args.widget_date_to).to.equal(null);
      });
    });

    describe('is blocked', () => {
      const futureDate = moment().add(7, 'days').format('MM/DD/YYYY');
      const isDayBlocked = sinon.stub().returns(true);

      it('calls props.onDatesChange', () => {
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DateRangePickerInputController
            onDatesChange={onDatesChangeStub}
            isDayBlocked={isDayBlocked}
          />
        ));
        wrapper.instance().onwidget_date_toChange(futureDate);
        expect(onDatesChangeStub.callCount).to.equal(1);
      });

      it('calls props.onDatesChange with widget_date_to === null', () => {
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DateRangePickerInputController
            onDatesChange={onDatesChangeStub}
            widget_date={today}
            isDayBlocked={isDayBlocked}
          />
        ));
        wrapper.instance().onwidget_date_toChange(futureDate);
        const args = onDatesChangeStub.getCall(0).args[0];
        expect(args.widget_date_to).to.equal(null);
      });
    });

    describe('is inclusively before state.widget_date', () => {
      const widget_date = moment(today).add(10, 'days');
      const beforewidget_dateString = today.toISOString();
      it('calls props.onDatesChange', () => {
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DateRangePickerInputController
            onDatesChange={onDatesChangeStub}
            widget_date={widget_date}
          />
        ));
        wrapper.instance().onwidget_date_toChange(beforewidget_dateString);
        expect(onDatesChangeStub.callCount).to.equal(1);
      });

      it('calls props.onDatesChange with widget_date === props.widget_date', () => {
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DateRangePickerInputController
            onDatesChange={onDatesChangeStub}
            widget_date={widget_date}
          />
        ));
        wrapper.instance().onwidget_date_toChange(beforewidget_dateString);
        const args = onDatesChangeStub.getCall(0).args[0];
        expect(args.widget_date).to.equal(widget_date);
      });

      it('calls props.onDatesChange with widget_date_to === null', () => {
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DateRangePickerInputController
            onDatesChange={onDatesChangeStub}
            widget_date={widget_date}
          />
        ));
        wrapper.instance().onwidget_date_toChange(beforewidget_dateString);
        const args = onDatesChangeStub.getCall(0).args[0];
        expect(args.widget_date_to).to.equal(null);
      });
    });
  });

  describe('#onwidget_dateChange', () => {
    describe('is a valid start date', () => {
      const validFutureDateString = moment(today).add(5, 'days').format('YYYY-MM-DD');
      describe('is before props.widget_date_to', () => {
        const widget_date_to = moment(today).add(10, 'days');
        it('calls props.onDatesChange provided start date and props.widget_date_to', () => {
          const onDatesChangeStub = sinon.stub();
          const wrapper = shallow((
            <DateRangePickerInputController onDatesChange={onDatesChangeStub} widget_date_to={widget_date_to} />
          ));
          wrapper.instance().onwidget_dateChange(validFutureDateString);
          expect(onDatesChangeStub.callCount).to.equal(1);

          const onDatesChangeArgs = onDatesChangeStub.getCall(0).args[0];
          const futureDate = moment(validFutureDateString);
          expect(isSameDay(onDatesChangeArgs.widget_date, futureDate)).to.equal(true);
          expect(onDatesChangeArgs.widget_date_to).to.equal(widget_date_to);
        });

        describe('props.onFocusChange', () => {
          it('is called once', () => {
            const onFocusChangeStub = sinon.stub();
            const wrapper = shallow((
              <DateRangePickerInputController
                onFocusChange={onFocusChangeStub}
                widget_date_to={widget_date_to}
              />
            ));
            wrapper.instance().onwidget_dateChange(validFutureDateString);
            expect(onFocusChangeStub.callCount).to.equal(1);
          });

          it('is called with END_DATE arg', () => {
            const onFocusChangeStub = sinon.stub();
            const wrapper = shallow((
              <DateRangePickerInputController
                onFocusChange={onFocusChangeStub}
                widget_date_to={widget_date_to}
              />
            ));
            wrapper.instance().onwidget_dateChange(validFutureDateString);
            expect(onFocusChangeStub.calledWith(END_DATE)).to.equal(true);
          });
        });
      });

      describe('is after props.widget_date_to', () => {
        const widget_date_to = moment(today);
        it('calls props.onDatesChange with provided start date and null end date', () => {
          const onDatesChangeStub = sinon.stub();
          const wrapper = shallow((
            <DateRangePickerInputController
              onDatesChange={onDatesChangeStub}
              widget_date_to={widget_date_to}
            />
          ));
          wrapper.instance().onwidget_dateChange(validFutureDateString);
          expect(onDatesChangeStub.callCount).to.equal(1);

          const onDatesChangeArgs = onDatesChangeStub.getCall(0).args[0];
          const futureDate = moment(validFutureDateString);
          expect(isSameDay(onDatesChangeArgs.widget_date, futureDate)).to.equal(true);
          expect(onDatesChangeArgs.widget_date_to).to.equal(null);
        });

        describe('props.onFocusChange', () => {
          it('is called once', () => {
            const onFocusChangeStub = sinon.stub();
            const wrapper = shallow((
              <DateRangePickerInputController
                onFocusChange={onFocusChangeStub}
                widget_date_to={widget_date_to}
              />
            ));
            wrapper.instance().onwidget_dateChange(validFutureDateString);
            expect(onFocusChangeStub.callCount).to.equal(1);
          });

          it('is called with END_DATE arg', () => {
            const onFocusChangeStub = sinon.stub();
            const wrapper = shallow((
              <DateRangePickerInputController
                onFocusChange={onFocusChangeStub}
                widget_date_to={widget_date_to}
              />
            ));
            wrapper.instance().onwidget_dateChange(validFutureDateString);
            expect(onFocusChangeStub.calledWith(END_DATE)).to.equal(true);
          });
        });
      });

      describe('is the same day as props.widget_date_to', () => {
        const widget_date_to = moment(today).add(5, 'days');

        describe('props.minimumNights is 0', () => {
          it('calls props.onDatesChange with provided start date and props.widget_date_to', () => {
            const onDatesChangeStub = sinon.stub();
            const wrapper = shallow((
              <DateRangePickerInputController
                onDatesChange={onDatesChangeStub}
                widget_date_to={widget_date_to}
                minimumNights={0}
              />
            ));
            wrapper.instance().onwidget_dateChange(validFutureDateString);
            expect(onDatesChangeStub.callCount).to.equal(1);

            const onDatesChangeArgs = onDatesChangeStub.getCall(0).args[0];
            const futureDate = moment(validFutureDateString);
            expect(isSameDay(onDatesChangeArgs.widget_date, futureDate)).to.equal(true);
            expect(onDatesChangeArgs.widget_date_to).to.equal(widget_date_to);
          });
        });

        describe('props.minimumNights is greater than 0', () => {
          it('calls props.onDatesChange with provided start date and null end date', () => {
            const onDatesChangeStub = sinon.stub();
            const wrapper = shallow((
              <DateRangePickerInputController
                onDatesChange={onDatesChangeStub}
                widget_date_to={widget_date_to}
                minimumNights={1}
              />
            ));
            wrapper.instance().onwidget_dateChange(validFutureDateString);
            expect(onDatesChangeStub.callCount).to.equal(1);

            const onDatesChangeArgs = onDatesChangeStub.getCall(0).args[0];
            const futureDate = moment(validFutureDateString);
            expect(isSameDay(onDatesChangeArgs.widget_date, futureDate)).to.equal(true);
            expect(onDatesChangeArgs.widget_date_to).to.equal(null);
          });
        });

        describe('props.onFocusChange', () => {
          it('is called once', () => {
            const onFocusChangeStub = sinon.stub();
            const wrapper = shallow((
              <DateRangePickerInputController
                onFocusChange={onFocusChangeStub}
                widget_date_to={widget_date_to}
              />
            ));
            wrapper.instance().onwidget_dateChange(validFutureDateString);
            expect(onFocusChangeStub.callCount).to.equal(1);
          });

          it('is called with END_DATE arg', () => {
            const onFocusChangeStub = sinon.stub();
            const wrapper = shallow((
              <DateRangePickerInputController
                onFocusChange={onFocusChangeStub}
                widget_date_to={widget_date_to}
              />
            ));
            wrapper.instance().onwidget_dateChange(validFutureDateString);
            expect(onFocusChangeStub.calledWith(END_DATE)).to.equal(true);
          });
        });
      });
    });

    describe('matches custom display format', () => {
      const customFormat = 'YY|MM[foobar]DD';
      const customFormatDateString = moment(today).add(5, 'days').format(customFormat);
      it('calls props.onDatesChange with correct arguments', () => {
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DateRangePickerInputController
            displayFormat={customFormat}
            onDatesChange={onDatesChangeStub}
          />
        ));
        wrapper.instance().onwidget_dateChange(customFormatDateString);
        expect(onDatesChangeStub.callCount).to.equal(1);

        const { widget_date, widget_date_to } = onDatesChangeStub.getCall(0).args[0];
        expect(widget_date.format(customFormat)).to.equal(customFormatDateString);
        expect(widget_date_to).to.equal(wrapper.instance().props.widget_date_to);
      });

      describe('props.onFocusChange', () => {
        it('is called once', () => {
          const onFocusChangeStub = sinon.stub();
          const wrapper = shallow((
            <DateRangePickerInputController
              displayFormat={customFormat}
              onFocusChange={onFocusChangeStub}
            />
          ));
          wrapper.instance().onwidget_dateChange(customFormatDateString);
          expect(onFocusChangeStub.callCount).to.equal(1);
        });

        it('is called with END_DATE arg', () => {
          const onFocusChangeStub = sinon.stub();
          const wrapper = shallow((
            <DateRangePickerInputController
              displayFormat={customFormat}
              onFocusChange={onFocusChangeStub}
            />
          ));
          wrapper.instance().onwidget_dateChange(customFormatDateString);
          expect(onFocusChangeStub.calledWith(END_DATE)).to.equal(true);
        });
      });
    });

    describe('is not a valid date string', () => {
      const invalidDateString = 'foo';
      it('calls props.onDatesChange', () => {
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DateRangePickerInputController onDatesChange={onDatesChangeStub} />
        ));
        wrapper.instance().onwidget_dateChange(invalidDateString);
        expect(onDatesChangeStub.callCount).to.equal(1);
      });

      it('calls props.onDatesChange with widget_date === null', () => {
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DateRangePickerInputController
            onDatesChange={onDatesChangeStub}
            widget_date={today}
          />
        ));
        wrapper.instance().onwidget_dateChange(invalidDateString);
        const args = onDatesChangeStub.getCall(0).args[0];
        expect(args.widget_date).to.equal(null);
      });

      it('calls props.onDatesChange with widget_date_to === props.widget_date_to', () => {
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DateRangePickerInputController onDatesChange={onDatesChangeStub} widget_date_to={today} />
        ));
        wrapper.instance().onwidget_dateChange(invalidDateString);
        const args = onDatesChangeStub.getCall(0).args[0];
        expect(args.widget_date_to).to.equal(today);
      });
    });

    describe('is outside range', () => {
      const futureDate = moment().add(7, 'days').format('MM/DD/YYYY');
      const isOutsideRange = (day) => day > moment().add(5, 'days');

      it('calls props.onDatesChange', () => {
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DateRangePickerInputController
            onDatesChange={onDatesChangeStub}
            isOutsideRange={isOutsideRange}
          />
        ));
        wrapper.instance().onwidget_dateChange(futureDate);
        expect(onDatesChangeStub.callCount).to.equal(1);
      });

      it('calls props.onDatesChange with widget_date === null', () => {
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DateRangePickerInputController
            onDatesChange={onDatesChangeStub}
            widget_date={today}
            isOutsideRange={isOutsideRange}
          />
        ));
        wrapper.instance().onwidget_dateChange(futureDate);
        const args = onDatesChangeStub.getCall(0).args[0];
        expect(args.widget_date).to.equal(null);
      });

      it('calls props.onDatesChange with widget_date_to === props.widget_date_to', () => {
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DateRangePickerInputController
            onDatesChange={onDatesChangeStub}
            widget_date_to={today}
            isOutsideRange={isOutsideRange}
          />
        ));
        wrapper.instance().onwidget_dateChange(futureDate);
        const args = onDatesChangeStub.getCall(0).args[0];
        expect(args.widget_date_to).to.equal(today);
      });
    });

    describe('is blocked', () => {
      const futureDate = moment().add(7, 'days').format('MM/DD/YYYY');
      const isDayBlocked = sinon.stub().returns(true);

      it('calls props.onDatesChange', () => {
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DateRangePickerInputController
            onDatesChange={onDatesChangeStub}
            isDayBlocked={isDayBlocked}
          />
        ));
        wrapper.instance().onwidget_dateChange(futureDate);
        expect(onDatesChangeStub.callCount).to.equal(1);
      });

      it('calls props.onDatesChange with widget_date === null', () => {
        const onDatesChangeStub = sinon.stub();
        const wrapper = shallow((
          <DateRangePickerInputController
            onDatesChange={onDatesChangeStub}
            widget_date={today}
            isDayBlocked={isDayBlocked}
          />
        ));
        wrapper.instance().onwidget_dateChange(futureDate);
        const args = onDatesChangeStub.getCall(0).args[0];
        expect(args.widget_date).to.equal(null);
      });
    });
  });

  describe('#onwidget_dateFocus', () => {
    it('calls props.onFocusChange once', () => {
      const onFocusChangeStub = sinon.stub();
      const wrapper = shallow((
        <DateRangePickerInputController onFocusChange={onFocusChangeStub} />
      ));
      wrapper.instance().onwidget_dateFocus();
      expect(onFocusChangeStub).to.have.property('callCount', 1);
    });

    it('calls props.onFocusChange with START_DATE as arg', () => {
      const onFocusChangeStub = sinon.stub();
      const wrapper = shallow((
        <DateRangePickerInputController onFocusChange={onFocusChangeStub} />
      ));
      wrapper.instance().onwidget_dateFocus();
      expect(onFocusChangeStub.getCall(0).args[0]).to.equal(START_DATE);
    });

    describe('props.disabled', () => {
      describe('props.disabled=START_DATE', () => {
        it('does not call props.onFocusChange', () => {
          const onFocusChangeStub = sinon.stub();
          const wrapper = shallow((
            <DateRangePickerInputController
              disabled={START_DATE}
              onFocusChange={onFocusChangeStub}
            />
          ));
          wrapper.instance().onwidget_dateFocus();
          expect(onFocusChangeStub).to.have.property('callCount', 0);
        });
      });

      describe('props.disabled=END_DATE', () => {
        it('does call props.onFocusChange', () => {
          const onFocusChangeStub = sinon.stub();
          const wrapper = shallow((
            <DateRangePickerInputController
              disabled={END_DATE}
              onFocusChange={onFocusChangeStub}
            />
          ));
          wrapper.instance().onwidget_dateFocus();
          expect(onFocusChangeStub).to.have.property('callCount', 1);
        });
      });

      describe('props.disabled=true', () => {
        it('does not call props.onFocusChange', () => {
          const onFocusChangeStub = sinon.stub();
          const wrapper = shallow((
            <DateRangePickerInputController
              disabled
              onFocusChange={onFocusChangeStub}
            />
          ));
          wrapper.instance().onwidget_dateFocus();
          expect(onFocusChangeStub).to.have.property('callCount', 0);
        });
      });

      describe('props.disabled=false', () => {
        it('does call props.onFocusChange', () => {
          const onFocusChangeStub = sinon.stub();
          const wrapper = shallow((
            <DateRangePickerInputController
              disabled={false}
              onFocusChange={onFocusChangeStub}
            />
          ));
          wrapper.instance().onwidget_dateFocus();
          expect(onFocusChangeStub).to.have.property('callCount', 1);
        });
      });
    });
  });

  describe('#onwidget_date_toFocus', () => {
    it('calls props.onFocusChange once with arg END_DATE', () => {
      const onFocusChangeStub = sinon.stub();
      const wrapper = shallow((
        <DateRangePickerInputController onFocusChange={onFocusChangeStub} />
      ));
      wrapper.instance().onwidget_date_toFocus();
      expect(onFocusChangeStub).to.have.property('callCount', 1);
      expect(onFocusChangeStub.getCall(0).args[0]).to.equal(END_DATE);
    });

    describe('props.widget_date = moment', () => {
      it('calls props.onFocusChange once with arg END_DATE', () => {
        const onFocusChangeStub = sinon.stub();
        const wrapper = shallow((
          <DateRangePickerInputController
            widget_date={moment(today)}
            onFocusChange={onFocusChangeStub}
          />
        ));
        wrapper.instance().onwidget_date_toFocus();
        expect(onFocusChangeStub).to.have.property('callCount', 1);
        expect(onFocusChangeStub.getCall(0).args[0]).to.equal(END_DATE);
      });
    });

    describe('props.withFullScreenPortal is truthy', () => {
      it('calls props.onFocusChange once with arg START_DATE', () => {
        const onFocusChangeStub = sinon.stub();
        const wrapper = shallow((
          <DateRangePickerInputController
            withFullScreenPortal
            onFocusChange={onFocusChangeStub}
          />
        ));
        wrapper.instance().onwidget_date_toFocus();
        expect(onFocusChangeStub).to.have.property('callCount', 1);
        expect(onFocusChangeStub.getCall(0).args[0]).to.equal(START_DATE);
      });
    });

    describe('props.widget_date = moment', () => {
      it('calls props.onFocusChange once with arg END_DATE', () => {
        const onFocusChangeStub = sinon.stub();
        const wrapper = shallow((
          <DateRangePickerInputController
            widget_date={moment(today)}
            onFocusChange={onFocusChangeStub}
          />
        ));
        wrapper.instance().onwidget_date_toFocus();
        expect(onFocusChangeStub).to.have.property('callCount', 1);
        expect(onFocusChangeStub.getCall(0).args[0]).to.equal(END_DATE);
      });
    });

    describe('props.disabled', () => {
      describe('props.disabled=START_DATE', () => {
        it('does call props.onFocusChange', () => {
          const onFocusChangeStub = sinon.stub();
          const wrapper = shallow((
            <DateRangePickerInputController
              disabled={START_DATE}
              onFocusChange={onFocusChangeStub}
            />
          ));
          wrapper.instance().onwidget_date_toFocus();
          expect(onFocusChangeStub.callCount).to.equal(1);
        });
      });

      describe('props.disabled=END_DATE', () => {
        it('does not call props.onFocusChange', () => {
          const onFocusChangeStub = sinon.stub();
          const wrapper = shallow((
            <DateRangePickerInputController
              disabled={END_DATE}
              onFocusChange={onFocusChangeStub}
            />
          ));
          wrapper.instance().onwidget_date_toFocus();
          expect(onFocusChangeStub.callCount).to.equal(0);
        });
      });

      describe('props.disabled=true', () => {
        it('does not call props.onFocusChange', () => {
          const onFocusChangeStub = sinon.stub();
          const wrapper = shallow((
            <DateRangePickerInputController
              disabled
              onFocusChange={onFocusChangeStub}
            />
          ));
          wrapper.instance().onwidget_date_toFocus();
          expect(onFocusChangeStub.callCount).to.equal(0);
        });
      });

      describe('props.disabled=false', () => {
        it('does call props.onFocusChange', () => {
          const onFocusChangeStub = sinon.stub();
          const wrapper = shallow((
            <DateRangePickerInputController
              disabled={false}
              onFocusChange={onFocusChangeStub}
            />
          ));
          wrapper.instance().onwidget_date_toFocus();
          expect(onFocusChangeStub.callCount).to.equal(1);
        });
      });
    });
  });
});
