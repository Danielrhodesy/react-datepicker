import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';
import DateRangePickerWrapper from './components/DateRangePickerWrapper';


//API Request for CloudBeds Reservation Data
  // Begin accessing JSON data here


const request = new XMLHttpRequest()

request.open('GET', 'https://ghibliapi.herokuapp.com/films', true)

let data

request.onload = function () {
   let data = JSON.parse(this.response)

  if (request.status >= 200 && request.status < 400) {
    data.forEach((movie) => {
      console.log(movie.title)
    })
  } else {
    console.log('error')
  }
}

console.log(data,"outside")

request.send()



    class App extends Component {
        constructor(props) {
          super(props);
          this.state = {
          
          };
        }
        render() {
            return (
                <>
                    <DateRangePickerWrapper value={this.state.child1}/> 
                </>
            )
        }
    }

ReactDOM.render(
React.createElement(App, {}, null),
document.getElementById('react-datepicker')
);






export { default as CalendarDay } from './components/CalendarDay';
export { default as CalendarMonth } from './components/CalendarMonth';
export { default as CalendarMonthGrid } from './components/CalendarMonthGrid';
export { default as DateRangePicker } from './components/DateRangePicker';
export { default as DateRangePickerInput } from './components/DateRangePickerInput';
export { default as DateRangePickerInputController } from './components/DateRangePickerInputController';
export { default as DateRangePickerShape } from './shapes/DateRangePickerShape';
export { default as DayPicker } from './components/DayPicker';
export { default as DayPickerRangeController } from './components/DayPickerRangeController';
export { default as DayPickerSingleDateController } from './components/DayPickerSingleDateController';
export { default as SingleDatePicker } from './components/SingleDatePicker';
export { default as SingleDatePickerInput } from './components/SingleDatePickerInput';
export { default as SingleDatePickerShape } from './shapes/SingleDatePickerShape';
export { default as isInclusivelyAfterDay } from './utils/isInclusivelyAfterDay';
export { default as isInclusivelyBeforeDay } from './utils/isInclusivelyBeforeDay';
export { default as isNextDay } from './utils/isNextDay';
export { default as isSameDay } from './utils/isSameDay';
export { default as toISODateString } from './utils/toISODateString';
export { default as toLocalizedDateString } from './utils/toLocalizedDateString';
export { default as toMomentObject } from './utils/toMomentObject';
