# Network Mode Control Guide

This app allows you to directly control the preferred network type on your Android device, including setting it to 5G only (NR only).

## Features

- **View Current Network Mode**: See your current preferred network type
- **Set to 5G Only (NR only)**: Force your device to use only 5G networks
- **Set to 5G/4G (NR/LTE)**: Allow device to use 5G and 4G
- **Set to 4G Only (LTE only)**: Force your device to use only 4G

## Permission Requirements

Changing network mode requires **WRITE_SECURE_SETTINGS** permission, which is a system-level permission that regular apps cannot request through normal means.

### How to Grant Permission

You have two options:

#### Option 1: Grant Permission via ADB (Recommended)

1. **Enable USB Debugging** on your phone:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times to enable Developer Options
   - Go to Settings > Developer Options
   - Enable "USB Debugging"

2. **Connect your phone** to your computer via USB

3. **Run this ADB command**:
   ```bash
   adb shell pm grant com.fiveg.phoneinfo android.permission.WRITE_SECURE_SETTINGS
   ```

4. **Restart the app** - The network mode buttons will now work!

#### Option 2: Change Manually via Testing Menu

If you don't want to use ADB, you can:

1. Tap "Device Testing Menu" button in the app
2. Find "Set preferred network type"
3. Change to "NR only" manually

## Network Mode Options

- **NR only (27)**: 5G only
- **NR/LTE (26)**: 5G and 4G
- **LTE only (11)**: 4G only
- **Other modes**: Various combinations of 2G/3G/4G/5G

## Important Notes

1. **Device Compatibility**: Not all devices support all network modes. Some manufacturers may restrict certain modes.

2. **Network Availability**: Even if you set to "5G only", you need to be in a 5G coverage area.

3. **Battery Impact**: Using "5G only" may drain battery faster if 5G signal is weak or unavailable.

4. **Manual Override**: If the app buttons don't work after granting permission, use the Testing Menu as a fallback.

## Troubleshooting

### "Permission Denied" Error

**Solution**: Grant the permission via ADB (see Option 1 above)

### ADB Command Not Recognized

**Solution**: Install Android Platform Tools:
- Download from: https://developer.android.com/tools/releases/platform-tools
- Add the folder to your system PATH

### Still Can't Change Network Mode

**Solution**: Some devices have manufacturer restrictions. Try:
1. Using the Testing Menu instead
2. Checking if your device supports the network mode you're selecting
3. Ensuring you have an active SIM card

## EAS Build Requirements

To use this feature in an EAS build:

1. Build the app with:
   ```bash
   eas build --platform android --profile development
   ```

2. Install the APK on your device

3. Grant the permission via ADB

4. Enjoy quick network mode switching!

## Technical Details

The app uses Android's `Settings.Global.PREFERRED_NETWORK_MODE` to read and write the network mode preference. Network type constants:

- `27` = NR only (5G only)
- `26` = NR/LTE (5G/4G)
- `11` = LTE only (4G only)

For a full list of network modes, see the `getNetworkTypeName()` method in `PhoneInfoModule.java`.
