import React from 'react';
import Main from './src/mainScreen';

class App extends React.PureComponent {
  render() {
    return <Main />;
  }
}

export default App;
// import Calendar from './CalendarFinal';

// import {
//   Header,
//   LearnMoreLinks,
//   Colors,
//   DebugInstructions,
//   ReloadInstructions,
// } from 'react-native/Libraries/NewAppScreen';

// const WINDOW_H = Dimensions.get('window').height;
// const WINDOW_W = Dimensions.get('window').width;

// class App extends React.Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       checkedDate: 26,
//     };

//     this.currentHeight = {
//       top: 240,
//       bottom: WINDOW_H - 240,
//     };
//     this.move = 0;

//     // this._animtaionTranslateValue = new Animated.ValueXY({x: 0, y: -55.7});
//     this._animationMoveValue = new Animated.Value(this.move);

//     this._animationTopValue = new Animated.Value(this.currentHeight.top);
//     this._animationBottomValue = new Animated.Value(this.currentHeight.bottom);

//     this._panResponder = PanResponder.create({
//       onMoveShouldSetResponderCapture: () => true, //Tell iOS that we are allowing the movement
//       onMoveShouldSetPanResponderCapture: () => true, // Same here, tell iOS that we allow dragging

//       onPanResponderGrant: (evt, gestureState) => {
//         // this._animtaionTranslateValue.setOffset({
//         //   x: this._animtaionTranslateValue.x._value,
//         //   y: this._animtaionTranslateValue.y._value,
//         // });
//         // this._animtaionTranslateValue.setValue({x: 0, y: -55.7});
//       },

//       onPanResponderMove: (evt, gestureState) => {
//         if (
//           (gestureState.vy > 0 && this._animationTopValue._value <= 240) ||
//           (gestureState.vy < 0 && this._animationTopValue._value >= 60)
//         ) {
//           this._animationTopValue.setValue(
//             this.currentHeight.top + gestureState.dy,
//           );
//           this._animationBottomValue.setValue(
//             this.currentHeight.bottom - gestureState.dy,
//           );

//           this._animationMoveValue.setValue(this.move + gestureState.dy / 5);

//           // return Animated.event([
//           //   null,
//           //   {
//           //     dx: this._animtaionTranslateValue.x,
//           //     dy: this._animtaionTranslateValue.y,
//           //   },
//           // ])(evt, gestureState);
//         }
//       },

//       onPanResponderRelease: (evt, gestureState) => {
//         if (gestureState.vy > 0) {
//           this.state.expandAnimation.start(evnet => {
//             this.currentHeight.top = this._animationTopValue._value;
//             this.currentHeight.bottom = this._animationBottomValue._value;
//             this.move = this._animationMoveValue._value;
//           });
//         } else if (gestureState.vy < 0) {
//           this.state.collapseAnimation.start(evnet => {
//             this.currentHeight.top = this._animationTopValue._value;
//             this.currentHeight.bottom = this._animationBottomValue._value;
//             this.move = this._animationMoveValue._value;
//           });
//         }

//         // this._animtaionTranslateValue.flattenOffset();
//       },
//     });
//   }

//   componentDidMount() {
//     this.handleAnimationInit();
//   }

//   handleAnimationInit = () => {
//     const collapseAnimation = Animated.parallel([
//       Animated.timing(this._animationTopValue, {
//         toValue: 50,
//         duration: 500,
//       }),
//       Animated.timing(this._animationBottomValue, {
//         toValue: WINDOW_H - 50,
//         duration: 500,
//       }),
//       Animated.timing(this._animationMoveValue, {
//         toValue: -45.7,
//         duration: 500,
//       }),
//     ]);

//     const expandAnimation = Animated.parallel([
//       Animated.timing(this._animationTopValue, {
//         toValue: 240,
//         duration: 500,
//       }),
//       Animated.timing(this._animationBottomValue, {
//         toValue: WINDOW_H - 240,
//         duration: 500,
//       }),
//       Animated.timing(this._animationMoveValue, {
//         toValue: 0,
//         duration: 500,
//       }),
//     ]);

//     this.setState({
//       collapseAnimation,
//       expandAnimation,
//     });
//   };

//   render() {
//     return (
//       <SafeAreaView style={{flex: 1}} {...this._panResponder.panHandlers}>
//           <Calendar>
//             <Text>BOTTOM</Text>
//           </Calendar>

//       </SafeAreaView>
//     );
//   }
// }

// const styles = StyleSheet.create({});

// export default App;
