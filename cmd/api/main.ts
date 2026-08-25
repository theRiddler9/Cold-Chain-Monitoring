import app from '../../internal/api/app.js';
import { env } from '../../internal/config/env.js';

app.listen(env.PORT, () => console.log(`Cold-chain API listening on :${env.PORT}`));
