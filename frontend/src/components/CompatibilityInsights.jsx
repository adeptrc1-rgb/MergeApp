import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';
const API = `${API_BASE}/api`;

axios.defaults.withCredentials = true;

export default function CompatibilityInsights({ 
  currentUser, 
  otherUser, 
  context = "profile_view",
  depth = "standard" 
}) {
  const [insights, setInsights] = useState([]);
  const [summary, setSummary] = useState('');

  useEffect(() => {
    if (currentUser && otherUser) {
      calculateLocalInsights();
    }
  }, [currentUser, otherUser]);

  const calculateLocalInsights = () => {
    const calculatedInsights = [];
    
    // 1. Shared Interests Analysis
    const currentInterests = currentUser.interests || [];
    const otherInterests = otherUser.interests || [];
    const sharedInterests = currentInterests.filter(i => 
      otherInterests.some(oi => oi.toLowerCase() === i.toLowerCase())
    );
    
    if (sharedInterests.length > 0) {
      calculatedInsights.push({
        icon: '🎯',
        title: 'Shared Interests',
        description: `You both enjoy ${sharedInterests.slice(0, 3).join(', ')}${sharedInterests.length > 3 ? ' and more' : ''}. Great conversation starters!`
      });
    }
    
    // 2. Lifestyle Compatibility
    const userLifestyle = currentUser.lifestyle_factors || {};
    const otherLifestyle = otherUser.lifestyle_factors || {};
    
    const fitnessMatch = userLifestyle.fitness_health && otherLifestyle.fitness_health ? 
      Math.abs(userLifestyle.fitness_health - otherLifestyle.fitness_health) <= 2 : false;
    const socialMatch = userLifestyle.social_energy && otherLifestyle.social_energy ?
      Math.abs(userLifestyle.social_energy - otherLifestyle.social_energy) <= 2 : false;
    
    if (fitnessMatch || socialMatch) {
      const matches = [];
      if (fitnessMatch) matches.push('fitness levels');
      if (socialMatch) matches.push('social energy');
      
      calculatedInsights.push({
        icon: '⚡',
        title: 'Lifestyle Alignment',
        description: `Your ${matches.join(' and ')} are well-aligned, making it easy to enjoy activities together.`
      });
    }
    
    // 3. Adventure Compatibility
    const travelDiff = userLifestyle.travel_adventure && otherLifestyle.travel_adventure ?
      Math.abs(userLifestyle.travel_adventure - otherLifestyle.travel_adventure) : 5;
    
    if (travelDiff <= 1) {
      calculatedInsights.push({
        icon: '✈️',
        title: 'Adventure Seekers',
        description: 'You share similar appetites for exploration and new experiences.'
      });
    }
    
    // 4. Career/Industry Alignment
    if (currentUser.industry && otherUser.industry) {
      if (currentUser.industry === otherUser.industry) {
        calculatedInsights.push({
          icon: '💼',
          title: 'Career Connection',
          description: `You're both in ${currentUser.industry}, which means shared understanding of professional challenges and wins.`
        });
      }
    }
    
    // 5. Relationship Goals
    const currentGoals = currentUser.deal_breakers?.relationship_goals;
    const otherGoals = otherUser.deal_breakers?.relationship_goals;
    
    if (currentGoals && otherGoals) {
      const seriousGoals = ['long_term_relationship', 'serious_dating', 'long_term_partner'];
      const casualGoals = ['casual_dating', 'friends_first'];
      
      const bothSerious = seriousGoals.includes(currentGoals) && seriousGoals.includes(otherGoals);
      const bothCasual = casualGoals.includes(currentGoals) && casualGoals.includes(otherGoals);
      
      if (bothSerious || bothCasual) {
        calculatedInsights.push({
          icon: '💫',
          title: 'Aligned Intentions',
          description: 'You\'re looking for similar connection types, which helps set clear expectations.'
        });
      }
    }
    
    // Generate summary
    let summaryText = '';
    if (calculatedInsights.length >= 4) {
      summaryText = 'Highly compatible across multiple dimensions';
    } else if (calculatedInsights.length >= 2) {
      summaryText = 'Promising compatibility with strong alignment in key areas';
    } else if (calculatedInsights.length === 1) {
      summaryText = 'Some compatibility - explore to learn more';
    } else {
      summaryText = 'Different profiles can lead to interesting conversations';
    }
    
    setInsights(calculatedInsights);
    setSummary(summaryText);
  };

  if (loading && insights.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-white/60 text-xs uppercase tracking-wider font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3 animate-pulse" />
          Why You Might Connect
        </h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg p-3 animate-pulse"
              style={{ backgroundColor: '#171717', border: '1px solid #404040' }}
            >
              <div className="h-4 bg-white/10 rounded mb-2 w-3/4"></div>
              <div className="h-3 bg-white/10 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || insights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-white/60 text-xs uppercase tracking-wider font-medium flex items-center gap-1">
        <Sparkles className="w-3 h-3" style={{ color: '#3B82F6' }} />
        Why You Might Connect
      </h3>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="rounded-lg p-3 transition-all hover:scale-[1.01]"
            style={{ 
              backgroundColor: '#0A0A0A', 
              border: '1px solid #262626',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0 mt-0.5">{insight.icon}</span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold mb-1.5 tracking-wide" style={{ color: '#FAFAFA', lineHeight: '1.4' }}>
                  {insight.title}
                </h4>
                <p className="text-xs leading-relaxed tracking-wide" style={{ color: '#A3A3A3', lineHeight: '1.6' }}>
                  {insight.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {summary && (
        <p className="text-xs text-center pt-1" style={{ color: '#525252' }}>
          {summary}
        </p>
      )}
    </div>
  );
}
