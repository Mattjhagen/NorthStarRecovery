const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withPodDeploymentTarget = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfile = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      if (!fs.existsSync(podfile)) {
        return config;
      }
      
      let contents = fs.readFileSync(podfile, 'utf-8');

      // CocoaPods requires post_install logic to modify target build settings.
      // We inject it inside the existing post_install hook if Expo creates one.
      const hookInjection = `
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'
      if target.name == 'fmt'
        config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FMT_CONSTEVAL=constexpr'
      end
    end
  end
`;

      if (contents.includes('post_install do |installer|')) {
        contents = contents.replace(
          'post_install do |installer|',
          'post_install do |installer|' + hookInjection
        );
      } else {
        contents += `\npost_install do |installer|${hookInjection}end\n`;
      }

      fs.writeFileSync(podfile, contents);
      return config;
    },
  ]);
};

module.exports = withPodDeploymentTarget;
