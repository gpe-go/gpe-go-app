/* eslint-env node */
// ============================================================
//  setup-android-signing.js
//
//  expo prebuild regenera la carpeta android/ desde cero, así que
//  CADA vez que se corre `expo prebuild` se pierde la configuración
//  de firmado de release. Este script la vuelve a aplicar en un
//  solo paso:
//
//    1. Copia credentials/release.keystore  → android/app/release.keystore
//    2. Copia credentials/keystore.properties → android/keystore.properties
//    3. Parchea android/app/build.gradle para que el buildType
//       `release` use ese keystore (en vez del debug keystore).
//
//  Las credenciales viven en credentials/ (gitignored) — el
//  keystore se descargó de EAS con `eas credentials` para que la
//  firma sea consistente con los builds de la nube y de la tienda.
//
//  Uso:
//    npx expo prebuild --platform android   (o --clean)
//    node scripts/setup-android-signing.js
//    cd android && ./gradlew assembleRelease
// ============================================================

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CRED_DIR = path.join(ROOT, 'credentials');
const ANDROID_DIR = path.join(ROOT, 'android');

function fail(msg) {
  console.error('✗ ' + msg);
  process.exit(1);
}

// ── 0. Validaciones ─────────────────────────────────────────
if (!fs.existsSync(ANDROID_DIR)) {
  fail('No existe android/. Corre primero: npx expo prebuild --platform android');
}
const credKeystore = path.join(CRED_DIR, 'release.keystore');
const credProps = path.join(CRED_DIR, 'keystore.properties');
if (!fs.existsSync(credKeystore) || !fs.existsSync(credProps)) {
  fail('Faltan credentials/release.keystore o credentials/keystore.properties');
}

// ── 1. Copiar keystore y properties a android/ ──────────────
fs.copyFileSync(credKeystore, path.join(ANDROID_DIR, 'app', 'release.keystore'));
fs.copyFileSync(credProps, path.join(ANDROID_DIR, 'keystore.properties'));
console.log('✓ keystore y keystore.properties copiados a android/');

// ── 2. Parchear android/app/build.gradle ────────────────────
const gradlePath = path.join(ANDROID_DIR, 'app', 'build.gradle');
let gradle = fs.readFileSync(gradlePath, 'utf8');

if (gradle.includes('keystore.properties')) {
  console.log('✓ build.gradle ya tenía la config de signing — nada que hacer');
  process.exit(0);
}

// 2a. Reemplaza el bloque signingConfigs { debug { ... } } por uno
//     que además define `release` leyendo de keystore.properties.
const signingConfigsOld = `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }`;

const signingConfigsNew = `    // Credenciales del keystore de release — ver scripts/setup-android-signing.js
    def releaseKeystorePropsFile = rootProject.file('keystore.properties')
    def releaseKeystoreProps = new Properties()
    if (releaseKeystorePropsFile.exists()) {
        releaseKeystoreProps.load(new FileInputStream(releaseKeystorePropsFile))
    }

    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (releaseKeystorePropsFile.exists()) {
                storeFile     file(releaseKeystoreProps['storeFile'] ?: 'release.keystore')
                storePassword releaseKeystoreProps['storePassword']
                keyAlias      releaseKeystoreProps['keyAlias']
                keyPassword   releaseKeystoreProps['keyPassword']
            }
        }
    }`;

if (!gradle.includes(signingConfigsOld)) {
  fail('No se encontró el bloque signingConfigs default — ¿cambió la plantilla de Expo? Revisa android/app/build.gradle a mano.');
}
gradle = gradle.replace(signingConfigsOld, signingConfigsNew);

// 2b. Cambia el signingConfig del buildType release.
const releaseSignOld = `        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug`;
const releaseSignNew = `        release {
            // Firma con el keystore de release si existe; si no, cae al
            // debug keystore para no romper builds locales de prueba.
            signingConfig releaseKeystorePropsFile.exists() ? signingConfigs.release : signingConfigs.debug`;

if (!gradle.includes(releaseSignOld)) {
  fail('No se encontró el buildType release default — revisa android/app/build.gradle a mano.');
}
gradle = gradle.replace(releaseSignOld, releaseSignNew);

fs.writeFileSync(gradlePath, gradle);
console.log('✓ android/app/build.gradle parcheado para firmar release con el keystore oficial');
console.log('');
console.log('Listo. Ahora puedes compilar:');
console.log('  cd android && ./gradlew assembleRelease   (APK)');
console.log('  cd android && ./gradlew bundleRelease     (AAB para Play Store)');
