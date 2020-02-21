import React from 'react';
import {View, Text, Dimensions} from 'react-native';

const WEEKS = ['일', '월', '화', '수', '목', '금', '토'];
const windowSize = Dimensions.get('window');

const WeekDays = ({current}) => {
  return (
    <View
      style={{
        paddingHorizontal: 20,
        zIndex: 100,
        backgroundColor: '#fff',
      }}>
      <View style={{zIndex: 100}}>
        <Text style={{fontSize: 30}}>회의 일정</Text>
        <Text>{current.toString('yyyy년 MM월')}</Text>
      </View>
      <View
        style={{
          flexDirection: 'row',

          justifyContent: 'space-between',
          borderTopWidth: 0.5,
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
                {fontSize: 11},
                day === '일' && {color: 'red'},
                day === '토' && {color: 'blue'},
              ]}>
              {day}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default WeekDays;
