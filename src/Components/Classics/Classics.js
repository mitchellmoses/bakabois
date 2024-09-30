import React, { useState, useEffect } from 'react';
import './Classics.css';
import img_3690 from "../../assets/image/IMG_3690.jpg";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBK_BE6ex2JwWe-pH6nVmEGvHeXFNZg9R0",
  authDomain: "bakabois2.firebaseapp.com",
  projectId: "bakabois2",
  storageBucket: "bakabois2.appspot.com",
  messagingSenderId: "614629655861",
  appId: "1:614629655861:web:658deccc39accf2574387c",
  measurementId: "G-85MZDF5GN1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);
const db = getFirestore(app);

function Classics() {
  const [userMemes, setUserMemes] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    // Load user memes from Firestore on component mount
    fetchMemes();
  }, []);

  const fetchMemes = async () => {
    try {
      const memesCollection = collection(db, "memes");
      const memeSnapshot = await getDocs(memesCollection);
      const memeList = memeSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserMemes(memeList);
    } catch (error) {
      console.error("Error fetching memes:", error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // Upload file to Firebase Storage
        const storageRef = ref(storage, `memes/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        // Add meme metadata to Firestore
        const newMeme = { 
          src: downloadURL,
          createdAt: new Date().toISOString()
        };
        const docRef = await addDoc(collection(db, "memes"), newMeme);
        
        // Update local state
        setUserMemes(prevMemes => [...prevMemes, { id: docRef.id, ...newMeme }]);
      } catch (error) {
        console.error("Error uploading meme:", error);
      }
    }
  };

  const openFullscreen = (imageSrc) => {
    setSelectedImage(imageSrc);
  };

  const closeFullscreen = () => {
    setSelectedImage(null);
  };

  return (
    <div className="classics-container">
      <h1 className="classics-title">Fantasy Football Classic Moments</h1>
      
      <div className="user-memes-section">
        <h2 className="section-title">User Submitted Memes</h2>
        <input type="file" accept="image/*" onChange={handleFileUpload} className="file-input" />
        <div className="user-memes-grid">
          {userMemes.map((meme) => (
            <img 
              key={meme.id} 
              src={meme.src} 
              alt="User submitted meme" 
              className="user-meme animated-meme" 
              onClick={() => openFullscreen(meme.src)}
            />
          ))}
        </div>
      </div>

      <div className="classics-image-container">
        <img 
          src={img_3690} 
          alt="Fantasy Football Classic Moment" 
          className="classics-image pulsating-image" 
          onClick={() => openFullscreen(img_3690)}
        />
      </div>
      <p className="classics-description glowing-text">Relive the greatest moments in our fantasy football history!</p>

      {selectedImage && (
        <div className="fullscreen-modal" onClick={closeFullscreen}>
          <img src={selectedImage} alt="Fullscreen view" className="fullscreen-image" />
        </div>
      )}
    </div>
  );
}

export default Classics;