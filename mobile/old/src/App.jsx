import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import qrImage from './assets/qr.png';
import { FiMic } from 'react-icons/fi'; // Pour le logo micro

function App() {
  const [roomInfo, setRoomInfo] = useState(null);
  const [reportText, setReportText] = useState('');
  const [images, setImages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isCordovaReady, setIsCordovaReady] = useState(false);

  useEffect(() => {
    document.addEventListener('deviceready', () => {
      console.log('Cordova is ready');
      setIsCordovaReady(true);
    });

    return () => {
      document.removeEventListener('deviceready', () => {});
    };
  }, []);

  if (!isCordovaReady) {
    return <div>Loading...</div>;
  }

  const mockScan = () => {
    const mockData = { roomNumber: '12345' }; // Mock QR Code data
    setRoomInfo(mockData);
  };

  const requestCameraPermissions = (onSuccess, onError) => {
    const permissions = window.cordova.plugins.permissions;
    permissions.checkPermission(
      permissions.CAMERA,
      (status) => {
        if (status.hasPermission) {
          onSuccess();
        } else {
          permissions.requestPermission(permissions.CAMERA, onSuccess, onError);
        }
      },
      onError
    );
  };

  const handleOpenCamera = () => {
    requestCameraPermissions(
      () => openCamera(
        (imageURI) => {
          setImages((prev) => [...prev, imageURI]);
          alert('Photo added successfully!');
        },
        (error) => {
          console.error('Camera error:', error);
          alert('Unable to access the camera.');
        }
      ),
      (error) => {
        alert('Camera permission denied.');
      }
    );
  };
  
  const openCamera = (onSuccess, onError) => {
    navigator.camera.getPicture(
      onSuccess,
      onError,
      {
        quality: 50,
        destinationType: navigator.camera.DestinationType.FILE_URI,
        sourceType: navigator.camera.PictureSourceType.CAMERA,
        allowEdit: false,
        encodingType: navigator.camera.EncodingType.JPEG,
        saveToPhotoAlbum: false,
        correctOrientation: true,
      }
    );
  };  

  const handleSpeechToTextStart = () => {
    window.plugins.speechRecognition.requestPermission(
      () => {
        window.plugins.speechRecognition.startListening(
          (matches) => {
            // `matches` est un tableau contenant les transcriptions possibles
            const speechToText = matches[0]; // Prenez la première transcription
            setReportText((prev) => prev + ' ' + speechToText);
          },
          (error) => {
            console.error('Speech recognition error:', error);
            alert('Error with speech recognition.');
          },
          {
            language: 'fr-FR', // Langue de transcription
            showPopup: true,   // Affiche un popup natif pendant l'enregistrement
          }
        );
      },
      (error) => {
        console.error('Permission denied:', error);
        alert('Microphone permission denied.');
      }
    );
  };
  
  const handleSpeechToTextStop = () => {
    window.plugins.speechRecognition.stopListening(
      () => {
        setIsListening(false);
      },
      (error) => {
        console.error('Error stopping speech recognition:', error);
      }
    );
  };

  const handleMockSend = () => {
    const reportData = {
      roomInfo,
      reportText,
      images,
    };
    console.log('Mock Sending Report:', reportData);
    alert('Report sent successfully! \n' + JSON.stringify(reportData, null, 2));
  };

  if (!roomInfo) {
    return (
      <div className="container">
        <h1 className="header">Scan QR Code</h1>
        <img
          src={qrImage}
          alt="Mock QR Code"
          onClick={mockScan}
          style={{ cursor: 'pointer', width: '200px', height: '200px' }}
        />
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="header">Room Information</h1>
      <p>Room Number: {roomInfo.roomNumber}</p>

      <textarea
        className="textInput"
        placeholder="Write your report here..."
        value={reportText}
        onChange={(e) => setReportText(e.target.value)}
      ></textarea>

      <div style={{ userSelect: 'none', touchAction: 'none' }}>
        <button
          onTouchStart={() => {
            setIsListening(true);
            handleSpeechToTextStart();
          }}
          onTouchEnd={() => {
            setIsListening(false);
            handleSpeechToTextStop();
          }}
          style={{
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            padding: '0',
          }}
        >
          <FiMic size={30} color={isListening ? 'red' : 'black'} />
        </button>
      </div>

      <button onClick={handleOpenCamera}>Add Photo</button>

      <div>
        {images.map((image, index) => (
          <img key={index} src={image} alt={`Report ${index}`} className="image" />
        ))}
      </div>

      <button onClick={handleMockSend}>Mock Send Report</button>
    </div>
  );
}


export default App;

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
