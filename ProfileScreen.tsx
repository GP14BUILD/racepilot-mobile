import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from './AuthContext';

interface Boat {
  id: number;
  name?: string;
  klass?: string;
  sail_number: string;
  is_default: boolean;
}

const API_URL = 'https://racepilot-backend-production.up.railway.app';

export default function ProfileScreen() {
  const { user, logout, token } = useAuth();
  const [boats, setBoats] = useState<Boat[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingBoat, setAddingBoat] = useState(false);

  // New boat form
  const [newBoatName, setNewBoatName] = useState('');
  const [newBoatClass, setNewBoatClass] = useState('');
  const [newBoatSailNumber, setNewBoatSailNumber] = useState('');

  useEffect(() => {
    loadBoats();
  }, []);

  const loadBoats = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/boats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBoats(data);
      }
    } catch (error) {
      console.error('Failed to load boats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBoat = async () => {
    if (!newBoatSailNumber) {
      Alert.alert('Error', 'Sail number is required');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/boats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newBoatName || null,
          klass: newBoatClass || null,
          sail_number: newBoatSailNumber,
          is_default: boats.length === 0, // First boat is default
        }),
      });

      if (response.ok) {
        setNewBoatName('');
        setNewBoatClass('');
        setNewBoatSailNumber('');
        setAddingBoat(false);
        await loadBoats();
        Alert.alert('Success', 'Boat added successfully');
      } else {
        const error = await response.json();
        Alert.alert('Error', error.detail || 'Failed to add boat');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add boat');
    }
  };

  const handleDeleteBoat = async (boatId: number) => {
    Alert.alert('Delete Boat', 'Are you sure you want to delete this boat?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(`${API_URL}/auth/boats/${boatId}`, {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              await loadBoats();
              Alert.alert('Success', 'Boat deleted');
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to delete boat');
          }
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* User Info Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{user?.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Club:</Text>
            <Text style={styles.value}>{user?.club_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Role:</Text>
            <Text style={styles.value}>{user?.role}</Text>
          </View>
          {user?.sail_number && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Sail Number:</Text>
              <Text style={styles.value}>{user.sail_number}</Text>
            </View>
          )}
        </View>

        {/* Boats Section */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Boats</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setAddingBoat(!addingBoat)}
            >
              <Text style={styles.addButtonText}>
                {addingBoat ? 'Cancel' : '+ Add'}
              </Text>
            </TouchableOpacity>
          </View>

          {addingBoat && (
            <View style={styles.addBoatForm}>
              <TextInput
                style={styles.input}
                value={newBoatName}
                onChangeText={setNewBoatName}
                placeholder="Boat Name (optional)"
              />
              <TextInput
                style={styles.input}
                value={newBoatClass}
                onChangeText={setNewBoatClass}
                placeholder="Boat Class (optional, e.g., Laser, 420)"
              />
              <TextInput
                style={styles.input}
                value={newBoatSailNumber}
                onChangeText={setNewBoatSailNumber}
                placeholder="Sail Number *"
              />
              <TouchableOpacity style={styles.submitButton} onPress={handleAddBoat}>
                <Text style={styles.submitButtonText}>Add Boat</Text>
              </TouchableOpacity>
            </View>
          )}

          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} color="#2196F3" />
          ) : boats.length === 0 ? (
            <Text style={styles.emptyText}>No boats added yet</Text>
          ) : (
            boats.map((boat) => (
              <View key={boat.id} style={styles.boatCard}>
                <View style={styles.boatInfo}>
                  <Text style={styles.boatName}>
                    {boat.name || 'Unnamed Boat'}
                    {boat.is_default && (
                      <Text style={styles.defaultBadge}> (Default)</Text>
                    )}
                  </Text>
                  {boat.klass && (
                    <Text style={styles.boatClass}>{boat.klass}</Text>
                  )}
                  <Text style={styles.boatSailNumber}>
                    Sail: {boat.sail_number}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteBoat(boat.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    width: 100,
  },
  value: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  addBoatForm: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
  boatCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
  },
  boatInfo: {
    flex: 1,
  },
  boatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  defaultBadge: {
    color: '#4CAF50',
    fontSize: 14,
  },
  boatClass: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  boatSailNumber: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    color: '#f44336',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
