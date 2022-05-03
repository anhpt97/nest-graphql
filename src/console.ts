import { BootstrapConsole } from 'nestjs-console';
import { ConsoleModule } from './modules/console/console.module';

const bootstrap = new BootstrapConsole({
  module: ConsoleModule,
  useDecorators: true,
});
void bootstrap.init().then(async (app) => {
  await bootstrap.boot();
  void app.close();
});
