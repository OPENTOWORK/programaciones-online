const {
  XML,
  withFinalizedMod,
  withGradleProperties,
} = require('@expo/config-plugins');
const { join } = require('path');

const DEPRECATED_BAR_COLORS = ['android:statusBarColor', 'android:navigationBarColor'];

const GRADLE_RELEASE_FLAGS = {
  'android.enableMinifyInReleaseBuilds': 'true',
  'android.enableShrinkResourcesInReleaseBuilds': 'true',
  'android.r8.optimizedResourceShrinking': 'true',
  'android.enableR8.fullMode': 'true',
};

function upsertGradleProperty(properties, key, value) {
  const existing = properties.find((item) => item.type === 'property' && item.key === key);
  if (existing) {
    existing.value = value;
    return;
  }
  properties.push({ type: 'property', key, value });
}

/**
 * Play Console flags portrait locks and deprecated system-bar color APIs
 * on Android 15/16. Expo re-applies both during prebuild, so this plugin
 * patches the generated project after every other Android mod.
 */
function withAndroidPlayCompatibility(config) {
  config = withGradleProperties(config, (mod) => {
    for (const [key, value] of Object.entries(GRADLE_RELEASE_FLAGS)) {
      upsertGradleProperty(mod.modResults, key, value);
    }
    return mod;
  });

  return withFinalizedMod(config, [
    'android',
    async (mod) => {
      const { platformProjectRoot } = mod.modRequest;
      const manifestPath = join(platformProjectRoot, 'app/src/main/AndroidManifest.xml');
      const stylesPath = join(platformProjectRoot, 'app/src/main/res/values/styles.xml');

      const manifest = await XML.readXMLAsync({ path: manifestPath });
      const application = manifest.manifest?.application?.[0];
      for (const activity of application?.activity ?? []) {
        const name = activity.$?.['android:name'] ?? '';
        if (name === '.MainActivity' || name.endsWith('.MainActivity')) {
          delete activity.$['android:screenOrientation'];
        }
      }
      await XML.writeXMLAsync({ path: manifestPath, xml: manifest });

      const styles = await XML.readXMLAsync({ path: stylesPath });
      for (const style of styles.resources?.style ?? []) {
        if (!Array.isArray(style.item)) continue;
        style.item = style.item.filter((item) => !DEPRECATED_BAR_COLORS.includes(item.$?.name));
      }
      await XML.writeXMLAsync({ path: stylesPath, xml: styles });

      return mod;
    },
  ]);
}

module.exports = withAndroidPlayCompatibility;
