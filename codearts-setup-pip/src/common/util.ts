
import { MapValueType } from "../common/types";

// 中杠 转化为驼峰命名法  
// hello-world-transter   =>   helloWorldTranster
export function toCameCase(str: string) {
    return  str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

// 辅助函数：创建只读映射
function createReadonlyMap<K extends string, V>(entries: Array<readonly [K, V]>): ReadonlyMap<K, V> {
    return new Map(entries);
}

export function initMap(entries: Array<readonly [string, MapValueType]> ) {
    return createReadonlyMap<string, MapValueType>(entries);
}

export function foreachMap(CONFIG_MAP: ReadonlyMap<string, MapValueType>) {
    // 遍历 CONFIG_MAP 并打印键值对
    // 兼容低版本 TypeScript 的遍历方式
    const entries = CONFIG_MAP.entries();
    let entry: IteratorResult<[string, MapValueType]>;
    while (!(entry = entries.next()).done) {
        const [key, value] = entry.value;
            console.log(`${key}: ${value}`);
        }
}


export function valueFromMap(CONFIG_MAP: ReadonlyMap<string, MapValueType>, key: string) {
    return CONFIG_MAP.get(key) || '';
}


/**
 * 数组转map/**
 * 数组转map    [[]] : 二维数组， 里面的每个数组是一个map对象， 第一个元素是key， 后面的元素是value
 * @param data 数组
 * @returns map
 */
export function arrayToMap(data: Array<string[]>): Map<string, string[]> {
    const result = new Map<string, string[]>();
    
    data.forEach(item => {
      const [key, ...values] = item;
      result.set(key, values);
    });
    
    return result;
  }


  export function vauleFromKeyMap(map: Map<string, string[]>, key: string, index: number): string  {
    return map.get(key)?.[index] || '';
  }

  // version:   v18.20.1-alpha.2  
  export function validateVersion(version: string): boolean {
    // 正则：v.数字.数字.任意非空字符串
    const regex = /^v\d+\.\d+\.[^\s]+$/;
    return regex.test(version);
  }


    // version:   18.20.1-alpha.2  
  export function validateVersionWithoutV(version: string): boolean {
    // 正则：v.数字.数字.任意非空字符串
    const regex = /^\d+\.\d+\.[^\s]+$/;
    return regex.test(version);
  }

  //  " Abc  Def  Hij "  =>  ["abc", "def", "hij"]
export function splitAndLower(version: string): Array<string> {
    // 使用正则表达式 /\s+/ 匹配一个或多个空格
      return version
      .split(/\s+/)           // 按多个空格分割
      .filter(Boolean)        // 过滤空字符串
      .map((s) => s.trim().toLowerCase());  // 修剪并转换为小写
}