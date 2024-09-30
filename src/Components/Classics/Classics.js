import React, { useState, useEffect } from 'react';
import './Classics.css';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, query, orderBy, limit, increment, deleteDoc } from "firebase/firestore";
import Cookies from 'js-cookie';

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
  const [topMemes, setTopMemes] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Generate or retrieve user ID
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = 'user_' + Date.now();
      localStorage.setItem('userId', newUserId);
      setUserId(newUserId);
    }

    fetchMemes();
    fetchTopMemes();
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

  const fetchTopMemes = async () => {
    const q = query(collection(db, "memes"), orderBy("votes", "desc"), limit(5));
    const querySnapshot = await getDocs(q);
    const memes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTopMemes(memes);
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
          createdAt: new Date().toISOString(),
          votes: 0,
          uploadedBy: userId  // Add the user ID to the meme data
        };
        const docRef = await addDoc(collection(db, "memes"), newMeme);
        
        // Update local state
        setUserMemes(prevMemes => [...prevMemes, { id: docRef.id, ...newMeme }]);
      } catch (error) {
        console.error("Error uploading meme:", error);
        alert("Failed to upload meme. Please try again.");
      }
    }
  };

  const voteMeme = async (memeId, isUpvote) => {
    const voteKey = `vote_${memeId}`;
    const existingVote = Cookies.get(voteKey);

    if (existingVote) {
      alert("You've already voted on this meme!");
      return;
    }

    try {
      const memeRef = doc(db, "memes", memeId);
      await updateDoc(memeRef, {
        votes: increment(isUpvote ? 1 : -1)
      });

      // Update local state
      setUserMemes(prevMemes => 
        prevMemes.map(meme => 
          meme.id === memeId 
            ? { ...meme, votes: (meme.votes || 0) + (isUpvote ? 1 : -1) } 
            : meme
        )
      );

      // Set cookie to record the vote
      Cookies.set(voteKey, isUpvote ? 'up' : 'down', { expires: 365 });  // Cookie expires in 1 year

      // Refresh top memes
      fetchTopMemes();
    } catch (error) {
      console.error("Error voting on meme:", error);
      alert("Failed to vote. Please try again.");
    }
  };

  const hasVoted = (memeId) => {
    return Cookies.get(`vote_${memeId}`) !== undefined;
  };

  const openFullscreen = (imageSrc) => {
    setSelectedImage(imageSrc);
  };

  const closeFullscreen = () => {
    setSelectedImage(null);
  };

  const deleteMeme = async (memeId, memeUrl, uploadedBy) => {
    if (uploadedBy !== userId) {
      alert("You can only delete memes that you've uploaded.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this meme?")) {
      try {
        // Delete from Firestore
        await deleteDoc(doc(db, "memes", memeId));

        // Delete from Storage
        const storageRef = ref(storage, memeUrl);
        await deleteObject(storageRef);

        // Update local state
        setUserMemes(prevMemes => prevMemes.filter(meme => meme.id !== memeId));
        
        // Refresh top memes
        fetchTopMemes();

        alert("Meme deleted successfully!");
      } catch (error) {
        console.error("Error deleting meme:", error);
        alert("Failed to delete meme. Please try again.");
      }
    }
  };

  return (
    <div className="classics-container">
      <h1 className="classics-title">Fantasy Football Classic Moments</h1>
      
      <div className="user-memes-section">
        <h2 className="section-title">User Submitted Memes</h2>
        <input type="file" accept="image/*" onChange={handleFileUpload} className="file-input" />
        <div className="user-memes-grid">
          {userMemes.map((meme) => (
            <div key={meme.id} className="meme-container">
              <img src={meme.src} alt="User Meme" className="user-meme" onClick={() => openFullscreen(meme.src)} />
              <div className="meme-actions">
                <div className="vote-container">
                  <button 
                    onClick={() => voteMeme(meme.id, true)} 
                    disabled={hasVoted(meme.id)}
                    className={hasVoted(meme.id) ? 'voted' : ''}
                  >
                    👍
                  </button>
                  <span>{meme.votes || 0}</span>
                  <button 
                    onClick={() => voteMeme(meme.id, false)} 
                    disabled={hasVoted(meme.id)}
                    className={hasVoted(meme.id) ? 'voted' : ''}
                  >
                    👎
                  </button>
                </div>
                {meme.uploadedBy === userId && (
                  <button className="delete-button" onClick={() => deleteMeme(meme.id, meme.src, meme.uploadedBy)}>🗑️</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="classics-description glowing-text">Relive the greatest moments in our fantasy football history!</p>

      <div className="leaderboard">
        <h2>Top Memes</h2>
        {topMemes.map((meme, index) => (
          <div key={meme.id} className="leaderboard-item">
            <span className="rank">{index + 1}</span>
            <img src={meme.src} alt={`Top meme ${index + 1}`} className="leaderboard-meme" />
            <span className="votes">{meme.votes} votes</span>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="fullscreen-modal" onClick={closeFullscreen}>
          <img src={selectedImage} alt="Fullscreen view" className="fullscreen-image" />
        </div>
      )}
    </div>
  );
}

export default Classics;