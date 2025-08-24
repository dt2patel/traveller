## Runtime config (v2)
- **Secrets**: set via `firebase functions:secrets:set NAME`
- **Params** (non-secrets): set via `firebase functions:config:set NAME="value"`

Access in code:
```ts
import { defineSecret, defineString } from 'firebase-functions/params';
const NAME = defineSecret('NAME');
const OTHER = defineString('OTHER');
// later
NAME.value();  // secret
OTHER.value(); // string
```

**Do not** use `.env` files under `functions/`. They are blocked in `.gitignore` and not required.
