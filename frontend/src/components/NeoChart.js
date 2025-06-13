import React, { useState } from 'react';
import { useNearEarthObjects } from '../hooks/useNasaData';
import LoadingSpinner from './LoadingSpinner';
import { DATE_UTILS } from '../utils/constants';
import './NeoChart.css';

const NeoChart = () => {
 const [dateRange, setDateRange] = useState(() => {
   const { start, end } = DATE_UTILS.getDateRange(7);
   return { start, end };
 });

 const { data, loading, error, refetch } = useNearEarthObjects(dateRange.start, dateRange.end);

 const handleDateChange = (field, value) => {
   setDateRange(prev => ({ ...prev, [field]: value }));
 };

 const handleSearch = () => {
   refetch();
 };

 const renderNeoStats = () => {
   if (!data) return null;

   const allNeos = Object.values(data.near_earth_objects).flat();
   const hazardousCount = allNeos.filter(neo => neo.is_potentially_hazardous_asteroid).length;
   const avgDiameter = allNeos.reduce((sum, neo) => {
     const diameter = (neo.estimated_diameter.kilometers.estimated_diameter_min + 
                      neo.estimated_diameter.kilometers.estimated_diameter_max) / 2;
     return sum + diameter;
   }, 0) / allNeos.length;

   const largestNeo = allNeos.reduce((largest, neo) => {
     const diameter = neo.estimated_diameter.kilometers.estimated_diameter_max;
     return diameter > largest.diameter ? { neo, diameter } : largest;
   }, { diameter: 0 });

   return (
     <div className="neo-stats">
       <div className="stat-card">
         <h4>📊 Total Objects</h4>
         <p className="stat-number">{allNeos.length}</p>
       </div>
       <div className="stat-card hazardous">
         <h4>⚠️ Potentially Hazardous</h4>
         <p className="stat-number">{hazardousCount}</p>
       </div>
       <div className="stat-card">
         <h4>📏 Average Diameter</h4>
         <p className="stat-number">{avgDiameter.toFixed(2)} km</p>
       </div>
       <div className="stat-card">
         <h4>🎯 Largest Object</h4>
         <p className="stat-number">{largestNeo.diameter.toFixed(2)} km</p>
         <p className="stat-name">{largestNeo.neo?.name}</p>
       </div>
     </div>
   );
 };

 const renderNeoList = () => {
   if (!data) return null;

   const allNeos = Object.values(data.near_earth_objects).flat();
   
   return (
     <div className="neo-list">
       <h3>🪨 Near Earth Objects</h3>
       <div className="neo-grid">
         {allNeos.slice(0, 12).map((neo) => (
           <div key={neo.id} className={`neo-card ${neo.is_potentially_hazardous_asteroid ? 'hazardous' : ''}`}>
             <h4>{neo.name}</h4>
             <div className="neo-details">
               <p><strong>Diameter:</strong> {neo.estimated_diameter.kilometers.estimated_diameter_min.toFixed(2)} - {neo.estimated_diameter.kilometers.estimated_diameter_max.toFixed(2)} km</p>
               <p><strong>Close Approach:</strong> {neo.close_approach_data[0]?.close_approach_date}</p>
               <p><strong>Miss Distance:</strong> {parseInt(neo.close_approach_data[0]?.miss_distance.kilometers).toLocaleString()} km</p>
               <p><strong>Velocity:</strong> {parseFloat(neo.close_approach_data[0]?.relative_velocity.kilometers_per_hour).toFixed(0)} km/h</p>
               {neo.is_potentially_hazardous_asteroid && (
                 <div className="hazard-badge">⚠️ Potentially Hazardous</div>
               )}
             </div>
           </div>
         ))}
       </div>
     </div>
   );
 };

 if (loading) return <LoadingSpinner message="Loading Near Earth Objects..." />;

 return (
   <div className="neo-chart">
     <div className="neo-controls">
       <div className="date-range">
         <div className="date-input">
           <label htmlFor="start-date">Start Date:</label>
           <input
             id="start-date"
             type="date"
             value={dateRange.start}
             onChange={(e) => handleDateChange('start', e.target.value)}
             max={new Date().toISOString().split('T')[0]}
           />
         </div>
         <div className="date-input">
           <label htmlFor="end-date">End Date:</label>
           <input
             id="end-date"
             type="date"
             value={dateRange.end}
             onChange={(e) => handleDateChange('end', e.target.value)}
             max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
           />
         </div>
       </div>
       <button className="search-btn" onClick={handleSearch}>
         🔍 Search NEOs
       </button>
     </div>

     {error && (
       <div className="error-message">
         <p>Error: {error}</p>
       </div>
     )}

     {data && (
       <>
         {renderNeoStats()}
         {renderNeoList()}
       </>
     )}
   </div>
 );
};

export default NeoChart;
