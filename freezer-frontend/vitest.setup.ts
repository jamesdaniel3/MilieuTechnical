import "@testing-library/jest-dom";

// Provide IndexedDB in test environment via fake-indexeddb
import "fake-indexeddb/auto";

// JSDOM lacks some browser APIs sometimes used by React/RTL; add minimal shims if needed
// (none required at the moment)
