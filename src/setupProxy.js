const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/gigachat',
    createProxyMiddleware({
      target: 'https://ngw.devices.sberbank.ru:9443',
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        '^/gigachat': '',
      },
    })
  );

  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://gigachat.devices.sberbank.ru',
      changeOrigin: true,
      secure: false,
    })
  );
};