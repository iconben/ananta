import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
export function Ring({ progress, color = '#f0c040', size = 54 }) {
    const r = (size - 8) / 2;
    const c = 2 * Math.PI * r;
    const offset = c * (1 - Math.min(progress, 1));
    return (<View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={5}/>
        <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5} strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"/>
      </Svg>
    </View>);
}
