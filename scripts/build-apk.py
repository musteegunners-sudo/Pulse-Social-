#!/usr/bin/env python3
import os
import shutil
import subprocess
import sys

PROJECT_ROOT = "/app/applet"
BUILD_DIR = "/tmp/apk_build_prod"
PUBLIC_DIR = os.path.join(PROJECT_ROOT, "public")
OUTPUT_APK = os.path.join(PUBLIC_DIR, "PulseSocial.apk")
ANDROID_JAR = "/usr/lib/android-sdk/platforms/android-23/android.jar"
KEYSTORE = "/tmp/debug.keystore"

print("=== Starting PulseSocial Android APK Build ===")

# Clean & Prepare directories
if os.path.exists(BUILD_DIR):
    shutil.rmtree(BUILD_DIR)

os.makedirs(f"{BUILD_DIR}/src/com/pulsesocial/app", exist_ok=True)
os.makedirs(f"{BUILD_DIR}/gen", exist_ok=True)
os.makedirs(f"{BUILD_DIR}/bin/classes", exist_ok=True)
os.makedirs(f"{BUILD_DIR}/res/values", exist_ok=True)
os.makedirs(f"{BUILD_DIR}/res/drawable", exist_ok=True)
os.makedirs(f"{BUILD_DIR}/assets/www", exist_ok=True)

# 1. Copy web assets from dist/
dist_dir = os.path.join(PROJECT_ROOT, "dist")
if not os.path.exists(dist_dir):
    print("Building web assets first (npm run build)...")
    subprocess.run(["npm", "run", "build"], cwd=PROJECT_ROOT, check=True)

for item in os.listdir(dist_dir):
    # Skip huge zip archives from inside the apk
    if item.endswith(".zip") or item.endswith(".apk"):
        continue
    s = os.path.join(dist_dir, item)
    d = os.path.join(BUILD_DIR, "assets/www", item)
    if os.path.isdir(s):
        shutil.copytree(s, d)
    else:
        shutil.copy2(s, d)

print(f"Copied web assets into APK assets/www (total {len(os.listdir(f'{BUILD_DIR}/assets/www'))} items)")

# 2. Write AndroidManifest.xml
manifest = """<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.pulsesocial.app"
    android:versionCode="1"
    android:versionName="1.0.0">

    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="33" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:label="PulseSocial"
        android:icon="@drawable/icon"
        android:hardwareAccelerated="true"
        android:usesCleartextTraffic="true">
        <activity
            android:name=".MainActivity"
            android:label="PulseSocial"
            android:windowSoftInputMode="adjustResize"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:exported="true"
            android:theme="@android:style/Theme.NoTitleBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>"""

with open(f"{BUILD_DIR}/AndroidManifest.xml", "w") as f:
    f.write(manifest)

# 3. Write strings.xml
with open(f"{BUILD_DIR}/res/values/strings.xml", "w") as f:
    f.write("""<resources><string name="app_name">PulseSocial</string></resources>""")

# 4. Copy app icon
icon_src = os.path.join(PUBLIC_DIR, "pwa-192x192.png")
if os.path.exists(icon_src):
    shutil.copy2(icon_src, f"{BUILD_DIR}/res/drawable/icon.png")

# 5. Write MainActivity.java
java_code = """package com.pulsesocial.app;

import android.app.Activity;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.ValueCallback;
import android.webkit.GeolocationPermissions;
import android.net.Uri;
import android.content.Intent;
import android.graphics.Bitmap;

public class MainActivity extends Activity {
    private WebView webView;
    private ValueCallback<Uri[]> uploadMessage;
    private final static int FILECHOOSER_RESULTCODE = 101;
    private final static String ONLINE_URL = "https://ais-pre-wlfy52vejmvjqr3dp5i5hj-62425478765.europe-west2.run.app";
    private final static String OFFLINE_URL = "file:///android_asset/www/index.html";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        
        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setGeolocationEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("file://")) {
                    return false;
                }
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    view.getContext().startActivity(intent);
                    return true;
                } catch (Exception e) {
                    return true;
                }
            }

            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                // If online failed, try offline bundled app
                if (failingUrl.startsWith("http")) {
                    view.loadUrl(OFFLINE_URL);
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, false);
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, WebChromeClient.FileChooserParams fileChooserParams) {
                if (uploadMessage != null) {
                    uploadMessage.onReceiveValue(null);
                }
                uploadMessage = filePathCallback;
                Intent intent = fileChooserParams.createIntent();
                try {
                    startActivityForResult(intent, FILECHOOSER_RESULTCODE);
                } catch (Exception e) {
                    uploadMessage = null;
                    return false;
                }
                return true;
            }
        });

        // Load the live URL by default, with automatic offline asset fallback
        webView.loadUrl(ONLINE_URL);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILECHOOSER_RESULTCODE) {
            if (uploadMessage == null) return;
            uploadMessage.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data));
            uploadMessage = null;
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
"""

