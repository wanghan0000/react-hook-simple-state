import { EventMgr } from "./EventMgr";
import { useEffect, useRef, useState } from "react";

export const useStore = <T>(
  key: string,
  defaultValue?: any
): [T, (data: T) => void] => {
  const target = useRef(Symbol());
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const cacheData = UserDataCenter.getInstance().getDataByPacktId(
    key,
    target.current
  );
  const value = cacheData || defaultValue;

  if (!cacheData && defaultValue) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    UserDataCenter.getInstance().setData(key, defaultValue, target.current);
  }

  const [data, setDataIn] = useState<T>(value);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const data = UserDataCenter.getInstance().getDataByPacktId(
      key,
      target.current
    );
    if (data) {
      setDataIn(data);
    }
    EventMgr.getInstance().addEventListener(
      key,
      (inData: T) => {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        UserDataCenter.getInstance().setData(key, inData, target.current);
        setDataIn(inData);
      },
      target.current
    );
    return () => {
      EventMgr.getInstance().removeByTarget(target.current);
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      UserDataCenter.getInstance().clearByPacktId(key, target.current);
    };
  }, []);

  const setData = (data: T) => {
    EventMgr.getInstance().dispatchEvent(key, data);
  };

  return [data, setData];
};

export class UserDataCenter {
  private cache: Map<string, Map<any, any>> = new Map<string, Map<any, any>>();

  private static instance: UserDataCenter;

  static getInstance(): UserDataCenter {
    if (!this.instance) {
      this.instance = new UserDataCenter();
    }
    return this.instance;
  }

  getDataByPacktId(packtId: string, target: any) {
    if (this.cache.has(packtId)) {
      const maps: any = this.cache.get(packtId);
      if (maps?.has(target)) {
        return maps.get(target);
      } else {
        if (maps?.size > 0) {
          const values = maps.values();
          return values.next().value;
        }
      }
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
  }

  clearByPacktId(packetId: string, target: any) {
    if (this.cache.has(packetId)) {
      const maps = this.cache.get(packetId);
      if (maps?.has(target) && maps?.size !== 1) {
        maps.delete(target);
      }
    }
  }
}
