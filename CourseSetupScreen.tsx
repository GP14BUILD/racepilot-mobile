import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import * as Location from 'expo-location';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface Mark {
  name: string;
  lat: number;
  lon: number;
  mark_type: string;
  color: string;
  sequence: number;
  shape: string;
}

const MARK_TYPES = [
  { type: 'start', label: 'Committee Boat', color: '#3B82F6', shape: 'square' },
  { type: 'start', label: 'Pin End', color: '#EF4444', shape: 'pin' },
  { type: 'windward', label: 'Windward Mark', color: '#10B981', shape: 'circle' },
  { type: 'leeward', label: 'Leeward Mark', color: '#F59E0B', shape: 'circle' },
  { type: 'offset', label: 'Offset/Gybe Mark', color: '#8B5CF6', shape: 'triangle' },
  { type: 'gate', label: 'Gate Left', color: '#EC4899', shape: 'circle' },
  { type: 'gate', label: 'Gate Right', color: '#06B6D4', shape: 'circle' },
  { type: 'finish', label: 'Finish Boat', color: '#3B82F6', shape: 'square' },
  { type: 'finish', label: 'Finish Pin', color: '#EF4444', shape: 'pin' },
];

export default function CourseSetupScreen() {
  const [courseName, setCourseName] = useState('');
  const [marks, setMarks] = useState<Mark[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isSetupMode, setIsSetupMode] = useState(false);

  useEffect(() => {
    let subscription: Location.LocationSubscription;

    const startLocationUpdates = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (newLocation) => {
          setLocation(newLocation);
        }
      );
    };

    if (isSetupMode) {
      startLocationUpdates();
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [isSetupMode]);

  const addMark = (markConfig: typeof MARK_TYPES[0]) => {
    if (!location) {
      Alert.alert('No GPS', 'Waiting for GPS position...');
      return;
    }

    const newMark: Mark = {
      name: markConfig.label,
      lat: location.coords.latitude,
      lon: location.coords.longitude,
      mark_type: markConfig.type,
      color: markConfig.color,
      sequence: marks.length + 1,
      shape: markConfig.shape,
    };

    setMarks([...marks, newMark]);

    Alert.alert(
      'Mark Added!',
      `${markConfig.label} recorded at:\n${newMark.lat.toFixed(6)}, ${newMark.lon.toFixed(6)}`,
      [{ text: 'OK' }]
    );
  };

  const removeMark = (index: number) => {
    Alert.alert(
      'Remove Mark',
      `Remove ${marks[index].name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newMarks = marks.filter((_, i) => i !== index);
            // Resequence
            const resequenced = newMarks.map((m, i) => ({ ...m, sequence: i + 1 }));
            setMarks(resequenced);
          },
        },
      ]
    );
  };

  const saveCourse = async () => {
    if (!courseName.trim()) {
      Alert.alert('Missing Name', 'Please enter a course name');
      return;
    }

    if (marks.length < 2) {
      Alert.alert('Not Enough Marks', 'Add at least 2 marks to create a course');
      return;
    }

    try {
      const courseData = {
        name: courseName,
        description: `Created from mobile on ${new Date().toLocaleDateString()}`,
        created_by: 1, // Default user for MVP
        config_json: {
          type: 'custom',
          created_with: 'mobile_app',
          mark_count: marks.length,
        },
        marks: marks,
      };

      const response = await fetch(`${API_URL}/courses/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        throw new Error('Failed to save course');
      }

      const data = await response.json();

      Alert.alert(
        'Course Saved!',
        `"${courseName}" has been saved with ${marks.length} marks.\nCourse ID: ${data.id}`,
        [
          {
            text: 'Create Another',
            onPress: () => {
              setCourseName('');
              setMarks([]);
            },
          },
          { text: 'Done', onPress: () => setIsSetupMode(false) },
        ]
      );
    } catch (error) {
      console.error('Save course error:', error);
      Alert.alert('Error', 'Failed to save course. Check connection to backend.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⛵ Course Setup</Text>
        <Text style={styles.subtitle}>Sail to each mark and tap to record</Text>
      </View>

      {/* Course Name Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Course Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Olympic Course, Windward-Leeward"
          value={courseName}
          onChangeText={setCourseName}
        />
      </View>

      {/* GPS Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Position</Text>
        {location ? (
          <View>
            <Text style={styles.info}>📍 Lat: {location.coords.latitude.toFixed(6)}</Text>
            <Text style={styles.info}>📍 Lon: {location.coords.longitude.toFixed(6)}</Text>
            <Text style={styles.info}>
              Accuracy: ±{location.coords.accuracy?.toFixed(1) || 'N/A'}m
            </Text>
          </View>
        ) : (
          <Text style={styles.info}>Waiting for GPS...</Text>
        )}
      </View>

      {/* Setup Mode Toggle */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.toggleButton, isSetupMode && styles.toggleButtonActive]}
          onPress={() => setIsSetupMode(!isSetupMode)}
        >
          <Text style={[styles.toggleButtonText, isSetupMode && styles.toggleButtonTextActive]}>
            {isSetupMode ? '✓ Setup Mode Active' : 'Start Setup Mode'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mark Buttons */}
      {isSetupMode && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Marks ({marks.length})</Text>
          <View style={styles.markButtonsGrid}>
            {MARK_TYPES.map((markType, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.markButton, { borderColor: markType.color }]}
                onPress={() => addMark(markType)}
              >
                <View style={[styles.markColorDot, { backgroundColor: markType.color }]} />
                <Text style={styles.markButtonText}>{markType.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Marks List */}
      {marks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recorded Marks</Text>
          {marks.map((mark, index) => (
            <View key={index} style={styles.markItem}>
              <View style={styles.markItemHeader}>
                <View style={styles.markItemInfo}>
                  <View style={[styles.markColorDot, { backgroundColor: mark.color }]} />
                  <Text style={styles.markItemName}>
                    {mark.sequence}. {mark.name}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removeMark(index)}>
                  <Text style={styles.removeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.markItemCoords}>
                {mark.lat.toFixed(6)}, {mark.lon.toFixed(6)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Save Button */}
      {marks.length > 0 && (
        <View style={styles.section}>
          <TouchableOpacity style={styles.saveButton} onPress={saveCourse}>
            <Text style={styles.saveButtonText}>💾 Save Course</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Instructions */}
      <View style={[styles.section, styles.instructionsBox]}>
        <Text style={styles.instructionsTitle}>📝 How to Use:</Text>
        <Text style={styles.instructionsText}>1. Enter a course name</Text>
        <Text style={styles.instructionsText}>2. Tap "Start Setup Mode"</Text>
        <Text style={styles.instructionsText}>3. Sail/motor to each mark</Text>
        <Text style={styles.instructionsText}>4. Tap the mark type button when positioned</Text>
        <Text style={styles.instructionsText}>5. Review your marks</Text>
        <Text style={styles.instructionsText}>6. Tap "Save Course"</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  toggleButton: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  toggleButtonActive: {
    backgroundColor: '#2196F3',
  },
  toggleButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  markButtonsGrid: {
    gap: 10,
  },
  markButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: 8,
  },
  markColorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  markButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  markItem: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  markItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  markItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  markItemCoords: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginLeft: 26,
  },
  removeButton: {
    fontSize: 24,
    color: '#F44336',
    fontWeight: 'bold',
    padding: 5,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  instructionsBox: {
    backgroundColor: '#FFF9C4',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});
