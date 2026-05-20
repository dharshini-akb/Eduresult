const client = require('prom-client');

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'eduresult-backend'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Create custom metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

// Register the custom metric
register.registerMetric(httpRequestDurationMicroseconds);

const metricsMiddleware = (req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    // Only track /api routes to avoid noise
    if (req.path.startsWith('/api')) {
      end({ 
        method: req.method, 
        route: req.baseUrl + req.path, 
        code: res.statusCode 
      });
    }
  });
  next();
};

module.exports = {
  register,
  metricsMiddleware
};
