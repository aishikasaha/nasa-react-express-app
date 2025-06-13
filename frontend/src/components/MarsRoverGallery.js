import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMarsPhotos } from '../hooks/useNasaData';
import LoadingAnimation from './LoadingAnimation';
import InteractiveButton from './InteractiveButton';
import { ROVERS } from '../utils/constants';
import soundManager from '../utils/soundManager';
import './MarsRoverGallery.css';

const MarsRoverGallery = () => {
  const [rover, setRover] = useState('curiosity');
  const [sol, setSol] = useState(1000);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const { data: photos, loading, error, refetch } = useMarsPhotos(rover, sol);

  const handleSearch = () => {
    refetch(rover, sol);
    soundManager.play('whoosh');
  };

  const openModal = (photo) => {
    setSelectedPhoto(photo);
    soundManager.play('click');
  };

  const closeModal = () => {
    setSelectedPhoto(null);
    soundManager.play('click');
  };

  if (loading) return <LoadingAnimation type="rocket" message="Launching to Mars..." />;

  return (
    <motion.div
      className="mars-gallery"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="mars-controls"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.div 
          className="control-group"
          whileHover={{ scale: 1.02 }}
        >
          <label htmlFor="rover-select">Rover:</label>
          <motion.select
            id="rover-select"
            value={rover}
            onChange={(e) => {
              setRover(e.target.value);
              soundManager.play('click');
            }}
            whileFocus={{ boxShadow: '0 0 20px rgba(255, 107, 107, 0.4)' }}
          >
            {ROVERS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </motion.select>
        </motion.div>

        <motion.div 
          className="control-group"
          whileHover={{ scale: 1.02 }}
        >
          <label htmlFor="sol-input">Sol (Martian Day):</label>
          <motion.input
            id="sol-input"
            type="number"
            value={sol}
            onChange={(e) => {
              setSol(Number(e.target.value));
              soundManager.play('hover');
            }}
            min="1"
            max="3000"
            whileFocus={{ boxShadow: '0 0 20px rgba(255, 107, 107, 0.4)' }}
          />
        </motion.div>

        <InteractiveButton
          onClick={handleSearch}
          variant="secondary"
          icon="🔍"
        >
          Search Photos
        </InteractiveButton>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <p>Error: {error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {photos.length === 0 && !loading && !error && (
          <motion.div
            className="no-photos"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <p>🤖 No photos found for Sol {sol} from {rover.charAt(0).toUpperCase() + rover.slice(1)} rover.</p>
            <p>Try a different Sol number or rover.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="photos-info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3>📸 {photos.length} photos from {rover.charAt(0).toUpperCase() + rover.slice(1)} rover on Sol {sol}</h3>
            </motion.div>

            <motion.div 
              className="photos-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {photos.slice(0, 20).map((photo, index) => (
                <motion.div
                  key={photo.id}
                  className="photo-card"
                  onClick={() => openModal(photo)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    delay: index * 0.05,
                    duration: 0.4
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    rotateY: 5,
                    boxShadow: '0 10px 30px rgba(255, 107, 107, 0.3)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  layout
                >
                  <motion.img
                    src={photo.img_src}
                    alt={`Mars photo ${photo.id}`}
                    loading="lazy"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <motion.div 
                    className="photo-overlay"
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p>{photo.camera.full_name}</p>
                    <p>{photo.earth_date}</p>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            className="photo-modal"
            onClick={closeModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
              
animate={{ scale: 1, opacity: 1, rotateY: 0 }}
             exit={{ scale: 0.8, opacity: 0, rotateY: 90 }}
             transition={{ type: "spring", damping: 25, stiffness: 300 }}
           >
             <InteractiveButton
               className="close-btn"
               onClick={closeModal}
               variant="secondary"
               icon="✕"
             >
             </InteractiveButton>
             
             <motion.img
               src={selectedPhoto.img_src}
               alt={`Mars photo ${selectedPhoto.id}`}
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ delay: 0.2 }}
             />
             
             <motion.div
               className="photo-details"
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.4 }}
             >
               <h4>📡 Photo Details</h4>
               <p><strong>Camera:</strong> {selectedPhoto.camera.full_name}</p>
               <p><strong>Earth Date:</strong> {selectedPhoto.earth_date}</p>
               <p><strong>Sol:</strong> {selectedPhoto.sol}</p>
               <p><strong>Rover:</strong> {selectedPhoto.rover.name}</p>
               <p><strong>Status:</strong> {selectedPhoto.rover.status}</p>
             </motion.div>
           </motion.div>
         </motion.div>
       )}
     </AnimatePresence>
   </motion.div>
 );
};

export default MarsRoverGallery;
