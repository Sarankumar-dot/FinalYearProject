/**
 * Voice API Test Utility
 * Run this to test if Web Speech API is working in your browser
 *
 * Usage in browser console:
 * import { testWebSpeechAPI, testVoiceSettings } from '@/utils/testVoice'
 * testWebSpeechAPI()
 * testVoiceSettings()
 */

export const testWebSpeechAPI = () => {
  console.log("🧪 Testing Web Speech API...");

  if (!window.speechSynthesis) {
    console.error("❌ Web Speech API NOT AVAILABLE in this browser");
    return false;
  }

  console.log("✅ Web Speech API is available");
  console.log(
    "Browser voices available:",
    window.speechSynthesis.getVoices().length,
  );

  // Test basic voice
  const testUtterance = new SpeechSynthesisUtterance(
    "Voice test. If you can hear this, Web Speech API is working.",
  );
  testUtterance.rate = 1.0;
  testUtterance.pitch = 1.0;
  testUtterance.volume = 1.0;

  testUtterance.onerror = (e) => {
    console.error("❌ Speech error:", e.error);
  };

  testUtterance.onend = () => {
    console.log("✅ Voice test completed successfully");
  };

  console.log("🔊 Speaking test message (check speaker volume)...");
  window.speechSynthesis.speak(testUtterance);
  return true;
};

export const testVoiceSettings = () => {
  console.log("🧪 Testing Voice Settings...");

  const storedSettings = localStorage.getItem("sas_a11y");
  if (!storedSettings) {
    console.warn("⚠️ No accessibility settings found in localStorage");
    return false;
  }

  const settings = JSON.parse(storedSettings);
  console.log("📋 Accessibility Settings:", {
    voiceGuidedNav: settings.voiceGuidedNav,
    autoAnnounceElements: settings.autoAnnounceElements,
    mouseHoverGuidance: settings.mouseHoverGuidance,
    screenReaderMode: settings.screenReaderMode,
    ttsSpeed: settings.ttsSpeed,
  });

  const allEnabled =
    settings.voiceGuidedNav &&
    settings.autoAnnounceElements &&
    settings.mouseHoverGuidance;

  if (allEnabled) {
    console.log("✅ All voice settings are ENABLED");
  } else {
    console.warn("⚠️ Some voice settings are DISABLED:", {
      voiceGuidedNav: !settings.voiceGuidedNav ? "❌ OFF" : "✅ ON",
      autoAnnounceElements: !settings.autoAnnounceElements ? "❌ OFF" : "✅ ON",
      mouseHoverGuidance: !settings.mouseHoverGuidance ? "❌ OFF" : "✅ ON",
    });
  }

  return allEnabled;
};

export const testMouseHoverVoice = () => {
  console.log("🧪 Testing Mouse Hover Voice Announcement...");
  console.log("Instructions:");
  console.log("1. Move your mouse over any button or link below");
  console.log("2. You should hear the element name announced");
  console.log("3. Check console for: 'Announcing hovered element:'");

  // Create a test button
  const testBtn = document.createElement("button");
  testBtn.textContent = "Test Button - Hover over me";
  testBtn.style.padding = "10px 20px";
  testBtn.style.margin = "10px";
  testBtn.style.fontSize = "16px";
  testBtn.style.backgroundColor = "#4CAF50";
  testBtn.style.color = "white";
  testBtn.style.border = "none";
  testBtn.style.borderRadius = "4px";
  testBtn.style.cursor = "pointer";

  document.body.appendChild(testBtn);
  console.log(
    "✅ Test button added to page. Hover over the green button to test.",
  );

  return testBtn;
};

export const testKeyboardVoice = () => {
  console.log("🧪 Testing Keyboard Navigation Voice...");
  console.log("Instructions:");
  console.log("1. Press Tab to move focus to the next element");
  console.log("2. You should hear element announcements");
  console.log("3. Check console for: 'Announcing focused element:'");

  const testBtn1 = document.createElement("button");
  testBtn1.textContent = "Tab to me (1)";
  testBtn1.style.display = "block";
  testBtn1.style.padding = "10px 20px";
  testBtn1.style.margin = "10px";
  testBtn1.style.fontSize = "16px";

  const testBtn2 = document.createElement("button");
  testBtn2.textContent = "Tab to me (2)";
  testBtn2.style.display = "block";
  testBtn2.style.padding = "10px 20px";
  testBtn2.style.margin = "10px";
  testBtn2.style.fontSize = "16px";

  const testInput = document.createElement("input");
  testInput.type = "text";
  testInput.placeholder = "Tab to me (input)";
  testInput.style.padding = "10px";
  testInput.style.margin = "10px";
  testInput.style.fontSize = "16px";

  document.body.appendChild(testBtn1);
  document.body.appendChild(testBtn2);
  document.body.appendChild(testInput);

  console.log(
    "✅ Test elements added. Press Tab to navigate and test keyboard voice.",
  );
};

export const checkUserType = () => {
  console.log("🧪 Checking User Type...");

  // Try to get user from localStorage or context
  const userStr = localStorage.getItem("sas_user");
  if (!userStr) {
    console.warn("⚠️ No user found in localStorage");
    console.log("Make sure you're logged in!");
    return null;
  }

  const user = JSON.parse(userStr);
  console.log("👤 Current User:", {
    id: user.id,
    name: user.name,
    accessibilityType: user.accessibilityType,
  });

  if (user.accessibilityType === "visually-impaired") {
    console.log("✅ User is visually-impaired - Voice should be auto-enabled");
  } else if (user.accessibilityType === "hearing-impaired") {
    console.log("ℹ️ User is hearing-impaired - Voice features not needed");
  } else {
    console.log("⚠️ User accessibility type:", user.accessibilityType);
  }

  return user;
};

export const runFullVoiceTest = () => {
  console.log("================================");
  console.log("🚀 RUNNING FULL VOICE DIAGNOSTIC");
  console.log("================================");

  console.log("\n1️⃣ Checking User Type...");
  const user = checkUserType();

  console.log("\n2️⃣ Checking Voice Settings...");
  const settingsOk = testVoiceSettings();

  console.log("\n3️⃣ Testing Web Speech API...");
  const apiOk = testWebSpeechAPI();

  console.log("\n================================");
  console.log("📊 DIAGNOSTIC SUMMARY");
  console.log("================================");
  console.log(
    `User visually-impaired: ${user?.accessibilityType === "visually-impaired" ? "✅" : "❌"}`,
  );
  console.log(`Voice settings enabled: ${settingsOk ? "✅" : "❌"}`);
  console.log(`Web Speech API available: ${apiOk ? "✅" : "❌"}`);
  console.log("\nIf all checks pass but voice still not working:");
  console.log("- Check browser volume is not muted");
  console.log("- Check system volume is not muted");
  console.log("- Try pressing Alt+M to toggle accessibility features");
  console.log("- Check Firefox/Chrome, not Safari or Edge (limited support)");
};

// Make tests globally available
if (typeof window !== "undefined") {
  window.VoiceTest = {
    testWebSpeechAPI,
    testVoiceSettings,
    testMouseHoverVoice,
    testKeyboardVoice,
    checkUserType,
    runFullVoiceTest,
  };
}
