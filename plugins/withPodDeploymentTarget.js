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
    end
  end

  # Fix fmt consteval issue on Xcode 16
  fmt_core_path = File.join(installer.sandbox.root, 'fmt', 'include', 'fmt', 'core.h')
  if File.exist?(fmt_core_path)
    content = File.read(fmt_core_path)
    content = content.gsub(/define\s+FMT_CONSTEVAL\s+consteval/, 'define FMT_CONSTEVAL constexpr')
    File.write(fmt_core_path, content)
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
