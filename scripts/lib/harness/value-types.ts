/** ValueType → 언어별 타입 이름 (Java · Kotlin · C++ 하네스가 리터럴과 함수 호출을 만들 때 쓴다) */
import type { ValueType } from '../../../src/content/types';

export const JAVA_TYPE: Record<ValueType, string> = {
  int: 'int',
  long: 'long',
  double: 'double',
  bool: 'boolean',
  string: 'String',
  'int[]': 'int[]',
  'long[]': 'long[]',
  'double[]': 'double[]',
  'bool[]': 'boolean[]',
  'string[]': 'String[]',
  'int[][]': 'int[][]',
  'string[][]': 'String[][]',
};

/** 프로그래머스 Kotlin 과 같은 매핑 (기본형 배열은 IntArray 등, 2차원은 Array<IntArray>) */
export const KOTLIN_TYPE: Record<ValueType, string> = {
  int: 'Int',
  long: 'Long',
  double: 'Double',
  bool: 'Boolean',
  string: 'String',
  'int[]': 'IntArray',
  'long[]': 'LongArray',
  'double[]': 'DoubleArray',
  'bool[]': 'BooleanArray',
  'string[]': 'Array<String>',
  'int[][]': 'Array<IntArray>',
  'string[][]': 'Array<Array<String>>',
};

export const CPP_TYPE: Record<ValueType, string> = {
  int: 'int',
  long: 'long long',
  double: 'double',
  bool: 'bool',
  string: 'string',
  'int[]': 'vector<int>',
  'long[]': 'vector<long long>',
  'double[]': 'vector<double>',
  'bool[]': 'vector<bool>',
  'string[]': 'vector<string>',
  'int[][]': 'vector<vector<int>>',
  'string[][]': 'vector<vector<string>>',
};
