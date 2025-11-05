import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    PermissionsAndroid,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DeviceInfo from 'react-native-device-info';
import NetInfo from '@react-native-community/netinfo';

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

    useEffect(() => {
        requestPermissions();
    }, []);

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

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Phone info</Text>
                <TouchableOpacity style={styles.menuButton}>
                    <Text style={styles.menuButtonText}>⋮</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select phone index</Text>
                    <View style={styles.dropdown}>
                        <Text style={styles.dropdownText}>Phone 0</Text>
                        <Text style={styles.dropdownArrow}>▼</Text>
                    </View>
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
                    label="Current subID:"
                    value="1"
                />

                <InfoRow
                    label="SubId of default data SIM:"
                    value="1"
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
                    label="Roaming:"
                    value="Not roaming"
                />

                <InfoRow
                    label="Data service:"
                    value={phoneInfo.isConnected ? "Connected" : "Disconnected"}
                />

                <InfoRow
                    label="Data network type:"
                    value={phoneInfo.networkType.toUpperCase()}
                />

                <InfoRow
                    label="Data raw registration state:"
                    value="HOME"
                />

                <InfoRow
                    label="Override network type:"
                    value="NONE"
                />

                <InfoRow
                    label="Voice service:"
                    value="In service"
                />

                <InfoRow
                    label="Voice network type:"
                    value="Unknown"
                />

                <InfoRow
                    label="Voice raw registration state:"
                    value="NOT_REG_OR_SEARCHING"
                />

                <InfoRow
                    label="WLAN data raw registration state:"
                    value="NOT_REG_OR_SEARCHING"
                />

                <InfoRow
                    label="Signal strength:"
                    value="-105 dBm  35 asu"
                />

                <InfoRow
                    label="DL bandwidth (kbps):"
                    value="37776"
                />

                <InfoRow
                    label="UL bandwidth (kbps):"
                    value="6531"
                />

                <InfoRow
                    label="EN-DC available (NSA):"
                    value="false"
                />

                <InfoRow
                    label="DCNR restricted (NSA):"
                    value="false"
                />

                <InfoRow
                    label="NR available (NSA):"
                    value="false"
                />

                <InfoRow
                    label="NR state (NSA):"
                    value="NONE"
                />

                <InfoRow
                    label="NR frequency:"
                    value="HIGH"
                />

                <InfoRow
                    label="Network Slicing Config:"
                    value="Unable to get slicing config."
                />

                <InfoRow
                    label="eUICC info:"
                    value="Euicc Feature is disabled"
                />

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Set preferred network type:</Text>
                    <View style={styles.dropdown}>
                        <Text style={styles.dropdownText}>NR only</Text>
                        <Text style={styles.dropdownArrow}>▼</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Signal strength</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Data network type:</Text>
                </View>

                <View style={[styles.section, styles.toggleSection]}>
                    <Text style={styles.label}>Mobile radio power</Text>
                    <View style={styles.toggle}>
                        <View style={styles.toggleActive} />
                    </View>
                </View>
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
