// Empty stub for firebase/storage - prevents import errors, not used in tests
module.exports = {
  getStorage: () => null,
  ref: () => {},
  getDownloadURL: () => Promise.resolve(''),
  FirebaseStorage: {},
};

