import { createApp } from './app.js';
import { ENV } from './config.js';

async function main() {
  const app = await createApp();
  app.listen(ENV.PORT, '0.0.0.0', () => {
    console.log(`✅ Cars By Rajat (TypeScript + React 19 Engine) running at http://localhost:${ENV.PORT}`);
    console.log(`📱 Local Network Access: ${ENV.BASE_URL}`);
    console.log(`🔐 Admin Command Deck: ${ENV.BASE_URL}/admin/login (Default: ${ENV.ADMIN_USER} / ${ENV.ADMIN_PASS})`);
  });
}

main().catch((err) => {
  console.error('Fatal Server Boot Error:', err);
  process.exit(1);
});

