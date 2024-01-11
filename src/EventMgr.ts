export type MyEventHandler = (...params: any) => void;

class MyEventListeners {
  public handlers: any[];
  public targets: any[];
  public isInvoking: boolean;
  private containCanceled: boolean;

  constructor() {
    this.handlers = [];
    this.targets = [];
    this.isInvoking = false;
    this.containCanceled = false;
  }

  add(handler: MyEventHandler, target: any) {
    this.handlers.push(handler);
    this.targets.push(target);
  }

  remove(index: number) {
    this.handlers.splice(index, 1);
    this.targets.splice(index, 1);
  }

  removeByTarget(target: any) {
    const targets = this.targets;
    const handlers = this.handlers;
    for (let i = targets.length - 1; i >= 0; i--) {
      if (targets[i] == target) {
        targets.splice(i, 1);
        handlers.splice(i, 1);
      }
    }
  }

  removeByHandler(handler: MyEventHandler | null) {
    const handlers = this.handlers;
    const targets = this.targets;
    for (let i = handlers.length - 1; i >= 0; i--) {
      if (handlers[i] == handler) {
        handlers.splice(i, 1);
        targets.splice(i, 1);
      }
    }
  }

  removeByHandlerTarget(handler: MyEventHandler, target: any) {
    const handlers = this.handlers;
    const targets = this.targets;
    for (let i = handlers.length - 1; i >= 0; i--) {
      if (handlers[i] == handler && targets[i] == target) {
        handlers.splice(i, 1);
        targets.splice(i, 1);
      }
    }
  }

  removeAll() {
    this.handlers.length = 0;
    this.targets.length = 0;
  }

  cancel(index: number) {
    this.handlers[index] = null;
    this.targets[index] = null;
    this.containCanceled = true;
  }

  cancelByTarget(target: any) {
    const targets = this.targets;
    const handlers = this.handlers;
    for (let i = targets.length - 1; i >= 0; i--) {
      if (targets[i] == target) {
        targets[i] = null;
        handlers[i] = null;
      }
    }
    this.containCanceled = true;
  }

  cancelByHandler(handler: MyEventHandler) {
    const handlers = this.handlers;
    const targets = this.targets;
    for (let i = handlers.length - 1; i >= 0; i--) {
      if (handlers[i] == handler) {
        handlers[i] = null;
        targets[i] = null;
      }
    }
    this.containCanceled = true;
  }

  cancelByHandlerTarget(handler: MyEventHandler, target: any) {
    const handlers = this.handlers;
    const targets = this.targets;
    for (let i = handlers.length - 1; i >= 0; i--) {
      if (handlers[i] == handler && targets[i] == target) {
        handlers[i] = null;
        targets[i] = null;
      }
    }
    this.containCanceled = true;
  }

  cancelAll() {
    const handlers = this.handlers;
    const targets = this.targets;
    for (let i = handlers.length - 1; i >= 0; i--) {
      handlers[i] = null;
      targets[i] = null;
    }
    this.containCanceled = true;
  }

  has(handler: MyEventHandler, target: any) {
    const handlers = this.handlers;
    const targets = this.targets;
    for (let i = handlers.length - 1; i >= 0; i--) {
      if (handlers[i] == handler && targets[i] == target) {
        return true;
      }
    }
    return false;
  }

  purgeCanceled() {
    if (this.containCanceled) {
      this.removeByHandler(null);
      this.containCanceled = false;
    }
  }

  isEmpty() {
    return this.handlers.length == 0;
  }
}

export class EventMgr {
  private static instance: EventMgr;
  private eventMap: Map<string, MyEventListeners>;

  private constructor() {
    this.eventMap = new Map();
  }

  static getInstance(): EventMgr {
    if (!this.instance) {
      this.instance = new EventMgr();
    }
    return this.instance;
  }

  dispatchEvent(event: string, ...params: any) {
    // EventHelper.log(`EventMgr`, `fire event ${event}`);
    const listeners = this.eventMap.get(event);
    if (!listeners || listeners.isEmpty()) {
      return;
    }

    // 事件处理函数中可能会删除事件，导致循环出错
    listeners.isInvoking = true;
    const handlers = listeners.handlers;
    const targets = listeners.targets;

    for (let i = 0, len = handlers.length; i < len; i++) {
      const handler = handlers[i];
      const target = targets[i];
      if (!handler) {
        continue;
      }
      handler.call(target, ...params);
    }
    // 循环结束后再删除
    listeners.isInvoking = false;
    listeners.purgeCanceled();
  }

  has(event: string, handler: MyEventHandler, target: any = null) {
    const listeners = this.eventMap.get(event);
    if (!listeners) {
      return false;
    }
    if (handler) {
      return listeners.has(handler, target);
    }
    // 检查event是否有监听者
    if (listeners.isInvoking) {
      const handlers = listeners.handlers;
      for (let i = 0, len = handlers.length; i < len; i++) {
        if (handlers[i]) {
          return true;
        }
      }
      return false;
    } else {
      return !listeners.isEmpty();
    }
  }

  addEventListener(event: string, handler: MyEventHandler, target: any) {
    // EventHelper.log(`EventMgr`, `add, event = ${event}`);
    let listeners = this.eventMap.get(event);
    if (!listeners) {
      listeners = new MyEventListeners();
      this.eventMap.set(event, listeners);
    }
    listeners.add(handler, target);
  }

  // 注册事件被回掉一次后就移除
  once(event: string, handler: MyEventHandler, target: any) {
    // EventHelper.log(`EventMgr`, `once, event = ${event}`);
    const wrapperCb = (...params: any[]) => {
      this.remove(event, wrapperCb, target);
      handler.call(target, ...params);
    };
    this.addEventListener(event, wrapperCb, target);
  }

  remove(event: string, handler: MyEventHandler, target: any) {
    const listeners = this.eventMap.get(event);
    if (!listeners) {
      return;
    }

    if (listeners.isEmpty()) {
      this.eventMap.delete(event);
      return;
    }

    if (target) {
      if (listeners.isInvoking) {
        listeners.cancelByHandlerTarget(handler, target);
      } else {
        listeners.removeByHandlerTarget(handler, target);
      }
    } else {
      if (listeners.isInvoking) {
        listeners.cancelByHandler(handler);
      } else {
        listeners.removeByHandler(handler);
      }
    }
  }

  removeByTarget(target: any) {
    this.eventMap.forEach((listeners, event) => {
      if (listeners.isEmpty()) {
        this.eventMap.delete(event);
        return;
      }
      if (listeners.isInvoking) {
        listeners.cancelByTarget(target);
      } else {
        listeners.removeByTarget(target);
      }

      if (listeners.isEmpty()) {
        this.eventMap.delete(event);
      }
    });
  }

  removeByEvent(event: string) {
    const listeners = this.eventMap.get(event);
    if (!listeners) {
      return;
    }
    if (listeners.isEmpty()) {
      this.eventMap.delete(event);
      return;
    }
    if (listeners.isInvoking) {
      listeners.cancelAll();
    } else {
      listeners.removeAll();
    }
  }
}
