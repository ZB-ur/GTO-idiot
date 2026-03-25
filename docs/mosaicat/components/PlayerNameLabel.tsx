import React from 'react';

export interface PlayerNameLabelProps {
  /** Player display name */
  name: string;
  /** Whether this seat belongs to the human player */
  isUser?: boolean;
}

/**
 * PlayerNameLabel — Atomic text label showing a player's name at a table seat.
 * Highlights the human player with a distinct style (blue/bold) vs BOT players (muted).
 * Covers: F-010 (game table player display)
 */
export const PlayerNameLabel: React.FC<PlayerNameLabelProps> = ({
  name,
  isUser = false,
}) => {
  return (
    <span
      className={`
        text-sm font-semibold leading-tight truncate max-w-[7rem] inline-block text-center
        ${isUser ? 'text-blue-600' : 'text-gray-400'}
      `}
      title={name}
    >
      {name}
    </span>
  );
};

export default PlayerNameLabel;