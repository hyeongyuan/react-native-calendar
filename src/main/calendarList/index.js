import React from 'react';
import {
  View,
  Text,
  PanResponder,
  Animated,
  ScrollView,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import XDate from 'xdate';
import {xdateToData, parseDate} from '../interface';

import CalendarListItem from './item';
// import CalendarListWeek from './week';
import CalendarHeader from './header';

import Meeting from '../meeting';
// import {Agenda, LocaleConfig} from 'react-native-calendars';

// LocaleConfig.locales['kr'] = {
//   monthNames: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
//     month => `${month}월`,
//   ),
//   monthNamesShort: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
//     month => `${month}월`,
//   ),
//   dayNames: [
//     '일요일',
//     '월요일',
//     '화요일',
//     '수요일',
//     '목요일',
//     '금요일',
//     '일요일',
//   ],
//   dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
//   today: "Aujourd'hui",
// };
// LocaleConfig.defaultLocale = 'kr';
const windowSize = Dimensions.get('window');

export default class CalendarList extends React.PureComponent {
  static defaultProps = {
    pastScrollRange: 2,
    futureScrollRange: 2,
  };

  constructor(props) {
    super(props);

    this.viewabilityConfig = {
      itemVisiblePercentThreshold: 20,
    };

    this.viewHeight = windowSize.height;
    this.viewWidth = windowSize.width;

    this.dayWidth = (windowSize.width - 40) / 7;
    this.showWeeks = 6;
    this.calendarHeight = this.dayWidth * this.showWeeks;

    const rows = [];
    const texts = [];
    const date = parseDate(props.current) || XDate();

    const weekRows = [];
    const weekTexts = [];

    for (
      let i = 0;
      i <= this.props.pastScrollRange + this.props.futureScrollRange;
      i++
    ) {
      const rangeDate = date
        .clone()
        .addMonths(i - this.props.pastScrollRange, true);
      const rangeDateStr = rangeDate.toString('MMM yyyy');

      const rangeWeek = date.clone().addWeeks(i - this.props.pastScrollRange);
      const rangeWeekStr = rangeWeek.toString('dd MMM yyyy');

      texts.push(rangeDateStr);
      weekTexts.push(rangeWeekStr);

      if (
        (this.props.pastScrollRange - 1 <= i &&
          i <= this.props.pastScrollRange + 1) ||
        (!this.props.pastScrollRange && i <= this.props.pastScrollRange + 2)
      ) {
        rows.push(rangeDate);
        weekRows.push(rangeWeek);
      } else {
        rows.push(rangeDateStr);
        weekRows.push(rangeWeekStr);
      }
    }

    this.state = {
      rows,
      texts,
      weekRows,
      weekTexts,
      openDate: date,
      currentMonth: parseDate(props.current),

      collapsed: false,
      selectedDate: date,
      weekCount: this.getWeekNumber(date),
    };

    this.listOnTop = true;
    this.contentHeight = this.viewHeight - this.calendarHeight;
    this._contentHeightAnimation = new Animated.Value(this.contentHeight);

    this.calendarMove = this.dayWidth * this.state.weekCount;
    this._calendarMoveAnimation = new Animated.Value(this.calendarMove);

    this._topPanResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return !this.state.collapsed && Math.abs(gestureState.dy) > 30;
        // return (
        //   !this.state.collapsed &&
        //   Math.abs(gestureState.dy) > Math.abs(gestureState.dx * 10) &&
        //   Math.abs(gestureState.vy) > Math.abs(gestureState.vx * 5)
        // );
      },
      onPanResponderMove: this.onPanResponderMove,
      onPanResponderRelease: this.onPanResponderRelease,
    });

    this._bottomPanResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const {collapsed} = this.state;
        return (
          (collapsed && gestureState.dy > 0 && this.listOnTop) ||
          (!collapsed && gestureState.dy < 0)
        );
      },
      onPanResponderMove: this.onPanResponderMove,
      onPanResponderRelease: this.onPanResponderRelease,
    });
  }

  onLayout = ({nativeEvent}) => {
    this.viewHeight = nativeEvent.layout.height;
    this.viewWidth = nativeEvent.layout.width;

    this.contentHeight = this.viewHeight - this.calendarHeight;

    this._contentHeightAnimation.setValue(
      this.viewHeight - this.calendarHeight,
    );
  };

  onPanResponderMove = (evt, gestureState) => {
    if (
      Math.abs(gestureState.dy) <= 4 * this.dayWidth &&
      this.viewHeight - this.calendarHeight <=
        this.contentHeight - gestureState.dy &&
      this.viewHeight - this.dayWidth >= this.contentHeight - gestureState.dy
    ) {
      this._contentHeightAnimation.setValue(
        this.contentHeight - gestureState.dy,
      );
      this._calendarMoveAnimation.setValue(
        this.calendarMove + gestureState.dy * (this.state.weekCount / 4),
      );
    }
  };

  onPanResponderRelease = (evt, gestureState) => {
    const duration = 300;
    const collapseAnimation = Animated.parallel([
      Animated.timing(this._contentHeightAnimation, {
        toValue: this.viewHeight - this.dayWidth * 1,
        duration,
      }),
      Animated.timing(this._calendarMoveAnimation, {
        toValue: 0,
        duration,
      }),
    ]);

    const expandAnimation = Animated.parallel([
      Animated.timing(this._contentHeightAnimation, {
        toValue: this.viewHeight - this.calendarHeight,
        duration,
      }),
      Animated.timing(this._calendarMoveAnimation, {
        toValue: this.dayWidth * this.state.weekCount,
        duration,
      }),
    ]);

    if (gestureState.vy > 0) {
      expandAnimation.start(() => {
        this.contentHeight = this._contentHeightAnimation._value;
        this.calendarMove = this._calendarMoveAnimation._value;
        // this.listOnTop = true;
        this.setState({collapsed: false});
      });
    } else if (gestureState.vy < 0) {
      collapseAnimation.start(() => {
        this.contentHeight = this._contentHeightAnimation._value;
        this.calendarMove = this._calendarMoveAnimation._value;
        // this.listOnTop = false;
        this.setState({collapsed: true});
      });
    }
  };

  getMonthIndex(month) {
    let diffMonths = Math.round(
      this.state.openDate
        .clone()
        .setDate(1)
        .diffMonths(month.clone().setDate(1)),
    );

    return diffMonths + this.props.pastScrollRange;
  }

  getWeekIndex(week) {
    let diffWeeks =
      this.state.openDate.diffWeeks(week) + this.props.pastScrollRange;
    return diffWeeks;
  }

  getWeekNumber(date) {
    let firstDay = date
      .clone()
      .setDate(1)
      .getDay();

    return Math.floor((firstDay - 1 + date.getDate()) / 7);
  }

  getItemLayout = (data, index) => {
    return {
      length: this.viewWidth,
      offset: this.viewWidth * index,
      index,
    };
  };

  onChangeSelectedDate = date => {
    this.setState({selectedDate: date});
  };

  onViewableMonthsChanged = ({viewableItems}) => {
    function rowIsCloseToViewable(index, distance) {
      for (let i = 0; i < viewableItems.length; i++) {
        if (Math.abs(index - parseInt(viewableItems[i].index)) <= distance) {
          return true;
        }
      }
      return false;
    }

    const rowclone = this.state.rows;
    const newrows = [];
    const visibleMonths = [];

    for (let i = 0; i < rowclone.length; i++) {
      let val = rowclone[i];
      const rowShouldBeRendered = rowIsCloseToViewable(i, 1);

      if (rowShouldBeRendered && !rowclone[i].getTime) {
        val = this.state.openDate
          .clone()
          .addMonths(i - this.props.pastScrollRange, true);
      } else if (!rowShouldBeRendered) {
        val = this.state.texts[i];
      }
      newrows.push(val);
      if (rowIsCloseToViewable(i, 0)) {
        visibleMonths.push(xdateToData(val));
      }
    }

    if (viewableItems.length === 1) {
      this.scrollToWeek(viewableItems[0].item);
    }

    // if (this.props.onVisibleMonthsChange) {
    //   this.props.onVisibleMonthsChange(visibleMonths);
    // }

    this.setState({
      rows: newrows,
      currentMonth: parseDate(visibleMonths[0]),
    });
  };

  onViewableWeeksChanged = ({viewableItems}) => {
    function rowIsCloseToViewable(index, distance) {
      for (let i = 0; i < viewableItems.length; i++) {
        if (Math.abs(index - parseInt(viewableItems[i].index)) <= distance) {
          return true;
        }
      }
      return false;
    }

    const rowclone = this.state.weekRows;
    const newrows = [];
    const visibleMonths = [];

    for (let i = 0; i < rowclone.length; i++) {
      let val = rowclone[i];
      const rowShouldBeRendered = rowIsCloseToViewable(i, 1);

      if (rowShouldBeRendered && !rowclone[i].getTime) {
        val = this.state.openDate
          .clone()
          .addWeeks(i - this.props.pastScrollRange);
      } else if (!rowShouldBeRendered) {
        val = this.state.texts[i];
      }
      newrows.push(val);
    }

    if (viewableItems.length === 1) {
      this.scrollToMonth(viewableItems[0].item);
    }

    const weekNumber = this.getWeekNumber(viewableItems[0].item);
    this.setState({
      weekRows: newrows,
      weekCount: weekNumber,
    });
  };

  scrollToMonth(m) {
    const month = parseDate(m);
    const scrollTo = month || this.state.openDate;
    const scrollToIndex = this.getMonthIndex(scrollTo);

    this.monthCalendarRef.scrollToIndex({
      animated: false,
      index: scrollToIndex,
    });
  }

  scrollToWeek(m) {
    const month = parseDate(m);
    const scrollTo = month || this.state.openDate;
    const scrollToIndex = this.getWeekIndex(scrollTo);

    // this.weekCalendarRef.scrollToIndex({
    //   animated: false,
    //   index: scrollToIndex,
    // });
  }

  onScroll = ({nativeEvent}) => {
    this.listOnTop = nativeEvent.contentOffset.y === 0;
  };

  renderCalendar = ({item, isMonth}) => {
    return (
      <CalendarListItem
        isMonth={isMonth}
        row={item}
        onChangeSelectedDate={this.onChangeSelectedDate}
        selected={this.state.selectedDate}
      />
    );
  };

  rednerMeeting({item}) {
    return <Meeting />;
  }

  render() {
    const {children} = this.props;
    return (
      <View style={{flex: 1, overflow: 'hidden'}}>
        <CalendarHeader current={this.state.currentMonth} />
        <View
          style={{
            flex: 1,
          }}
          onLayout={this.onLayout}>
          <Animated.View
            style={{
              flex: 1,
              position: 'absolute',
              top: -this.dayWidth * this.state.weekCount,
              transform: [
                {
                  translateY: this._calendarMoveAnimation,
                },
              ],
              backgroundColor: '#fff',
            }}
            {...this._topPanResponder.panHandlers}>
            <FlatList
              ref={ref => {
                this.monthCalendarRef = ref;
              }}
              data={this.state.rows}
              renderItem={({item}) =>
                this.renderCalendar({item, isMonth: true})
              }
              initialListSize={
                this.props.pastScrollRange + this.props.futureScrollRange + 1
              }
              initialScrollIndex={
                this.state.openDate
                  ? this.getMonthIndex(this.state.openDate)
                  : false
              }
              getItemLayout={this.getItemLayout}
              showsHorizontalScrollIndicator={false}
              viewabilityConfig={this.viewabilityConfig}
              onViewableItemsChanged={this.onViewableMonthsChanged}
              keyExtractor={(item, index) => String(index)}
              horizontal
              pagingEnabled
            />
            <View
              style={{
                height: this.dayWidth,
                position: 'absolute',
                top: this.dayWidth * this.state.weekCount,
                left: 0,
                opacity: this.state.collapsed ? 1 : 0,
                zIndex: 0,
              }}>
              <FlatList
                ref={ref => {
                  this.weekCalendarRef = ref;
                }}
                data={this.state.weekRows}
                renderItem={({item}) =>
                  this.renderCalendar({item, isMonth: false})
                }
                initialListSize={
                  this.props.pastScrollRange + this.props.futureScrollRange + 1
                }
                initialScrollIndex={
                  this.state.openDate
                    ? this.getWeekIndex(this.state.openDate)
                    : false
                }
                getItemLayout={this.getItemLayout}
                showsHorizontalScrollIndicator={false}
                viewabilityConfig={this.viewabilityConfig}
                onViewableItemsChanged={this.onViewableWeeksChanged}
                keyExtractor={(item, index) => String(index)}
                horizontal
                pagingEnabled
              />
            </View>
          </Animated.View>
          <Animated.View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: windowSize.width,
              height: this._contentHeightAnimation,
              backgroundColor: '#fff',
              paddingTop: 10,
            }}
            {...this._bottomPanResponder.panHandlers}>
            <FlatList
              data={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
              renderItem={this.rednerMeeting}
              showsVerticalScrollIndicator={false}
              // onEndReached={info => console.log(info)}
              // onEndReachedThreshold={100}
              onScroll={this.onScroll}
              keyExtractor={(item, index) => String(index)}
            />
          </Animated.View>
        </View>
      </View>
    );
  }
}
