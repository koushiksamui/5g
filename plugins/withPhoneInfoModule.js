const { withAndroidManifest, withMainApplication } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo Config Plugin to add PhoneInfoModule to the app
 */
const withPhoneInfoModule = (config) => {
  // Add queries to AndroidManifest.xml
  config = withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest;

    // Ensure queries element exists
    if (!mainApplication.queries) {
      mainApplication.queries = [{}];
    }

    const queries = mainApplication.queries[0];

    // Initialize intent array if it doesn't exist
    if (!queries.intent) {
      queries.intent = [];
    }

    // Add required intents for Settings activities
    const requiredIntents = [
      { action: [{ $: { 'android:name': 'android.intent.action.DIAL' } }] },
      { action: [{ $: { 'android:name': 'android.settings.NETWORK_OPERATOR_SETTINGS' } }] },
      { action: [{ $: { 'android:name': 'android.settings.WIRELESS_SETTINGS' } }] },
      { action: [{ $: { 'android:name': 'android.settings.DEVICE_INFO_SETTINGS' } }] },
      { action: [{ $: { 'android:name': 'android.settings.DATA_ROAMING_SETTINGS' } }] },
      { action: [{ $: { 'android:name': 'android.settings.APPLICATION_DEVELOPMENT_SETTINGS' } }] },
      { action: [{ $: { 'android:name': 'android.settings.SETTINGS' } }] },
    ];

    requiredIntents.forEach((intent) => {
      const exists = queries.intent?.some(
        (existing) => existing.action?.[0]?.$?.['android:name'] === intent.action[0].$['android:name']
      );
      if (!exists) {
        queries.intent.push(intent);
      }
    });

    // Add package queries
    if (!queries.package) {
      queries.package = [];
    }

    const requiredPackages = [
      'com.android.settings',
      'com.android.phone'
    ];

    requiredPackages.forEach((pkg) => {
      const exists = queries.package?.some(
        (existing) => existing.$?.['android:name'] === pkg
      );
      if (!exists) {
        queries.package.push({ $: { 'android:name': pkg } });
      }
    });

    return config;
  });

  // Copy native module files
  config = withMainApplication(config, async (config) => {
    const projectRoot = config.modRequest.projectRoot;
    const androidSrcPath = path.join(projectRoot, 'android', 'app', 'src', 'main', 'java', 'com', 'fiveg', 'phoneinfo');
    
    // Ensure the directory exists
    if (!fs.existsSync(androidSrcPath)) {
      fs.mkdirSync(androidSrcPath, { recursive: true });
    }

    // Write PhoneInfoModule.java
    const phoneInfoModuleContent = `package com.fiveg.phoneinfo;

import android.content.ComponentName;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.provider.Settings;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class PhoneInfoModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    PhoneInfoModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "PhoneInfoModule";
    }

    @ReactMethod
    public void openTestingMenu(Promise promise) {
        try {
            boolean opened = false;

            // Try opening with secret dialer code first (works on most devices)
            try {
                Intent intent = new Intent(Intent.ACTION_DIAL);
                intent.setData(Uri.parse("tel:*#*#4636#*#*"));
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(intent);
                promise.resolve(true);
                return;
            } catch (Exception e) {
                // Continue to other methods
            }

            // Approach 1: Direct RadioInfo activity
            try {
                Intent intent = new Intent();
                intent.setClassName("com.android.settings", "com.android.settings.RadioInfo");
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(intent);
                promise.resolve(true);
                return;
            } catch (Exception e1) {
                // Try next approach
            }

            // Approach 2: Testing settings activity
            try {
                Intent intent = new Intent();
                intent.setClassName("com.android.settings", "com.android.settings.TestingSettings");
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(intent);
                promise.resolve(true);
                return;
            } catch (Exception e2) {
                // Try next approach
            }

            // Approach 3: Using component name
            try {
                Intent intent = new Intent();
                ComponentName component = new ComponentName("com.android.settings",
                        "com.android.settings.Settings$TestingSettingsActivity");
                intent.setComponent(component);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(intent);
                promise.resolve(true);
                return;
            } catch (Exception e3) {
                // Try next approach
            }

            // Approach 4: Try phone-specific testing activity
            try {
                Intent intent = new Intent();
                intent.setClassName("com.android.phone", "com.android.phone.settings.RadioInfo");
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(intent);
                promise.resolve(true);
                return;
            } catch (Exception e4) {
                // Try next approach
            }

            // Approach 5: For Vivo/iQOO devices - try developer options
            try {
                Intent intent = new Intent(Settings.ACTION_APPLICATION_DEVELOPMENT_SETTINGS);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(intent);
                promise.resolve(true);
                return;
            } catch (Exception e5) {
                // Continue
            }

            promise.reject("UNAVAILABLE", "Testing menu not available on this device");
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void openNetworkSettings(Promise promise) {
        try {
            // Try network operator settings first
            Intent intent = new Intent(Settings.ACTION_NETWORK_OPERATOR_SETTINGS);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(intent);
            promise.resolve(true);
        } catch (Exception e) {
            try {
                // Fallback to wireless settings
                Intent intent = new Intent(Settings.ACTION_WIRELESS_SETTINGS);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(intent);
                promise.resolve(true);
            } catch (Exception e2) {
                try {
                    // Fallback to general settings
                    Intent intent = new Intent(Settings.ACTION_SETTINGS);
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    reactContext.startActivity(intent);
                    promise.resolve(true);
                } catch (Exception e3) {
                    promise.reject("ERROR", e3.getMessage());
                }
            }
        }
    }

    @ReactMethod
    public void openDeviceInfo(Promise promise) {
        try {
            Intent intent = new Intent(Settings.ACTION_DEVICE_INFO_SETTINGS);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(intent);
            promise.resolve(true);
        } catch (Exception e) {
            try {
                // Fallback to About Phone for some devices
                Intent intent = new Intent(Settings.ACTION_SETTINGS);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(intent);
                promise.resolve(true);
            } catch (Exception e2) {
                promise.reject("ERROR", e2.getMessage());
            }
        }
    }

    @ReactMethod
    public void openMobileNetworkSettings(Promise promise) {
        try {
            // Try mobile network settings
            Intent intent = new Intent(Settings.ACTION_NETWORK_OPERATOR_SETTINGS);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            reactContext.startActivity(intent);
            promise.resolve(true);
        } catch (Exception e) {
            try {
                // Try data roaming settings
                Intent intent = new Intent(Settings.ACTION_DATA_ROAMING_SETTINGS);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(intent);
                promise.resolve(true);
            } catch (Exception e2) {
                try {
                    // Fallback to wireless settings
                    Intent intent = new Intent(Settings.ACTION_WIRELESS_SETTINGS);
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    reactContext.startActivity(intent);
                    promise.resolve(true);
                } catch (Exception e3) {
                    try {
                        // Last fallback to general settings
                        Intent intent = new Intent(Settings.ACTION_SETTINGS);
                        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        reactContext.startActivity(intent);
                        promise.resolve(true);
                    } catch (Exception e4) {
                        promise.reject("ERROR", e4.getMessage());
                    }
                }
            }
        }
    }
}
`;

    const moduleFilePath = path.join(androidSrcPath, 'PhoneInfoModule.java');
    fs.writeFileSync(moduleFilePath, phoneInfoModuleContent);

    // Write PhoneInfoPackage.java
    const phoneInfoPackageContent = `package com.fiveg.phoneinfo;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class PhoneInfoPackage implements ReactPackage {
    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new PhoneInfoModule(reactContext));
        return modules;
    }
}
`;

    const packageFilePath = path.join(androidSrcPath, 'PhoneInfoPackage.java');
    fs.writeFileSync(packageFilePath, phoneInfoPackageContent);

    return config;
  });

  return config;
};

module.exports = withPhoneInfoModule;
