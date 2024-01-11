import { EventMgr } from "./EventMgr";
import { useEffect, useState } from "react";

export const useStore = <T>(
  key: string,
  defaultValue?: any
): [T, (data: T) => void] => {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const cacheData = UserDataCenter.getInstance().getDataByPacktId(key);
  const value = cacheData || defaultValue;

  if (!cacheData && defaultValue) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    UserDataCenter.getInstance().setData(key, defaultValue, null);
  }

  const [data, setDataIn] = useState<T>(value);

  useEffect(() => {
    const target = Symbol();
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const data = UserDataCenter.getInstance().getDataByPacktId(key);
    if (data) {
      setDataIn(data);
    }
    EventMgr.getInstance().addEventListener(
      key,
      (inData: T) => {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        UserDataCenter.getInstance().setData(key, inData, target);
        setDataIn(inData);
      },
      target
    );
    return () => {
      EventMgr.getInstance().removeByTarget(target);
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      UserDataCenter.getInstance().clearByPacktId(key, target);
    };
  }, []);

  const setData = (data: T) => {
    EventMgr.getInstance().dispatchEvent(key, data);
  };

  return [data, setData];
};

export class UserDataCenter {
  private cache: Map<string, Map<any, any>> = new Map<string, Map<any, any>>();
  private cacheData: Map<string, any> = new Map<string, any>();
  private static instance: UserDataCenter;

  static getInstance(): UserDataCenter {
    if (!this.instance) {
      this.instance = new UserDataCenter();
    }
    return this.instance;
  }

  getDataByPacktId(packtId: string) {
    if (this.cacheData.has(packtId)) {
      return this.cacheData.get(packtId);
    }
  }

  setData(packtId: string, data: any, target: any) {
    if (this.cache.has(packtId)) {
      let maps = this.cache.get(packtId);
      if (!maps) {
        maps = new Map<any, any>();
        this.cache.set(packtId, maps);
      }
      maps.set(target, data);
    } else {
      const maps = new Map<any, any>();
      maps.set(target, data);
      this.cache.set(packtId, maps);
    }
    this.cacheData.set(packtId, data);
  }

  clearByPacktId(packetId: string, target: any) {
    if (this.cache.has(packetId)) {
      const maps = this.cache.get(packetId);
      if (maps?.has(target)) {
        maps.delete(target);
      }
      if (maps?.size === 0) {
        this.cache.delete(packetId);
      }
    }
  }
}
