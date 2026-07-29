import { Audio } from 'expo-av';

let soundObject: Audio.Sound | null = null;

export const playCompletionSound = async () => {
  try {
    // Stop and unload existing sound if playing
    if (soundObject) {
      try {
        await soundObject.stopAsync();
        await soundObject.unloadAsync();
      } catch (err) {
        // Ignore errors from already unloaded sound
      }
    }

    // Load and play the premium chime audio alert
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://assets.mixkit.co/active_storage/sfx/911/911-200.wav' },
      { shouldPlay: true, volume: 1.0 }
    );
    soundObject = sound;
  } catch (error) {
    console.error('Error playing completion sound:', error);
  }
};
