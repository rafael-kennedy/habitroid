import React from 'react';
import './CardText.css';

interface Props {
    text: string;
}

// CCG Keywords to highlight and their corresponding CSS class themes
const KEYWORDS: Record<string, string> = {
    'Electric': 'keyword-electric',
    'Thermal': 'keyword-thermal',
    'Kinetic': 'keyword-kinetic',
    'Void': 'keyword-void',
    'AoE': 'keyword-mechanic',
    'Stun': 'keyword-mechanic',
    'Chain': 'keyword-mechanic',
    'Pierce': 'keyword-mechanic',
    'Aura': 'keyword-mechanic',
    'Synergy': 'keyword-synergy',
    'Synergy (Purist)': 'keyword-synergy',
    'Passive': 'keyword-passive',
    'Homing': 'keyword-mechanic'
};

export default function CardText({ text }: Props) {
    if (!text || typeof text !== 'string') return null;

    // Build a regex to match any of the keywords
    const keywordRegex = new RegExp(`\\b(${Object.keys(KEYWORDS).join('|')})\\b`, 'gi');

    // Split the text by keywords, capturing the matches
    const parts = text.split(keywordRegex);

    return (
        <span className="card-text">
            {parts.map((part, index) => {
                if (!part) return null;
                // Check if this part is a keyword (case-insensitive match)
                const matchedKeyword = Object.keys(KEYWORDS).find(
                    k => k.toLowerCase() === part.toLowerCase()
                );

                if (matchedKeyword) {
                    return (
                        <span key={index} className={`keyword ${KEYWORDS[matchedKeyword]}`} title={`${matchedKeyword} Mechanic`}>
                            {part}
                        </span>
                    );
                }

                // Normal text, also parse for bold markdown **text**
                const boldParts = part.split(/(\*\*.*?\*\*)/g);
                return (
                    <React.Fragment key={index}>
                        {boldParts.map((bp, i) => {
                            if (bp.startsWith('**') && bp.endsWith('**')) {
                                return <strong key={i}>{bp.slice(2, -2)}</strong>;
                            }
                            return <span key={i}>{bp}</span>;
                        })}
                    </React.Fragment>
                );
            })}
        </span>
    );
}
