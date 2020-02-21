import React from 'react';
import {TouchableOpacity, View, StyleSheet, Text} from 'react-native';

const Meeting = () => {
  return (
    <TouchableOpacity
      onPress={() => {}}
      style={[s.item, {flexDirection: 'row'}]}>
      <View>
        <Text style={s.title}>회의방 목록</Text>
        <Text>2020/02/04</Text>
      </View>
      <Text
        style={{
          position: 'absolute',
          bottom: 15,
          right: 15,
          color: 'grey',
        }}>
        2 / 3 명
      </Text>
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  item: {
    flex: 1,
    // borderRadius: 9,
    paddingVertical: 15,
    paddingLeft: 30,
    // marginTop: 20,
    // borderTopWidth: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
    backgroundColor: '#fff',
    // elevation: 1,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default Meeting;
