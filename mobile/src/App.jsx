import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import qrImage from './assets/qr.png';

export default App;

function App() {
  const [roomInfo, setRoomInfo] = useState(null);
  const [reportText, setReportText] = useState('');
  const [images, setImages] = useState([]);
  const [isListening, setIsListening] = useState(false);

  const mockScan = () => {
    const mockData = { roomNumber: '123' }; // Mock QR Code data
    setRoomInfo(mockData);
  };

  const pickImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImages([...images, reader.result]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSpeechToText = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition API is not supported in your browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;
    recognition.continuous = false;

    if (!isListening) {
      recognition.start();
      setIsListening(true);

      recognition.onresult = (event) => {
        const speechToText = event.results[0][0].transcript;
        setReportText((prev) => prev + ' ' + speechToText);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleMockSend = () => {
    const reportData = {
      roomInfo,
      reportText,
      images,
    };
    console.log('Mock Sending Report:', reportData);
    alert('Report sent successfully!');
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
      <button onClick={handleSpeechToText}>
        {isListening ? 'Stop Listening' : 'Start Speech-to-Text'}
      </button>

      <label htmlFor="imageUpload">
        <button>Add Image</button>
        <input
          id="imageUpload"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={pickImage}
        />
      </label>

      <div>
        {images.map((image, index) => (
          <img key={index} src={image} alt={`Report ${index}`} className="image" />
        ))}
      </div>

      <button onClick={handleMockSend}>Mock Send Report</button>
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
