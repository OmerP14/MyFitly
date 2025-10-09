import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import { spacing } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';

export default function WorkoutScreen({ route, navigation }) {
  const { colors } = useTheme();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [completedExercises, setCompletedExercises] = useState([]);

  // Program ekranından gelen egzersizler (props olarak gelecek)
  const getTodayExercises = () => {
    // Gerçek uygulamada props olarak gelecek
    return [];
  };

  const getWorkoutName = () => {
    return 'Bugünkü Antrenman';
  };

  const todayExercises = getTodayExercises();
  const workoutData = {
    name: getWorkoutName(),
    exercises: todayExercises,
    estimatedCalories: 0,
    estimatedDuration: 0
  };

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleExercise = (exerciseId) => {
    if (completedExercises.includes(exerciseId)) {
      setCompletedExercises(completedExercises.filter(id => id !== exerciseId));
    } else {
      setCompletedExercises([...completedExercises, exerciseId]);
    }
  };

  const calculateCalories = () => {
    const progress = completedExercises.length / workoutData.exercises.length;
    return Math.round(workoutData.estimatedCalories * progress);
  };

  const finishWorkout = () => {
    setIsRunning(false);
    // Burada antrenman verilerini kaydet
    navigation.goBack();
  };

  return (
    <LinearGradient colors={[colors.background, colors.backgroundAlt]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        {/* Header */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border
        }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
            {workoutData.name}
          </Text>
          <TouchableOpacity onPress={() => setIsRunning(!isRunning)}>
            <Ionicons name={isRunning ? "pause" : "play"} size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 32 }}>
          {/* Stats Card */}
          <Card style={{ marginBottom: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: spacing.sm }}>
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="time" size={32} color={colors.primary} />
                <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 8 }}>
                  {formatTime(elapsedTime)}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>Süre</Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.border }} />
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="flame" size={32} color="#FF4757" />
                <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 8 }}>
                  {calculateCalories()}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>Kalori</Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.border }} />
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="checkmark-circle" size={32} color="#00D084" />
                <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 8 }}>
                  {completedExercises.length}/{workoutData.exercises.length}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>Egzersiz</Text>
              </View>
            </View>
          </Card>

          {/* Progress Bar */}
          <Card style={{ marginBottom: spacing.md }}>
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
              Antrenman İlerlemesi
            </Text>
            <View style={{ 
              height: 12, 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              borderRadius: 6,
              overflow: 'hidden'
            }}>
              <View style={{
                height: '100%',
                width: `${(completedExercises.length / workoutData.exercises.length) * 100}%`,
                backgroundColor: colors.primary
              }} />
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>
              %{Math.round((completedExercises.length / workoutData.exercises.length) * 100)} tamamlandı
            </Text>
          </Card>

          {/* Exercises List */}
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: spacing.sm }}>
            Egzersizler
          </Text>
          {workoutData.exercises.map((exercise, index) => {
            const isCompleted = completedExercises.includes(exercise.id);
            return (
              <Card key={exercise.id} style={{ marginBottom: spacing.sm, opacity: isCompleted ? 0.6 : 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: isCompleted ? '#00D084' : colors.primary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: spacing.md
                  }}>
                    <Text style={{ color: colors.background, fontSize: 16, fontWeight: '800' }}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginRight: 8 }}>
                        {exercise.name}
                      </Text>
                      {isCompleted && (
                        <Ionicons name="checkmark-circle" size={18} color="#00D084" />
                      )}
                    </View>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                      {exercise.sets} set × {exercise.reps} tekrar • {exercise.weight}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleExercise(exercise.id)}
                    style={{
                      backgroundColor: isCompleted ? '#00D084' : colors.primary,
                      borderRadius: 20,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      elevation: 2,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 2
                    }}
                  >
                    <Text style={{ color: colors.background, fontSize: 12, fontWeight: '800' }}>
                      {isCompleted ? '✅' : '🚀'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })}

          {/* Finish Button */}
          <TouchableOpacity
            onPress={finishWorkout}
            style={{
              backgroundColor: '#00D084',
              borderRadius: 16,
              padding: 16,
              alignItems: 'center',
              marginTop: spacing.md,
              elevation: 3,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3
            }}
          >
            <Text style={{ color: colors.background, fontSize: 16, fontWeight: '800' }}>
              🎉 Antrenmanı Bitir
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
