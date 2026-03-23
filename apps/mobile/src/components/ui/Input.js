import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../theme';
export function Input(props) {
    return (<TextInput style={styles.input} placeholderTextColor="rgba(255,255,255,0.3)" {...props}/>);
}
const styles = StyleSheet.create({
    input: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,.06)',
        border: '1px solid rgba(255,255,255,.12)',
        borderRadius: 10,
        padding: '11px 13px',
        color: COLORS.text,
        fontSize: 15,
        outlineStyle: 'none',
    },
});
