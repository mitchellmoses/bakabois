import React, { useState, useEffect } from 'react';
import { fetchHeadlines } from '../../services/headlineService';
import './Headlines.css';
import { FaNewspaper } from 'react-icons/fa';

const ESPN_API = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/news?limit=3';

const Headlines = () => {
  const [groupChatHeadlines, setGroupChatHeadlines] = useState([]);
  const [espnHeadlines, setEspnHeadlines] = useState([]);

  useEffect(() => {
    const loadHeadlines = async () => {
      // Fetch group chat headlines
      const response = await fetchHeadlines();
      const latestHeadlines = response[0]?.headlines || [];
      setGroupChatHeadlines(latestHeadlines);

      // Fetch ESPN headlines
      try {
        const espnResponse = await fetch(ESPN_API);
        const espnData = await espnResponse.json();
        const formattedEspnHeadlines = espnData.articles.slice(0, 3).map(article => ({
          text: article.headline,
          description: article.description,
          generated_at: article.published,
          link: article.links.web.href
        }));
        setEspnHeadlines(formattedEspnHeadlines);
      } catch (error) {
        console.error('Error fetching ESPN headlines:', error);
      }
    };

    loadHeadlines();
    const headlineInterval = setInterval(loadHeadlines, 300000); // Refresh every 5 minutes
    return () => clearInterval(headlineInterval);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const cleanHeadlineText = (text) => {
    return text
      .replace(/["""]/g, '')  // Remove quotes
      .replace(/^\d+\.\s*/, '');  // Remove leading numbers and dots
  };

  if (groupChatHeadlines.length === 0 && espnHeadlines.length === 0) {
    return (
      <div className="headlines-section">
        <div className="headlines-header">
          <FaNewspaper className="news-icon" />
          <h3>Latest Fantasy News</h3>
        </div>
        <div className="headlines-list">
          <div className="headline-item">Loading headlines...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="headlines-section">
      <div className="headlines-header">
        <FaNewspaper className="news-icon" />
        <h3>Latest Fantasy News</h3>
      </div>
      
      {/* Group Chat Headlines */}
      <div className="headlines-list">
        <h4 className="headlines-subheader">League Headlines</h4>
        {groupChatHeadlines.map((headline, index) => (
          <div key={`group-${index}`} className="headline-item">
            <div className="headline-content">
              <span className="headline-bullet">•</span>
              <span className="headline-text">{cleanHeadlineText(headline.text)}</span>
            </div>
            <span className="headline-date">
              {formatDate(headline.generated_at)}
            </span>
          </div>
        ))}
      </div>
      
      {/* ESPN Headlines */}
      <div className="headlines-list espn">
        <h4 className="headlines-subheader">ESPN NFL News</h4>
        {espnHeadlines.map((headline, index) => (
          <a 
            href={headline.link}
            target="_blank"
            rel="noopener noreferrer"
            key={`espn-${index}`}
            className="headline-item"
          >
            <div className="headline-content">
              <span className="headline-bullet">•</span>
              <span className="headline-text">{cleanHeadlineText(headline.text)}</span>
            </div>
            <span className="headline-date">
              {formatDate(headline.generated_at)}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Headlines; 