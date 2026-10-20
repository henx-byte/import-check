# importCheck 🔍

> Dead file scanner for Expo / React Native - **Pure JS, works on Termux + Node 26** (no native binding like `knip` / `tsr`)

Capek pake `depcheck` / `check-imports` / `knip` yang false positive atau error di Termux Android? Ini solusinya.

### Kenapa bikin ini?

- `depcheck` & `finom/check-imports` -> ngecek `package.json`, bukan file dead. Bahaya kalo dipake di Expo, bisa ngapus `expo-constants`, `react-native-reanimated` dll
- `knip@6` & `tsr` -> pake Rust native binding (`oxc-resolver`), error `__emutls_get_address` di Termux + Node 26
- `importCheck` -> Pure JS, 0 dependency, work 100% di Termux

### Install Global 

```bash
npm install -g github:henx-byte/import-check

# cek
importCheck --help
which importCheck
```

### Pakai

```bash
# scan project
importCheck .

# scan folder tertentu
importCheck ./src

# alias lain juga bisa
import-check .
import-check ./src

# tanpa install global, pake npx
npx github:henx-byte/import-check .
```

### Pakai sebagai modul

```js
const { check } = require('import-check');

const { unused } = check('.');
console.log(unused);
```

### Uninstall

```bash
npm uninstall -g import-check
```

### License

MIT - bebas pake!
