if (typeof global.NativeModules === 'undefined') {
  global.NativeModules = {};
}

if (!global.NativeModules.UIManager) {
  global.NativeModules.UIManager = {
    getViewManagerConfig: jest.fn(),
    hasConstants: jest.fn(),
  };
}

if (!global.NativeModules.NativeUnimoduleProxy) {
  global.NativeModules.NativeUnimoduleProxy = {
    viewManagersMetadata: {},
  };
}

const originalDefineProperty = Object.defineProperty;
Object.defineProperty = function (obj, prop, descriptor) {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (prop && typeof prop === 'string' && prop.startsWith('ViewManagerAdapter_') && !obj.UIManager) {
    obj.UIManager = {};
  }
  return originalDefineProperty.call(this, obj, prop, descriptor);
};

if (typeof global.setImmediate === 'undefined') {
  global.setImmediate = (fn) => setTimeout(fn, 0);
  global.clearImmediate = clearTimeout;
}

