#!/bin/bash

# Script to start Android emulator for Expo development
# Usage: ./scripts/start-emulator.sh [AVD_NAME]

ANDROID_SDK="/home/quyen/Android/Sdk"
EMULATOR="$ANDROID_SDK/emulator/emulator"
ADB="$ANDROID_SDK/platform-tools/adb"

# Check if emulator exists
if [ ! -f "$EMULATOR" ]; then
    echo "❌ Emulator not found at $EMULATOR"
    echo "Please check your Android SDK installation"
    exit 1
fi

# List available AVDs
echo "📱 Available Android Virtual Devices:"
AVDS=$($EMULATOR -list-avds)

if [ -z "$AVDS" ]; then
    echo ""
    echo "❌ No Android Virtual Devices (AVDs) found!"
    echo ""
    echo "📝 To create an emulator:"
    echo "   1. Open Android Studio"
    echo "   2. Go to Tools > Device Manager"
    echo "   3. Click 'Create Device'"
    echo "   4. Choose a device (e.g., Pixel 5)"
    echo "   5. Download a system image (e.g., Android 13)"
    echo "   6. Finish the setup"
    echo ""
    echo "Or use command line:"
    echo "   avdmanager create avd -n Pixel_5_API_33 -k 'system-images;android-33;google_apis;x86_64'"
    exit 1
fi

echo "$AVDS"
echo ""

# Get AVD name from argument or prompt
if [ -n "$1" ]; then
    AVD_NAME="$1"
else
    # Use first AVD if only one exists
    AVD_COUNT=$(echo "$AVDS" | wc -l)
    if [ "$AVD_COUNT" -eq 1 ]; then
        AVD_NAME=$(echo "$AVDS" | head -n 1)
        echo "✅ Using the only available AVD: $AVD_NAME"
    else
        echo "Please specify which AVD to start:"
        echo "$AVDS" | nl
        read -p "Enter AVD number or name: " SELECTION
        if [[ "$SELECTION" =~ ^[0-9]+$ ]]; then
            AVD_NAME=$(echo "$AVDS" | sed -n "${SELECTION}p")
        else
            AVD_NAME="$SELECTION"
        fi
    fi
fi

# Check if emulator is already running
if $ADB devices | grep -q "emulator"; then
    echo "✅ Emulator is already running"
    exit 0
fi

# Start emulator
echo "🚀 Starting emulator: $AVD_NAME"
echo "⏳ This may take a minute..."
$EMULATOR -avd "$AVD_NAME" > /dev/null 2>&1 &

# Wait for emulator to boot
echo "⏳ Waiting for emulator to boot..."
sleep 5

# Check if emulator is ready
TIMEOUT=120
ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
    if $ADB devices | grep -q "emulator.*device$"; then
        echo "✅ Emulator is ready!"
        echo ""
        echo "📱 You can now run: npm start"
        echo "   Then press 'a' in Expo to connect to this emulator"
        exit 0
    fi
    sleep 2
    ELAPSED=$((ELAPSED + 2))
    echo -n "."
done

echo ""
echo "⚠️  Emulator is taking longer than expected to boot"
echo "   Check the emulator window - it may still be starting"
echo "   You can run 'adb devices' to check status"

