import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import Confetti from 'react-confetti';
import useSound from 'use-sound';

// Placeholder sound effect URLs
const thudSfxUrl = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'; // using whiplash/thud
const dingSfxUrl = 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'; // using scritch as ding for now, will find a better one
const slideSfxUrl = 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'; // placeholder

const CosmicBowlingGame = ({ question, dataStr, onVictory }) => {
    const [isVictory, setIsVictory] = useState(false);
    const [cubeState, setCubeState] = useState('idle'); // 'idle', 'dragging', 'stuck'
    const [sphereState, setSphereState] = useState('idle'); // 'idle', 'dragging', 'rolling', 'landed'
    
    const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });
    
    const rampRef = useRef(null);
    const cubeControls = useAnimation();
    const sphereControls = useAnimation();

    const [playThud] = useSound(thudSfxUrl, { volume: 0.8 });
    const [playDing] = useSound(dingSfxUrl, { volume: 1.0 });

    useEffect(() => {
        const handleResize = () => {
            setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const speak = (text) => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    };

    // Helper to check if dragged over ramp
    const checkDrop = (info, shape) => {
        if (!rampRef.current) return false;
        const rampRect = rampRef.current.getBoundingClientRect();
        
        // Simple bounding box check for drop
        const droppedX = info.point.x;
        const droppedY = info.point.y;

        // If dropped anywhere near the top-left of the ramp
        if (
            droppedX > rampRect.left - 50 &&
            droppedX < rampRect.right &&
            droppedY > rampRect.top - 100 &&
            droppedY < rampRect.bottom
        ) {
            return true;
        }
        return false;
    };

    const handleCubeDragEnd = async (event, info) => {
        if (cubeState !== 'idle') return;
        
        if (checkDrop(info, 'cube')) {
            setCubeState('stuck');
            // Animate to slide slightly and tip over
            await cubeControls.start({
                x: 100,
                y: 50,
                rotate: 25,
                transition: { type: 'spring', stiffness: 50, damping: 10 }
            });
            playThud();
            speak("Oh! The cube has flat faces and sharp corners. It slides or gets stuck, but it can't roll! Let's try another shape!");
            
            // Reset after a delay
            setTimeout(() => {
                cubeControls.start({ x: 0, y: 0, rotate: 0 });
                setCubeState('idle');
            }, 5000);
        } else {
            // Snap back
            cubeControls.start({ x: 0, y: 0 });
        }
    };

    const handleSphereDragEnd = async (event, info) => {
        if (sphereState !== 'idle') return;
        
        if (checkDrop(info, 'sphere')) {
            setSphereState('rolling');
            
            // Rolling animation down the ramp
            // Assuming ramp goes down and right
            await sphereControls.start({
                x: windowDimension.width > 768 ? 400 : 250,
                y: windowDimension.width > 768 ? 200 : 150,
                rotate: 720,
                transition: { duration: 1.5, ease: "easeIn" }
            });
            
            playDing();
            setSphereState('landed');
            setIsVictory(true);
            speak("Awesome! The sphere has no flat faces or corners. It's perfectly curved and rolls all the way down! Bridge activated!");
            
            setTimeout(() => {
                if (onVictory) onVictory();
            }, 6000);
        } else {
            // Snap back
            sphereControls.start({ x: 0, y: 0 });
        }
    };

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center touch-none select-none overflow-hidden bg-slate-900">
            
            {/* Stars Background */}
            <div className="absolute inset-0 z-0 opacity-30" style={{
                backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
                backgroundSize: '50px 50px'
            }}></div>

            {/* Confetti */}
            {isVictory && (
                <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
                    <Confetti 
                        width={windowDimension.width} 
                        height={windowDimension.height} 
                        recycle={false} 
                        numberOfPieces={300} 
                        gravity={0.3}
                        colors={['#facc15', '#fbbf24', '#f59e0b', '#ef4444', '#3b82f6']}
                        drawShape={ctx => {
                            // Draw star
                            const spikes = 5;
                            const outerRadius = 15;
                            const innerRadius = 7;
                            let rot = Math.PI / 2 * 3;
                            let x = 0;
                            let y = 0;
                            let step = Math.PI / spikes;

                            ctx.beginPath();
                            ctx.moveTo(0, 0 - outerRadius)
                            for (let i = 0; i < spikes; i++) {
                                x = Math.cos(rot) * outerRadius;
                                y = Math.sin(rot) * outerRadius;
                                ctx.lineTo(x, y)
                                rot += step

                                x = Math.cos(rot) * innerRadius;
                                y = Math.sin(rot) * innerRadius;
                                ctx.lineTo(x, y)
                                rot += step
                            }
                            ctx.lineTo(0, 0 - outerRadius)
                            ctx.closePath();
                            ctx.fill();
                        }}
                    />
                </div>
            )}

            <div className="relative z-10 w-full max-w-4xl h-[60vh] flex">
                
                {/* Inventory / Pedestals (Left Side) */}
                <div className="w-1/3 h-full flex flex-col justify-around items-center">
                    
                    {/* Sphere Pedestal */}
                    <div className="relative flex flex-col items-center">
                        <motion.div 
                            drag={sphereState === 'idle'}
                            dragMomentum={false}
                            onDragEnd={handleSphereDragEnd}
                            animate={sphereControls}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`z-30 cursor-grab active:cursor-grabbing w-20 h-20 md:w-28 md:h-28 rounded-full shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5),0_10px_20px_rgba(0,0,0,0.5)] ${sphereState === 'landed' ? 'bg-yellow-400' : 'bg-red-500'}`}
                            style={{
                                background: sphereState === 'landed' ? 'radial-gradient(circle at 30% 30%, #fde047, #ca8a04)' : 'radial-gradient(circle at 30% 30%, #fca5a5, #dc2626, #7f1d1d)'
                            }}
                        >
                            {/* Smiley Face if victory */}
                            <AnimatePresence>
                                {sphereState === 'landed' && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                                    >
                                        <div className="flex space-x-4 mb-2">
                                            <div className="w-3 h-4 bg-black rounded-full"></div>
                                            <div className="w-3 h-4 bg-black rounded-full"></div>
                                        </div>
                                        <div className="w-10 h-4 border-b-4 border-black rounded-full"></div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                        {/* Pedestal Base */}
                        <div className="w-24 h-8 md:w-32 md:h-10 bg-slate-700 rounded-full mt-2 border-t-4 border-slate-500 shadow-xl"></div>
                    </div>

                    {/* Cube Pedestal */}
                    <div className="relative flex flex-col items-center">
                        <motion.div 
                            drag={cubeState === 'idle'}
                            dragMomentum={false}
                            onDragEnd={handleCubeDragEnd}
                            animate={cubeControls}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="z-30 cursor-grab active:cursor-grabbing relative w-20 h-20 md:w-28 md:h-28"
                        >
                            {/* CSS Isometric Cube simulation */}
                            <div className="absolute inset-0 bg-orange-600 shadow-lg border-2 border-orange-800 rounded-sm">
                                {/* Top face */}
                                <div className="absolute top-0 left-0 w-full h-1/3 bg-orange-400 border-b-2 border-orange-800 opacity-80" style={{ transform: 'skewX(-20deg)', transformOrigin: 'bottom' }}></div>
                                {/* Side face */}
                                <div className="absolute top-1/3 right-0 w-1/3 h-2/3 bg-orange-700 border-l-2 border-orange-800 opacity-60" style={{ transform: 'skewY(-20deg)', transformOrigin: 'left' }}></div>
                            </div>
                        </motion.div>
                        {/* Pedestal Base */}
                        <div className="w-24 h-8 md:w-32 md:h-10 bg-slate-700 rounded-full mt-2 border-t-4 border-slate-500 shadow-xl"></div>
                    </div>

                </div>

                {/* Ramp & Button (Right Side) */}
                <div className="w-2/3 h-full relative flex items-center justify-center">
                    
                    {/* The Ramp */}
                    <div 
                        ref={rampRef}
                        className="absolute w-full h-8 md:h-12 bg-gradient-to-b from-gray-300 to-gray-500 border-t-4 border-gray-200 rounded-full shadow-[0_20px_30px_rgba(0,0,0,0.5)] z-20"
                        style={{ transform: 'rotate(20deg)', transformOrigin: 'top left', left: '10%', top: '20%' }}
                    >
                        {/* Glow indicator to drop here */}
                        {!isVictory && (
                            <motion.div 
                                animate={{ opacity: [0.3, 0.8, 0.3] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="absolute left-10 -top-10 w-24 h-24 bg-blue-500 rounded-full blur-2xl opacity-50 pointer-events-none"
                            ></motion.div>
                        )}
                    </div>

                    {/* The Docking Bridge Switch / Button */}
                    <div className="absolute right-0 md:right-[10%] bottom-[20%] md:bottom-[25%] z-10 flex flex-col items-center">
                        <motion.div 
                            animate={isVictory ? { y: 10 } : { y: 0 }}
                            className={`w-16 h-8 md:w-20 md:h-10 rounded-t-full shadow-inner border-2 border-black ${isVictory ? 'bg-green-500 shadow-[0_0_20px_#22c55e]' : 'bg-red-600'}`}
                        ></motion.div>
                        <div className="w-24 h-6 md:w-32 md:h-8 bg-gray-700 rounded-b-lg border-2 border-gray-900"></div>
                    </div>

                </div>

            </div>
            
            {/* Docking Bridge (Appears on Victory) */}
            <AnimatePresence>
                {isVictory && (
                    <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: '30vh' }}
                        transition={{ duration: 1.5, type: 'spring', bounce: 0.2 }}
                        className="absolute bottom-0 w-full bg-gradient-to-t from-cyan-900 to-cyan-500/80 border-t-4 border-cyan-400 z-0 flex justify-center items-end shadow-[0_0_50px_#22d3ee]"
                    >
                        <div className="w-full h-full repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.2) 40px, rgba(255,255,255,0.2) 80px)"></div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default CosmicBowlingGame;
