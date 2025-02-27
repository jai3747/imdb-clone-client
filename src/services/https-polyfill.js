// Polyfill for 'https' module in browser environment
const https = {
  Agent: function(options) {
    // This is a dummy Agent that does nothing in the browser
    return {};
  }
};

export default https;
