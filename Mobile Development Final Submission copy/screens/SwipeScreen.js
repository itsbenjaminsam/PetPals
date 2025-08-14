import React, { useState, useContext } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import pets from '../data/pets';
import * as Haptics from 'expo-haptics';
import { ThemeContext } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function SwipeScreen() {
  const [index, setIndex] = useState(0);
  const { colors, isDarkMode } = useContext(ThemeContext);
  const swiperRef = React.useRef(null);

  const handleSwiped = () => {
    if (index + 1 >= pets.length) {
      setIndex(0);
    } else {
      setIndex(index + 1);
    }
  };

  const handleLike = () => {
    swiperRef.current.swipeRight();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDislike = () => {
    swiperRef.current.swipeLeft();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const renderCard = (pet) => (
    <View style={[styles.card, {
      backgroundColor: colors.card,
      borderColor: isDarkMode ? '#555' : '#ddd'
    }]}>
      <Image source={pet.image} style={styles.image} />
      <View style={styles.gradientOverlay} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: 'white' }]}>{pet.name}, {pet.age}</Text>
        <Text style={[styles.details, { color: 'white' }]}>{pet.breed}</Text>
        <Text style={[styles.description, { color: 'white' }]}>{pet.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.swiperContainer}>
        <Swiper
          ref={swiperRef}
          cards={pets}
          renderCard={renderCard}
          cardIndex={index}
          onSwiped={handleSwiped}
          onSwipedLeft={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}
          onSwipedRight={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
          stackSize={3}
          verticalSwipe={false}
          backgroundColor="transparent"
          overlayLabels={{
            left: {
              title: 'NOPE',
              style: {
                label: {
                  backgroundColor: '#FF5864',
                  color: 'white',
                  fontSize: 24,
                  padding: 10,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: 'white',
                  overflow: 'hidden'
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: -30,
                },
              },
            },
            right: {
              title: 'LIKE',
              style: {
                label: {
                  backgroundColor: '#4CCC93',
                  color: 'white',
                  fontSize: 24,
                  padding: 10,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: 'white',
                  overflow: 'hidden'
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: 30,
                },
              },
            },
          }}
          overlayOpacityHorizontalThreshold={5}
          animateOverlayLabelsOpacity
          animateCardOpacity
          swipeAnimationDuration={350}
        />
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleDislike}>
          <View style={[styles.buttonCircle, { backgroundColor: '#FF5864' }]}>
            <Ionicons name="close" size={32} color="white" />
          </View>
          <Text style={styles.buttonText}>Dislike</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleLike}>
          <View style={[styles.buttonCircle, { backgroundColor: '#4CCC93' }]}>
            <Ionicons name="heart" size={32} color="white" />
          </View>
          <Text style={styles.buttonText}>Like</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  swiperContainer: {
    flex: 1,
    marginBottom: 20,
  },
  card: {
    flex: 0.8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  info: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  details: {
    fontSize: 20,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  description: {
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    paddingBottom: 40,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },
  buttonCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
});