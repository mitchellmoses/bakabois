'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import Image from 'next/image';
import img_3690 from '@/assets/image/IMG_3690.jpg';

export default function ClassicsPage() {
  const [userMemes, setUserMemes] = useState([]);

  useEffect(() => {
    // Load user memes from local storage on component mount
    const storedMemes = JSON.parse(localStorage.getItem('classicsUserMemes') || '[]');
    setUserMemes(storedMemes);
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newMeme = { id: Date.now(), src: reader.result };
        const updatedMemes = [...userMemes, newMeme];
        setUserMemes(updatedMemes);
        localStorage.setItem('classicsUserMemes', JSON.stringify(updatedMemes));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={styles.classicsContainer}>
      <h1 className={styles.classicsTitle}>Fantasy Football Classic Moments</h1>
      
      <div className={styles.userMemesSection}>
        <h2>User Submitted Memes</h2>
        <input type="file" accept="image/*" onChange={handleFileUpload} />
        <div className={styles.userMemesGrid}>
          {userMemes.map((meme) => (
            <Image key={meme.id} src={meme.src} alt="User submitted meme" className={styles.userMeme} width={200} height={200} />
          ))}
        </div>
      </div>

      <div className={styles.classicsImageContainer}>
        <Image src={img_3690} alt="Fantasy Football Classic Moment" className={styles.classicsImage} />
      </div>
      <p className={styles.classicsDescription}>Relive the greatest moments in our fantasy football history!</p>
    </div>
  );
}