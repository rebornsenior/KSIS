// Local filesystem proxy only. Never expose this unauthenticated tool publicly.
process.env.BIND_HOST = '127.0.0.1';
process.env.PORT = '8081';
await import('decap-server');
