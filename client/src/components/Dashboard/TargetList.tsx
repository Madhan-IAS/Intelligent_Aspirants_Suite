import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

interface Target {
  _id: string;
  title: string;
  subject: string;
  completed: boolean;
}

export default function TargetList() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('');
  
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tasks');
      setTargets(res.data);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTarget = async (id: string, currentStatus: boolean) => {
    try {
      // Optimistic update
      setTargets(targets.map(t => t._id === id ? { ...t, completed: !currentStatus } : t));
      await api.put(`/tasks/${id}`, { completed: !currentStatus });
    } catch (error) {
      console.error('Failed to update task', error);
      // Revert on failure
      setTargets(targets.map(t => t._id === id ? { ...t, completed: currentStatus } : t));
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    try {
      const res = await api.post('/tasks', {
        title: newTaskTitle,
        subject: newTaskSubject
      });
      setTargets([res.data, ...targets]);
      setNewTaskTitle('');
      setNewTaskSubject('');
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to add task', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      setTargets(targets.filter(t => t._id !== id));
      await api.delete(`/tasks/${id}`);
    } catch (error) {
      console.error('Failed to delete task', error);
      fetchTasks();
    }
  };

  return (
    <View style={{ backgroundColor: isDark ? '#1f2937' : '#ffffff', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: isDark ? '#374151' : '#e5e7eb', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 20, fontWeight: 'bold' }}>Today's Targets</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: '#60a5fa', fontWeight: '500', marginRight: 16 }}>
            {targets.filter(t => t.completed).length}/{targets.length} Done
          </Text>
          <TouchableOpacity onPress={() => setIsAdding(!isAdding)} style={{ backgroundColor: '#3b82f6', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={isAdding ? "close" : "add"} size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {isAdding && (
        <View style={{ marginBottom: 20, padding: 16, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#f3f4f6', borderRadius: 12 }}>
          <TextInput
            placeholder="Task Title"
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            style={{ backgroundColor: isDark ? '#374151' : 'white', color: isDark ? 'white' : '#111827', padding: 12, borderRadius: 8, marginBottom: 8, outlineStyle: 'none' } as any}
          />
          <TextInput
            placeholder="Subject (Optional)"
            placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
            value={newTaskSubject}
            onChangeText={setNewTaskSubject}
            style={{ backgroundColor: isDark ? '#374151' : 'white', color: isDark ? 'white' : '#111827', padding: 12, borderRadius: 8, marginBottom: 12, outlineStyle: 'none' } as any}
          />
          <TouchableOpacity onPress={addTask} style={{ backgroundColor: '#10b981', padding: 12, borderRadius: 8, alignItems: 'center' }}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Add Task</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginVertical: 20 }} />
      ) : (
        <View style={{ gap: 12 }}>
          {targets.map(target => (
            <View key={target._id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <TouchableOpacity 
                onPress={() => toggleTarget(target._id, target.completed)}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, backgroundColor: target.completed ? (isDark ? 'rgba(31, 41, 55, 0.5)' : '#f9fafb') : (isDark ? '#374151' : '#ffffff'), borderColor: target.completed ? (isDark ? '#374151' : '#e5e7eb') : (isDark ? '#4b5563' : '#d1d5db') }}
              >
                <View style={{ width: 24, height: 24, borderRadius: 4, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 16, backgroundColor: target.completed ? '#22c55e' : (isDark ? '#1f2937' : '#f3f4f6'), borderColor: target.completed ? '#22c55e' : (isDark ? '#6b7280' : '#d1d5db') }}>
                  {target.completed && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: target.completed ? (isDark ? '#9ca3af' : '#6b7280') : (isDark ? '#f3f4f6' : '#111827'), textDecorationLine: target.completed ? 'line-through' : 'none' }}>
                    {target.title}
                  </Text>
                  {target.subject ? (
                    <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: 12, marginTop: 2 }}>{target.subject}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => deleteTask(target._id)} style={{ padding: 12, marginLeft: 8 }}>
                <Ionicons name="trash-outline" size={24} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}
          {targets.length === 0 && (
            <Text style={{ color: isDark ? '#6b7280' : '#9ca3af', textAlign: 'center', marginVertical: 20 }}>No tasks for today. Add one above!</Text>
          )}
        </View>
      )}
    </View>
  );
}
