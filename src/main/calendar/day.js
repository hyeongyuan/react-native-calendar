import React from 'react';

import {TouchableOpacity, View, Text} from 'react-native';

const Day = ({day, state, selected, layout, onPress}) => {
  const date = day.getDate();

  const containerStyle = [
    {
      width: layout.width - 20,
      height: layout.height - 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: (layout.width - 20) / 2,
      backgroundColor: '#fff',
    },
  ];
  const textStyle = [];

  if (selected) {
    containerStyle.push({
      backgroundColor: 'green',
    });
    textStyle.push({color: 'white'});
  } else if (state === 'disabled') {
    textStyle.push({color: '#f0f0f0'});
  } else if (state === 'today') {
    textStyle.push({color: 'green'});
  }

  return (
    <TouchableOpacity
      style={{
        width: layout.width,
        height: layout.height,
        alignItems: 'center',
        paddingTop: 5,
        paddingBottom: 15,
        backgroundColor: '#fff',
      }}
      onPress={() => {
        onPress(day);
      }}>
      <View style={containerStyle}>
        <Text style={textStyle}>{date}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default Day;
