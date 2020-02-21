import React, {Component} from 'react';
import {
  View,
  Text,
  Dimensions,
  PanResponder,
  Animated,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {parseDate, xdateToData} from './interface';
import dateUtils from './dateUtils';

const WEEKS = ['일', '월', '화', '수', '목', '금', '토'];
const CAL_MONTHLY = [
  [
    [29, 30, 31, 1, 2, 3, 4],
    [5, 6, 7, 8, 9, 10, 11],
    [12, 13, 14, 15, 16, 17, 18],
    [19, 20, 21, 22, 23, 24, 25],
    [26, 27, 28, 29, 30, 31, 1],
    [2, 3, 4, 5, 6, 7, 8],
  ],
  [
    [26, 27, 28, 29, 30, 31, 1],
    [2, 3, 4, 5, 6, 7, 8],
    [9, 10, 11, 12, 13, 14, 15],
    [16, 17, 18, 19, 20, 21, 22],
    [23, 24, 25, 26, 27, 28, 29],
    [1, 2, 3, 4, 5, 6, 7],
  ],
];
const CAL_WEEKLY = [
  [29, 30, 31, 1, 2, 3, 4],
  [5, 6, 7, 8, 9, 10, 11],
  [12, 13, 14, 15, 16, 17, 18],
  [19, 20, 21, 22, 23, 24, 25],
  [26, 27, 28, 29, 30, 31, 1],
];

const windowSize = Dimensions.get('window');

export default class Calendar extends Component {
  constructor(props) {
    super(props);

    this.viewHeight = windowSize.height;
    this.viewWidth = windowSize.width;

    this.dateWidth = (this.viewWidth - 40) / 7;
    this.showWeeks = 6;
    this.calendarHeight = this.dateWidth * this.showWeeks;

    this.state = {
      selectedDate: parseDate(this.props.selected) || XDate(true),

      collapsed: false,
      weekNum: 2,
    };

    this.currentMonth = this.state.selectedDate.clone();

    console.log(this.currentMonth);

    this.contentHeight = 0;
    this.calendarMove = this.dateWidth * (this.state.weekNum - 1);

    this._animationHeightValue = new Animated.Value(this.contentHeight);
    this._animationMoveValue = new Animated.Value(this.calendarMove);

    this._panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return (
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx * 2) &&
          Math.abs(gestureState.vy) > Math.abs(gestureState.vx * 2)
        );
      },
      onPanResponderMove: (evt, gestureState) => {
        if (Math.abs(gestureState.dy) <= 5 * this.dateWidth) {
          this._animationHeightValue.setValue(
            this.contentHeight - gestureState.dy,
          );
          this._animationMoveValue.setValue(
            this.calendarMove +
              gestureState.dy * ((this.state.weekNum - 1) / 5),
          );
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const collapseAnimation = Animated.parallel([
          Animated.timing(this._animationHeightValue, {
            toValue: this.viewHeight - this.dateWidth * 1,
            duration: 500,
          }),
          Animated.timing(this._animationMoveValue, {
            toValue: 0,
            // toValue: -this.dateWidth * (this.state.weekNum - 1),
            duration: 500,
          }),
        ]);

        const expandAnimation = Animated.parallel([
          Animated.timing(this._animationHeightValue, {
            toValue: this.viewHeight - this.dateWidth * 6,
            duration: 500,
          }),
          Animated.timing(this._animationMoveValue, {
            toValue: this.dateWidth * (this.state.weekNum - 1),
            duration: 500,
          }),
        ]);

        if (gestureState.vy > 0) {
          expandAnimation.start(evnet => {
            this.contentHeight = this._animationHeightValue._value;
            this.calendarMove = this._animationMoveValue._value;
            this.setState({collapsed: false});
          });
        } else if (gestureState.vy < 0) {
          collapseAnimation.start(evnet => {
            this.contentHeight = this._animationHeightValue._value;
            this.calendarMove = this._animationMoveValue._value;
            this.setState({collapsed: true});
          });
        }
      },
    });
  }

  onLayout = ({
    nativeEvent: {
      layout: {height, width},
    },
  }) => {
    this.viewHeight = height;
    this.viewWidth = width;

    this.contentHeight = height - this.calendarHeight;
    this._animationHeightValue.setValue(this.contentHeight);

    const collapseAnimation = Animated.parallel([
      Animated.timing(this._animationHeightValue, {
        toValue: this.viewHeight - this.dateWidth * 1,
        duration: 500,
      }),
      Animated.timing(this._animationMoveValue, {
        toValue: -this.dateWidth * (this.state.weekNum - 1),
        duration: 500,
      }),
    ]);

    const expandAnimation = Animated.parallel([
      Animated.timing(this._animationHeightValue, {
        toValue: this.viewHeight - this.dateWidth * 6,
        duration: 500,
      }),
      Animated.timing(this._animationMoveValue, {
        toValue: this.dateWidth * (this.state.weekNum - 1),
        duration: 500,
      }),
    ]);

    this.setState({
      collapseAnimation,
      expandAnimation,
    });
  };

  renderMonth(month) {
    return (
      <View>
        {month.map((week, i) => (
          <View key={i + 1}>{this.renderWeek(week)}</View>
        ))}
      </View>
    );
  }

  renderWeek(week) {
    return (
      <View
        key={week}
        style={{
          flexDirection: 'row',
          marginHorizontal: 20,
        }}>
        {week.map((date, i) => {
          let outOfMonth = true;
          if (i < week.length - 1) {
          }
          return this.renderDate(date);
        })}
      </View>
    );
  }

  renderDate(date) {
    const {selectedDate} = this.state;
    return (
      <TouchableOpacity
        key={date}
        style={{
          width: this.dateWidth,
          height: this.dateWidth,
          alignItems: 'center',
          paddingTop: 5,
          paddingBottom: 15,
        }}
        onPress={() => {}}>
        <View
          style={{
            backgroundColor: selectedDate === date ? 'blue' : 'transparent',
            width: this.dateWidth - 20,
            height: this.dateWidth - 20,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: (this.dateWidth - 20) / 2,
          }}>
          <Text
            style={{
              color: selectedDate === date ? 'white' : 'black',
              fontWeight: '600',
              fontSize: 16,
            }}>
            {date}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <View style={{flex: 1, overflow: 'hidden'}}>
        <WeekDays />
        <View
          onLayout={this.onLayout}
          style={{
            flex: 1,
            zIndex: 50,
            backgroundColor: 'transparent',
            opacity: 1,
          }}
          {...this._panResponder.panHandlers}>
          <Animated.View
            style={{
              flex: 1,
              position: 'absolute',
              top: -this.dateWidth * (this.state.weekNum - 1),
              transform: [
                {
                  translateY: this._animationMoveValue,
                },
              ],
            }}>
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              pagingEnabled={true}
              style={{backgroundColor: '#fff'}}>
              {CAL_MONTHLY.map(month => this.renderMonth(month))}
            </ScrollView>
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              pagingEnabled={true}
              onMomentumScrollEnd={({nativeEvent}) => {
                const position = nativeEvent.contentOffset;
                const index = Math.round(
                  nativeEvent.contentOffset.x / windowSize.width,
                );
                if (index !== this.state.weekNum) {
                  this.setState({weekNum: index + 2});
                }
              }}
              style={{
                position: 'absolute',
                top: this.dateWidth * (this.state.weekNum - 1),
                left: 0,
                backgroundColor: '#fff',
                opacity: this.state.collapsed ? 1 : 0,
              }}>
              {CAL_WEEKLY.map(week => this.renderWeek(week))}
            </ScrollView>
          </Animated.View>
          <Animated.View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: this.viewWidth,
              height: this._animationHeightValue,
              backgroundColor: 'blue',
            }}>
            <Text>hello</Text>
          </Animated.View>
        </View>
      </View>
    );
  }
}

const WeekDays = () => {
  return (
    <View
      style={{
        flexDirection: 'row',
        marginHorizontal: 20,
        justifyContent: 'space-between',
        borderTopWidth: 1,
        zIndex: 100,
        backgroundColor: '#fff',
      }}>
      {WEEKS.map(day => (
        <View
          key={day}
          style={{
            width: (windowSize.width - 40) / 7,
            alignItems: 'center',
          }}>
          <Text
            style={[
              day === '일' && {color: 'red'},
              day === '토' && {color: 'blue'},
            ]}>
            {day}
          </Text>
        </View>
      ))}
    </View>
  );
};
