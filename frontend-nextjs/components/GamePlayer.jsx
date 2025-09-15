
import  {useEffect } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';


const GamePlayer = ({ game, isFullscreen, onToggleFullscreen, onClose }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (isFullscreen) onToggleFullscreen();
        else onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreen, onToggleFullscreen, onClose]);

  return (
    <div className={`game-player ${isFullscreen ? 'position-fixed top-0 start-0 w-100 h-100' : 'position-relative'}`}
         style={{ 
           backgroundColor: '#000', 
           zIndex: isFullscreen ? 9999 : 'auto',
           borderRadius: isFullscreen ? '0' : '12px'
         }}>
      <div className="position-absolute top-0 end-0 m-3" >
        <div className="d-flex gap-2">
          <button 
            className="btn btn-dark btn-sm rounded-circle p-2"
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          {isFullscreen && (
            <button 
              className="btn btn-danger btn-sm rounded-circle p-2"
              onClick={onClose}
              title="Close Game">
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      
      <iframe 
        src={game?.url}
        className="w-100 h-100 border-0"
        style={{ 
          minHeight: isFullscreen ? '100vh' : '600px',
          borderRadius: isFullscreen ? '0' : '12px'
        }}
        title={game?.title}
      />
    </div>
  );
};

export default GamePlayer;