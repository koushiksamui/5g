const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
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

    // Use withDangerousMod to write native module files during prebuild
    config = withDangerousMod(config, [
        'android',
        async (config) => {
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
import android.telephony.TelephonyManager;
import android.os.Build;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

public class PhoneInfoModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    // Network type constants
    private static final int NETWORK_MODE_NR_ONLY = 27;  // 5G NR only
    private static final int NETWORK_MODE_NR_LTE = 26;   // 5G/4G
    private static final int NETWORK_MODE_LTE_ONLY = 11; // 4G only
    private static final int NETWORK_MODE_WCDMA_PREF = 0; // 3G preferred
    private static final int NETWORK_MODE_GSM_ONLY = 1;   // 2G only

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
            PackageManager pm = reactContext.getPackageManager();
            
            // Approach 1: Direct RadioInfo activity
            try {
                Intent intent = new Intent();
                intent.setClassName("com.android.settings", "com.android.settings.RadioInfo");
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                if (intent.resolveActivity(pm) != null) {
                    reactContext.startActivity(intent);
                    promise.resolve(true);
                    return;
                }
            } catch (Exception e1) {
                // Try next approach
            }

            // Approach 2: Testing settings activity
            try {
                Intent intent = new Intent();
                intent.setClassName("com.android.settings", "com.android.settings.TestingSettings");
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                if (intent.resolveActivity(pm) != null) {
                    reactContext.startActivity(intent);
                    promise.resolve(true);
                    return;
                }
            } catch (Exception e2) {
                // Try next approach
            }

            // Approach 3: Using component name for Settings$TestingSettingsActivity
            try {
                Intent intent = new Intent();
                ComponentName component = new ComponentName("com.android.settings",
                        "com.android.settings.Settings$TestingSettingsActivity");
                intent.setComponent(component);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                if (intent.resolveActivity(pm) != null) {
                    reactContext.startActivity(intent);
                    promise.resolve(true);
                    return;
                }
            } catch (Exception e3) {
                // Try next approach
            }

            // Approach 4: Try phone-specific testing activity
            try {
                Intent intent = new Intent();
                intent.setClassName("com.android.phone", "com.android.phone.settings.RadioInfo");
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                if (intent.resolveActivity(pm) != null) {
                    reactContext.startActivity(intent);
                    promise.resolve(true);
                    return;
                }
            } catch (Exception e4) {
                // Try next approach
            }

            // Approach 5: For Samsung devices
            try {
                Intent intent = new Intent();
                intent.setClassName("com.android.settings", "com.android.settings.Settings$TestingSettingsActivity");
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                if (intent.resolveActivity(pm) != null) {
                    reactContext.startActivity(intent);
                    promise.resolve(true);
                    return;
                }
            } catch (Exception e5) {
                // Try next approach
            }

            // Approach 6: Generic testing settings
            try {
                Intent intent = new Intent("android.settings.TESTING_SETTINGS");
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                if (intent.resolveActivity(pm) != null) {
                    reactContext.startActivity(intent);
                    promise.resolve(true);
                    return;
                }
            } catch (Exception e6) {
                // All attempts failed
            }

            promise.reject("UNAVAILABLE", "Testing menu not available on this device");
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void openNetworkSettings(Promise promise) {
        try {
            PackageManager pm = reactContext.getPackageManager();
            
            // Try network operator settings first
            try {
                Intent intent = new Intent(Settings.ACTION_NETWORK_OPERATOR_SETTINGS);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                if (intent.resolveActivity(pm) != null) {
                    reactContext.startActivity(intent);
                    promise.resolve(true);
                    return;
                }
            } catch (Exception e) {
                // Try next approach
            }
            
            // Try wireless settings
            try {
                Intent intent = new Intent(Settings.ACTION_WIRELESS_SETTINGS);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                if (intent.resolveActivity(pm) != null) {
                    reactContext.startActivity(intent);
                    promise.resolve(true);
                    return;
                }
            } catch (Exception e2) {
                // Try next approach
            }
            
            // Fallback to general settings
            try {
                Intent intent = new Intent(Settings.ACTION_SETTINGS);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                if (intent.resolveActivity(pm) != null) {
                    reactContext.startActivity(intent);
                    promise.resolve(true);
                    return;
                }
            } catch (Exception e3) {
                // All attempts failed
            }
            
            promise.reject("UNAVAILABLE", "Network settings not available");
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void openDeviceInfo(Promise promise) {
        try {
            PackageManager pm = reactContext.getPackageManager();
            
            // Try device info settings
            try {
                Intent intent = new Intent(Settings.ACTION_DEVICE_INFO_SETTINGS);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                if (intent.resolveActivity(pm) != null) {
                    reactContext.startActivity(intent);
                    promise.resolve(true);
                    return;
                }
            } catch (Exception e) {
                // Try next approach
            }
            
            // Fallback to About Phone for some devices
            try {
                Intent intent = new Intent(Settings.ACTION_SETTINGS);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                if (intent.resolveActivity(pm) != null) {
                    reactContext.startActivity(intent);
                    promise.resolve(true);
                    return;
                }
            } catch (Exception e2) {
                // All attempts failed
            }
            
            promise.reject("UNAVAILABLE", "Device info settings not available");
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void openMobileNetworkSettings(Promise promise) {
        try {
            PackageManager pm = reactContext.getPackageManager();
            
            // Try mobile network settings
            try {
                Intent intent = new Intent(Settings.ACTION_NETWORK_OPERATOR_SETTINGS);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                if (intent.resolveActivity(pm) != null) {
                    reactContext.startActivity(intent);
                    promise.resolve(true);
                    return;
                }
            } catch (Exception e) {
                // Try next approach
            }
            
            // Try data roaming settings
            try {
                Intent intent = new Intent(Settings.ACTION_DATA_ROAMING_SETTINGS);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                if (intent.resolveActivity(pm) != null) {
                    reactContext.startActivity(intent);
                    promise.resolve(true);
                    return;
                }
            } catch (Exception e2) {
                // Try next approach
            }
            
            // Fallback to wireless settings
            try {
                Intent intent = new Intent(Settings.ACTION_WIRELESS_SETTINGS);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                if (intent.resolveActivity(pm) != null) {
                    reactContext.startActivity(intent);
                    promise.resolve(true);
                    return;
                }
            } catch (Exception e3) {
                // Try next approach
            }
            
            // Last fallback to general settings
            try {
                Intent intent = new Intent(Settings.ACTION_SETTINGS);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                if (intent.resolveActivity(pm) != null) {
                    reactContext.startActivity(intent);
                    promise.resolve(true);
                    return;
                }
            } catch (Exception e4) {
                // All attempts failed
            }
            
            promise.reject("UNAVAILABLE", "Mobile network settings not available");
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void getPreferredNetworkType(Promise promise) {
        try {
            TelephonyManager telephonyManager = (TelephonyManager) reactContext.getSystemService(reactContext.TELEPHONY_SERVICE);
            
            if (telephonyManager == null) {
                promise.reject("ERROR", "TelephonyManager not available");
                return;
            }

            // Try to get the preferred network type from Settings
            // Using string constant because PREFERRED_NETWORK_MODE is hidden in public SDK
            try {
                int networkType = Settings.Global.getInt(
                    reactContext.getContentResolver(),
                    "preferred_network_mode"
                );
                
                WritableMap result = Arguments.createMap();
                result.putInt("networkType", networkType);
                result.putString("networkTypeName", getNetworkTypeName(networkType));
                promise.resolve(result);
            } catch (Settings.SettingNotFoundException e) {
                promise.reject("ERROR", "Unable to read network type setting");
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void setPreferredNetworkType(int networkType, Promise promise) {
        try {
            // Note: This requires MODIFY_PHONE_STATE permission which is a system permission
            // Regular apps cannot get this permission on non-rooted devices
            
            // Try to set using Settings.Global (requires WRITE_SECURE_SETTINGS permission)
            // Using string constant because PREFERRED_NETWORK_MODE is hidden in public SDK
            try {
                Settings.Global.putInt(
                    reactContext.getContentResolver(),
                    "preferred_network_mode",
                    networkType
                );
                promise.resolve(true);
            } catch (SecurityException e) {
                promise.reject("PERMISSION_DENIED", 
                    "This app doesn't have permission to change network settings. " +
                    "This requires system-level access or root. " +
                    "Please change it manually from the Testing Menu.");
            }
        } catch (Exception e) {
            promise.reject("ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void setTo5GOnly(Promise promise) {
        setPreferredNetworkType(NETWORK_MODE_NR_ONLY, promise);
    }

    @ReactMethod
    public void setTo5G4G(Promise promise) {
        setPreferredNetworkType(NETWORK_MODE_NR_LTE, promise);
    }

    @ReactMethod
    public void setTo4GOnly(Promise promise) {
        setPreferredNetworkType(NETWORK_MODE_LTE_ONLY, promise);
    }

    private String getNetworkTypeName(int networkType) {
        switch (networkType) {
            case 27: return "NR only (5G only)";
            case 26: return "NR/LTE (5G/4G)";
            case 25: return "NR/LTE/CDMA/EvDo/GSM/WCDMA";
            case 24: return "NR/LTE/CDMA/EvDo";
            case 23: return "NR/LTE/WCDMA";
            case 22: return "NR/LTE/TDSCDMA/CDMA/EvDo/GSM/WCDMA";
            case 21: return "NR/LTE/TDSCDMA/WCDMA";
            case 20: return "NR/LTE/TDSCDMA/GSM/WCDMA";
            case 11: return "LTE only (4G only)";
            case 10: return "LTE/CDMA/EvDo";
            case 9: return "LTE/CDMA/EvDo/GSM/WCDMA";
            case 8: return "LTE/GSM/WCDMA";
            case 3: return "GSM/WCDMA (Auto)";
            case 2: return "WCDMA only (3G only)";
            case 1: return "GSM only (2G only)";
            case 0: return "WCDMA preferred";
            default: return "Unknown (" + networkType + ")";
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

            // Modify MainApplication.kt to register the package
            const mainApplicationPath = path.join(androidSrcPath, 'MainApplication.kt');
            if (fs.existsSync(mainApplicationPath)) {
                let mainApplicationContent = fs.readFileSync(mainApplicationPath, 'utf8');

                // Check if PhoneInfoPackage is already added
                if (!mainApplicationContent.includes('add(PhoneInfoPackage())')) {
                    // Add the package registration
                    mainApplicationContent = mainApplicationContent.replace(
                        /\/\/ add\(MyReactNativePackage\(\)\)/,
                        '// add(MyReactNativePackage())\n              add(PhoneInfoPackage())'
                    );
                    fs.writeFileSync(mainApplicationPath, mainApplicationContent);
                }
            }

            return config;
        }]);

    return config;
};

module.exports = withPhoneInfoModule;
