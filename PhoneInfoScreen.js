import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    PermissionsAndroid,
    Platform,
    Linking,
    Alert,
    NativeModules,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DeviceInfo from 'react-native-device-info';
import NetInfo from '@react-native-community/netinfo';

const { PhoneInfoModule } = NativeModules;

export default function PhoneInfoScreen() {
    const [phoneInfo, setPhoneInfo] = useState({
        imei: 'Loading...',
        phoneNumber: 'Loading...',
        carrier: 'Loading...',
        networkType: 'Loading...',
        isConnected: false,
        signalStrength: 'N/A',
        serialNumber: 'Loading...',
        androidId: 'Loading...',
    });

    const [currentNetworkMode, setCurrentNetworkMode] = useState('Loading...');

    useEffect(() => {
        requestPermissions();
        loadNetworkMode();
    }, []);

    const loadNetworkMode = async () => {
        if (Platform.OS !== 'android' || !PhoneInfoModule) {
            setCurrentNetworkMode('Not available');
            return;
        }
        
        try {
            if (typeof PhoneInfoModule.getPreferredNetworkType === 'function') {
                const result = await PhoneInfoModule.getPreferredNetworkType();
                setCurrentNetworkMode(result.networkTypeName);
            } else {
                setCurrentNetworkMode('Rebuild app to enable this feature');
            }
        } catch (error) {
            console.log('Error loading network mode:', error);
            setCurrentNetworkMode('Unable to read');
        }
    };

    const setTo5GOnly = async () => {
        if (Platform.OS !== 'android') {
            Alert.alert('Not Available', 'This feature is only available on Android devices.');
            return;
        }

        try {
            if (PhoneInfoModule && typeof PhoneInfoModule.setTo5GOnly === 'function') {
                await PhoneInfoModule.setTo5GOnly();
                Alert.alert('Success', 'Network mode set to 5G only (NR only)');
                loadNetworkMode();
            } else {
                Alert.alert(
                    'Feature Not Available',
                    'This feature requires a rebuild.\n\nRun: eas build --platform android --profile development\n\nThen grant permission:\nadb shell pm grant com.fiveg.phoneinfo android.permission.WRITE_SECURE_SETTINGS'
                );
            }
        } catch (error) {
            if (error.code === 'PERMISSION_DENIED') {
                Alert.alert(
                    'Permission Required',
                    'This app needs system-level permissions to change network settings.\n\nTo grant permission via ADB:\nadb shell pm grant com.fiveg.phoneinfo android.permission.WRITE_SECURE_SETTINGS\n\nOr change it manually from the Testing Menu.',
                    [
                        { text: 'Open Testing Menu', onPress: openDeviceTestingMenu },
                        { text: 'OK', style: 'cancel' }
                    ]
                );
            } else {
                Alert.alert('Error', error.message || 'Failed to set network mode');
            }
        }
    };

    const setTo5G4G = async () => {
        if (Platform.OS !== 'android') return;

        try {
            if (PhoneInfoModule && typeof PhoneInfoModule.setTo5G4G === 'function') {
                await PhoneInfoModule.setTo5G4G();
                Alert.alert('Success', 'Network mode set to 5G/4G (NR/LTE)');
                loadNetworkMode();
            } else {
                Alert.alert('Feature Not Available', 'This feature requires a rebuild. Run: eas build --platform android --profile development');
            }
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to set network mode');
        }
    };

    const setTo4GOnly = async () => {
        if (Platform.OS !== 'android') return;

        try {
            if (PhoneInfoModule && typeof PhoneInfoModule.setTo4GOnly === 'function') {
                await PhoneInfoModule.setTo4GOnly();
                Alert.alert('Success', 'Network mode set to 4G only (LTE only)');
                loadNetworkMode();
            } else {
                Alert.alert('Feature Not Available', 'This feature requires a rebuild. Run: eas build --platform android --profile development');
            }
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to set network mode');
        }
    };

    const openDeviceTestingMenu = async () => {
        if (Platform.OS !== 'android') {
            Alert.alert('Not Available', 'This feature is only available on Android devices.');
            return;
        }

        try {
            if (PhoneInfoModule) {
                await PhoneInfoModule.openTestingMenu();
            } else {
                Alert.alert(
                    'Native Module Not Available',
                    'The native module is not loaded in your current build.\n\nTo enable all features, rebuild the app with:\neas build --platform android --profile development\n\nAlternative: Dial *#*#4636#*#* manually from your phone app.',
                    [
                        { text: 'OK' }
                    ]
                );
            }
        } catch (error) {
            Alert.alert(
                'Testing Menu Not Available',
                'The device testing menu could not be opened.\n\nTry dialing *#*#4636#*#* from your phone app, or rebuild the app to fix this issue.',
                [
                    { text: 'Open Settings', onPress: openNetworkSettings },
                    { text: 'OK', style: 'cancel' }
                ]
            );
        }
    };

    const openDialer = () => {
        const url = 'tel:*#*#4636#*#*';
        Linking.openURL(url).catch((err) => {
            console.error('Error opening dialer:', err);
            Alert.alert('Error', 'Unable to open dialer');
        });
    };

    const openNetworkSettings = async () => {
        if (Platform.OS !== 'android') {
            Alert.alert('Not Available', 'This feature is only available on Android devices.');
            return;
        }

        try {
            if (PhoneInfoModule) {
                await PhoneInfoModule.openNetworkSettings();
            } else {
                // Fallback: Use Linking to open settings
                const supported = await Linking.canOpenURL('app-settings:');
                if (supported) {
                    await Linking.openSettings();
                } else {
                    Alert.alert('Not Available', 'Unable to open network settings. Please rebuild the app with: eas build --platform android --profile development');
                }
            }
        } catch (error) {
            console.error('Network settings error:', error);
            // Try opening general settings as fallback
            try {
                await Linking.openSettings();
            } catch (e) {
                Alert.alert('Error', 'Unable to open settings. Please rebuild the app.');
            }
        }
    };

    const openAboutPhone = async () => {
        if (Platform.OS !== 'android') {
            Alert.alert('Not Available', 'This feature is only available on Android devices.');
            return;
        }

        try {
            if (PhoneInfoModule) {
                await PhoneInfoModule.openDeviceInfo();
            } else {
                // Fallback: Use Linking to open general settings
                await Linking.openSettings();
            }
        } catch (error) {
            console.error('Device info error:', error);
            Alert.alert('Error', 'Unable to open device settings. Please rebuild the app with: eas build --platform android --profile development');
        }
    };

    const openMobileNetworkSettings = async () => {
        if (Platform.OS !== 'android') {
            Alert.alert('Not Available', 'This feature is only available on Android devices.');
            return;
        }

        try {
            if (PhoneInfoModule) {
                await PhoneInfoModule.openMobileNetworkSettings();
            } else {
                // Fallback: Use Linking to open general settings
                await Linking.openSettings();
            }
        } catch (error) {
            console.error('Mobile network settings error:', error);
            Alert.alert('Error', 'Unable to open mobile network settings.\n\nTo fix this: Rebuild the app with:\neas build --platform android --profile development');
        }
    };

    const requestPermissions = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
                    PermissionsAndroid.PERMISSIONS.READ_SMS,
                    PermissionsAndroid.PERMISSIONS.READ_PHONE_NUMBERS,
                ]);

                if (
                    granted['android.permission.READ_PHONE_STATE'] === PermissionsAndroid.RESULTS.GRANTED
                ) {
                    loadPhoneInfo();
                } else {
                    console.log('Phone permissions denied');
                    loadPhoneInfo(); // Still load what we can without permissions
                }
            } catch (err) {
                console.warn(err);
                loadPhoneInfo();
            }
        } else {
            loadPhoneInfo();
        }
    };

    const loadPhoneInfo = async () => {
        try {
            // Get device info
            let imei = 'Not available';
            let phoneNumber = 'Not available';
            let carrier = 'Unknown';
            let serialNumber = 'Not available';
            let androidId = 'Not available';

            try {
                // Check if getImei exists before calling
                if (typeof DeviceInfo.getImei === 'function') {
                    imei = await DeviceInfo.getImei();
                } else {
                    imei = 'Not supported on this device';
                }
            } catch (e) {
                imei = 'Permission required';
            }

            try {
                phoneNumber = await DeviceInfo.getPhoneNumber();
            } catch (e) {
                phoneNumber = 'Not available';
            }

            try {
                carrier = await DeviceInfo.getCarrier();
            } catch (e) {
                carrier = 'Unknown';
            }

            try {
                serialNumber = await DeviceInfo.getSerialNumber();
            } catch (e) {
                serialNumber = 'Not available';
            }

            try {
                androidId = await DeviceInfo.getAndroidId();
            } catch (e) {
                androidId = 'Not available';
            }

            // Get network info
            const netInfoState = await NetInfo.fetch();

            setPhoneInfo({
                imei: imei || 'Not available',
                phoneNumber: phoneNumber || 'Not available',
                carrier: carrier || 'Unknown',
                networkType: netInfoState.type || 'Unknown',
                isConnected: netInfoState.isConnected,
                signalStrength: 'N/A',
                serialNumber: serialNumber || 'Not available',
                androidId: androidId || 'Not available',
            });
        } catch (error) {
            console.error('Error loading phone info:', error);
        }
    };

    const InfoRow = ({ label, value, isPrimary }) => (
        <View style={styles.infoRow}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>
                {value}
                {isPrimary && <Text style={styles.primaryTag}> (Primary)</Text>}
            </Text>
        </View>
    );

    const ActionButton = ({ title, onPress, icon }) => (
        <TouchableOpacity style={styles.actionButton} onPress={onPress}>
            <Text style={styles.actionButtonIcon}>{icon}</Text>
            <Text style={styles.actionButtonText}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton}>
                    {/* <Text style={styles.backButtonText}>←</Text> */}
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Phone info</Text>
                <TouchableOpacity style={styles.menuButton}>
                    {/* <Text style={styles.menuButtonText}>⋮</Text> */}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Native Android Menus</Text>
                    <Text style={styles.sectionDescription}>
                        Access native Android device testing and configuration menus
                    </Text>
                </View>

                <View style={styles.buttonGroup}>
                    <ActionButton
                        title="Device Testing Menu"
                        icon="📱"
                        onPress={openDeviceTestingMenu}
                    />
                    <ActionButton
                        title="Mobile Network Settings"
                        icon="📡"
                        onPress={openMobileNetworkSettings}
                    />
                    <ActionButton
                        title="Network Settings"
                        icon="🌐"
                        onPress={openNetworkSettings}
                    />
                    <ActionButton
                        title="About Phone"
                        icon="ℹ️"
                        onPress={openAboutPhone}
                    />
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Network Mode Switch</Text>
                    <Text style={styles.sectionDescription}>
                        Current mode: {currentNetworkMode}
                    </Text>
                    <Text style={styles.sectionWarning}>
                        Note: Changing network mode requires system permission. If you see a permission error, you can grant it via ADB or change manually in Testing Menu.
                    </Text>
                </View>

                <View style={styles.buttonGroup}>
                    <ActionButton
                        title="Set to 5G Only (NR only)"
                        icon="📶"
                        onPress={setTo5GOnly}
                    />
                    <ActionButton
                        title="Set to 5G/4G (NR/LTE)"
                        icon="📡"
                        onPress={setTo5G4G}
                    />
                    <ActionButton
                        title="Set to 4G Only (LTE only)"
                        icon="📱"
                        onPress={setTo4GOnly}
                    />
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Current Device Information</Text>
                </View>

                <InfoRow
                    label="IMEI:"
                    value={phoneInfo.imei}
                    isPrimary={true}
                />

                <InfoRow
                    label="Phone number:"
                    value={phoneInfo.phoneNumber}
                />

                <InfoRow
                    label="IMSI:"
                    value={phoneInfo.androidId}
                />

                <InfoRow
                    label="Current network:"
                    value={phoneInfo.carrier}
                />

                <InfoRow
                    label="Data service:"
                    value={phoneInfo.isConnected ? "Connected" : "Disconnected"}
                />

                <InfoRow
                    label="Data network type:"
                    value={phoneInfo.networkType.toUpperCase()}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#000000',
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 24,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '500',
    },
    menuButton: {
        padding: 8,
    },
    menuButtonText: {
        color: '#FFFFFF',
        fontSize: 24,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    section: {
        marginTop: 20,
        marginBottom: 10,
    },
    sectionTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        padding: 12,
        borderRadius: 4,
    },
    dropdownText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    dropdownArrow: {
        color: '#FFFFFF',
        fontSize: 12,
    },
    infoRow: {
        marginBottom: 16,
    },
    label: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    value: {
        color: '#CCCCCC',
        fontSize: 14,
        lineHeight: 20,
    },
    primaryTag: {
        color: '#888888',
    },
    buttonGroup: {
        marginTop: 10,
        marginBottom: 20,
        gap: 12,
    },
    actionButton: {
        backgroundColor: '#1A1A1A',
        padding: 16,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333333',
        marginBottom: 12,
    },
    actionButtonIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    sectionDescription: {
        color: '#888888',
        fontSize: 13,
        marginTop: 4,
        lineHeight: 18,
    },
    sectionWarning: {
        color: '#FFA500',
        fontSize: 12,
        marginTop: 8,
        lineHeight: 16,
        fontStyle: 'italic',
    },
    divider: {
        height: 1,
        backgroundColor: '#333333',
        marginVertical: 24,
    },
    toggleSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 30,
    },
    toggle: {
        width: 50,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#4A90E2',
        justifyContent: 'center',
        padding: 3,
    },
    toggleActive: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        alignSelf: 'flex-end',
    },
});
