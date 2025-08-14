import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import AddPetScreen from '../screens/AddPetScreen';

describe('AddPetScreen', () => {
  const navigation = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('blocks submit when fields are missing', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { getByText } = render(<AddPetScreen navigation={navigation} />);
    fireEvent.press(getByText('Add Pet'));
    expect(alertSpy).toHaveBeenCalledWith('Missing info', expect.any(String));
  });

  it('saves pet and navigates to Home on success', async () => {
    // Permissions granted + image returned
    jest
      .spyOn(ImagePicker, 'requestMediaLibraryPermissionsAsync')
      .mockResolvedValueOnce({ status: 'granted' });

    jest
      .spyOn(ImagePicker, 'launchImageLibraryAsync')
      .mockResolvedValueOnce({
        canceled: false,
        cancelled: false,
        assets: [{ uri: 'test://image.jpg' }],
      });

    // Auto-press "OK" on success Alert
    const alertSpy = jest
      .spyOn(Alert, 'alert')
      .mockImplementation((title, message, buttons) => {
        if (title === 'Success!' && buttons && buttons[0]?.onPress) {
          buttons[0].onPress();
        }
      });

    const { getByPlaceholderText, getByText } = render(
      <AddPetScreen navigation={navigation} />
    );

    fireEvent.changeText(getByPlaceholderText('Name'), 'Buddy');
    fireEvent.changeText(getByPlaceholderText('Age'), '2');
    fireEvent.changeText(getByPlaceholderText('Breed'), 'Beagle');
    fireEvent.changeText(getByPlaceholderText('Description'), 'Very friendly');

    // pick image
    fireEvent.press(getByText('Select Image'));

    // wait for async picker call to resolve & state to update
    await waitFor(() =>
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled()
    );

    // submit
    fireEvent.press(getByText('Add Pet'));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const [key, payload] = AsyncStorage.setItem.mock.calls[0];
      expect(key).toBe('customPets');
      expect(payload).toContain('Buddy');

      expect(alertSpy).toHaveBeenCalledWith(
        'Success!',
        expect.any(String),
        expect.any(Array)
      );
      expect(navigation.navigate).toHaveBeenCalledWith('Home');
    });
  });

  it('shows a permission alert if photo access is denied', async () => {
    jest
      .spyOn(ImagePicker, 'requestMediaLibraryPermissionsAsync')
      .mockResolvedValueOnce({ status: 'denied' });

    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const { getByText } = render(<AddPetScreen navigation={navigation} />);

    fireEvent.press(getByText('Select Image'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        'Permission required',
        expect.any(String)
      );
    });
  });
});
