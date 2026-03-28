
import { useActionPanel } from '../../hooks/useActionPanel';
import { RaiseSlider } from './RaiseSlider';
import { AllInConfirmDialog } from './AllInConfirmDialog';

export function ActionPanel() {
  const {
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
  } = useActionPanel();

  if (!isUserTurn || !availableActions) return null;

  const foldAction = availableActions.actions.find(a => a.type === 'fold');
  const checkAction = availableActions.actions.find(a => a.type === 'check');
  const callAction = availableActions.actions.find(a => a.type === 'call');
  const raiseActionDef = availableActions.actions.find(a => a.type === 'raise');
  const allInAction = availableActions.actions.find(a => a.type === 'all_in');

  if (showRaiseSlider && raiseAction) {
    return (
      <div className="w-full max-w-md mx-auto px-4">
        <RaiseSlider
          min={raiseAction.minAmount ?? 1}
          max={raiseAction.maxAmount ?? userStack}
          presets={raiseAction.presets}
          onConfirm={handleRaiseConfirm}
          onCancel={handleRaiseCancel}
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center gap-2 px-4">
        {foldAction?.isEnabled && (
          <button onClick={handleFold} disabled={isLoading} className="rounded-lg bg-gray-700 px-5 py-3 text-sm font-semibold text-gray-300 transition-colors hover:bg-gray-600 disabled:opacity-50">
            Fold
          </button>
        )}
        {checkAction?.isEnabled && (
          <button onClick={handleCheck} disabled={isLoading} className="btn-primary px-5 py-3 text-sm">
            Check
          </button>
        )}
        {callAction?.isEnabled && (
          <button onClick={handleCall} disabled={isLoading} className="btn-primary px-5 py-3 text-sm">
            Call {callAction.amount?.toFixed(1)}
          </button>
        )}
        {raiseActionDef?.isEnabled && (
          <button onClick={handleRaiseClick} disabled={isLoading} className="rounded-lg bg-yellow-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-yellow-500 disabled:opacity-50">
            Raise
          </button>
        )}
        {allInAction?.isEnabled && (
          <button onClick={handleAllInClick} disabled={isLoading} className="btn-danger px-5 py-3 text-sm">
            All-In
          </button>
        )}
      </div>
      <AllInConfirmDialog
        isOpen={showAllInConfirm}
        stack={userStack}
        pot={pot}
        onConfirm={handleAllInConfirm}
        onCancel={handleAllInCancel}
      />
    </>
  );
}
