// Jest Worker Mock - NextJS 13.4.19のWorkerエラー回避
module.exports = {
  Worker: class MockWorker {
    constructor(workerPath, options = {}) {
      console.log('Mock Worker created for:', workerPath);
      this.workerPath = workerPath;
      this.options = options;
    }
    
    async getStdout() { return ''; }
    async getStderr() { return ''; }
    end() { return Promise.resolve(); }
    terminate() { return Promise.resolve(); }
    
    // Mock method for any worker calls
    async [Symbol.for('nodejs.worker_threads.handle')]() {
      return Promise.resolve();
    }
  },
  
  MessagePort: class MockMessagePort {
    postMessage() {}
    on() {}
    off() {}
    addEventListener() {}
    removeEventListener() {}
    start() {}
    close() {}
  }
};