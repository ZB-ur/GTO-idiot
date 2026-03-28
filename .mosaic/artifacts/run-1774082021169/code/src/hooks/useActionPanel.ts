import { useState, useCallback, useMemo } from 'react';
import { useGame } from '../contexts/GameContext';
import type { AvailableAction } from '../types/game';

export function useActionPanel() {
  const { state, performAction } = useGame();
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);
  const [showAllInConfirm, setShowAllInConfirm] = useState(false);

  const { availableActions, hand, isLoading } = state;
  const isUserTurn = hand?.isUserTurn ?? false;
  const pot = availableActions?.currentPot ?? hand?.pot ?? 0;
  const userStack = availableActions?.userStack ?? 0;

  const raiseAction: AvailableAction | undefined = useMemo(
    () => availableActions?.actions.find(a => a.type === 'raise'),
    [availableActions],
  );

  const handleFold = useCallback(() => { performAction({ action: 'fold' }); }, [performAction]);
  const handleCheck = useCallback(() => { performAction({ action: 'check' }); }, [performAction]);
  const handleCall = useCallback(() => { performAction({ action: 'call' }); }, [performAction]);

  const handleRaiseClick = useCallback(() => { setShowRaiseSlider(true); }, []);
  const handleRaiseConfirm = useCallback((amount: number) => {
    setShowRaiseSlider(false);
    performAction({ action: 'raise', amount });
  }, [performAction]);
  const handleRaiseCancel = useCallback(() => { setShowRaiseSlider(false); }, []);

  const handleAllInClick = useCallback(() => { setShowAllInConfirm(true); }, []);
  const handleAllInConfirm = useCallback(() => {
    setShowAllInConfirm(false);
    performAction({ action: 'all_in' });
  }, [performAction]);
  const handleAllInCancel = useCallback(() => { setShowAllInConfirm(false); }, []);

  return {
    availableActions,
    isUserTurn,
    isLoading,
    showRaiseSlider,
    showAllInConfirm,
    raiseAction,
    pot,
    userStack,
    handleFold,
    handleCheck,
    handleCall,
    handleRaiseClick,
    handleRaiseConfirm,
    handleRaiseCancel,
    handleAllInClick,
    handleAllInConfirm,
    handleAllInCancel,
  };
}
