/**
 * Helper functions for match display
 */

export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

export const getMatchStatus = (game, formatTime) => {
  const isLive = game.status?.type?.state === 'in' || game.status?.type === 'STATUS_IN_PROGRESS';
  const clock = game.competitions?.[0]?.status?.displayClock || game.status?.displayClock || '';
  
  if (game.status?.type?.state === 'post' || game.status?.completed === true) {
    return { label: 'Terminé', className: 'status-completed', time: 'FT', showClock: false };
  } else if (isLive) {
    return { label: `En Live ${clock ? '• ' + clock : ''}`, className: 'status-live', time: 'LIVE', showClock: true };
  } else {
    return { label: 'À venir', className: 'status-upcoming', time: formatTime(game.date), showClock: false };
  }
};
