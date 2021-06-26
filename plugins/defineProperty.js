/* eslint-disable no-extend-native */

/**
 * Math.floorTo 無條件捨去到第n位
 */
Math.floorTo = (number, digit) => Math.floor(number * 10 ** digit) / 10 ** digit;
