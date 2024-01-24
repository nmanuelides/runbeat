import { useState, useEffect } from 'react';
import '../styles/desktop.scss';
import '../styles/mobile.scss';

const Cursor = () => {
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

 useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY + window.scrollY });
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="cursor" style={{ left: position.x -150, top: position.y -150}} />
  );
}

export default Cursor;