with open(f"{BUILD_DIR}/src/com/pulsesocial/app/MainActivity.java", "w") as f:
    f.write(java_code)

# 6. AAPT Generate R.java
print("Generating R.java...")
subprocess.run([
    "aapt", "package", "-f", "-m",
    "-J", f"{BUILD_DIR}/gen",
    "-M", f"{BUILD_DIR}/AndroidManifest.xml",
    "-S", f"{BUILD_DIR}/res",
    "-I", ANDROID_JAR
], check=True)

# 7. Compile Java to Bytecode (Java 8 target for Dalvik)
print("Compiling Java classes...")
subprocess.run([
    "javac", "-source", "8", "-target", "8",
    "-d", f"{BUILD_DIR}/bin/classes",
    "-cp", ANDROID_JAR,
    f"{BUILD_DIR}/gen/com/pulsesocial/app/R.java",
    f"{BUILD_DIR}/src/com/pulsesocial/app/MainActivity.java"
], check=True)

# 8. Dalvik Exchange (dx) to produce classes.dex
print("Generating classes.dex with dalvik-exchange...")
subprocess.run([
    "/usr/bin/dalvik-exchange", "--dex",
    f"--output={BUILD_DIR}/bin/classes.dex",
    f"{BUILD_DIR}/bin/classes"
], check=True)

# 9. Package unaligned APK with resources and assets
print("Packaging unaligned APK...")
subprocess.run([
    "aapt", "package", "-f",
    "-M", f"{BUILD_DIR}/AndroidManifest.xml",
    "-S", f"{BUILD_DIR}/res",
    "-A", f"{BUILD_DIR}/assets",
    "-I", ANDROID_JAR,
    "-F", f"{BUILD_DIR}/bin/unaligned.apk"
], check=True)

# 10. Add classes.dex to APK
subprocess.run(
    ["aapt", "add", "unaligned.apk", "classes.dex"],
    cwd=f"{BUILD_DIR}/bin",
    check=True
)

# 11. Zipalign APK (4-byte boundary)
print("Zipaligning APK...")
aligned_apk = f"{BUILD_DIR}/bin/aligned.apk"
if os.path.exists(aligned_apk):
    os.remove(aligned_apk)

subprocess.run(
    ["zipalign", "-v", "-p", "4", "unaligned.apk", "aligned.apk"],
    cwd=f"{BUILD_DIR}/bin",
    check=True
)

# 12. Create signing key if not exists
if not os.path.exists(KEYSTORE):
    print("Creating debug keystore...")
    subprocess.run([
        "keytool", "-genkeypair", "-v",
        "-keystore", KEYSTORE,
        "-alias", "androiddebugkey",
        "-keypass", "android",
        "-storepass", "android",
        "-keyalg", "RSA",
        "-keysize", "2048",
        "-validity", "10000",
        "-dname", "CN=PulseSocial,O=PulseSocial,C=US"
    ], check=True)

# 13. Sign APK with apksigner (v1, v2, v3 scheme)
print("Signing APK with apksigner...")
if os.path.exists(OUTPUT_APK):
    os.remove(OUTPUT_APK)

subprocess.run([
    "apksigner", "sign",
    "--ks", KEYSTORE,
    "--ks-pass", "pass:android",
    "--ks-key-alias", "androiddebugkey",
    "--out", OUTPUT_APK,
    aligned_apk
], check=True)

# 14. Verify signed APK
print("Verifying signed APK...")
subprocess.run(["apksigner", "verify", "-v", OUTPUT_APK], check=True)

apk_size = os.path.getsize(OUTPUT_APK)
print(f"SUCCESS: Built and signed Android APK at {OUTPUT_APK} ({apk_size / 1024 / 1024:.2f} MB)")
