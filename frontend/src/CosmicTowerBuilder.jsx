import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import useSound from 'use-sound';
import Confetti from 'react-confetti';

const thudSfxUrl = '/audio/sfx/thud.mp3';
const boingSfxUrl = '/audio/sfx/boing.mp3';
const dingSfxUrl = '/audio/sfx/ding.mp3';
const successSfxUrl = '/audio/sfx/success.mp3';

export default function CosmicTowerBuilder({ question, dataStr, onVictory }) {
    const [stackedCubes, setStackedCubes] = useState(0);
    const [sphereState, setSphereState] = useState('idle'); // 'idle', 'placed', 'falling'
    const [gameState, setGameState] = useState('playing'); // 'playing', 'success'
    
    const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });
    
    const foundationRef = useRef(null);
    const cubeControls = useAnimation();
    const sphereControls = useAnimation();

    const config = React.useMemo(() => {
        try {
            const parsed = typeof dataStr === 'string' ? JSON.parse(dataStr) : dataStr;
            return {
                cartonImage: parsed?.cartonImage || '/images/cartons/carton1.png',
                sphereImage: parsed?.sphereImage || '/images/cartons/sphere.png',
                layoutReverse: parsed?.layoutReverse || false,
                hueRotate: parsed?.hueRotate || 0
            };
        } catch (e) {
            return { cartonImage: '/images/cartons/carton1.png', sphereImage: '/images/cartons/sphere.png', layoutReverse: false, hueRotate: 0 };
        }
    }, [dataStr]);

    const [playThud] = useSound(thudSfxUrl, { volume: 0.8 });
    const [playBoing] = useSound(boingSfxUrl, { volume: 0.8 });
    const [playDing] = useSound(dingSfxUrl, { volume: 1.0 });
    const [playSuccess] = useSound(successSfxUrl, { volume: 0.7 });

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

    const checkDrop = (info) => {
        if (!foundationRef.current) return false;
        const foundationRect = foundationRef.current.getBoundingClientRect();
        
        const dropX = info.point.x;
        const dropY = info.point.y;
        
        // Define a generous drop zone around the foundation and tower area
        return (
            dropX >= foundationRect.left - 100 &&
            dropX <= foundationRect.right + 100 &&
            dropY >= foundationRect.top - 300 &&
            dropY <= foundationRect.bottom + 100
        );
    };

    const handleCubeDragEnd = async (event, info) => {
        if (gameState !== 'playing') return;
        
        const droppedInZone = checkDrop(info);
        
        if (droppedInZone && stackedCubes < 3) {
            // Success stacking!
            playThud();
            const newCount = stackedCubes + 1;
            setStackedCubes(newCount);
            
            // Snap back to origin instantly to allow next drag
            cubeControls.set({ x: 0, y: 0 });
            
            if (newCount === 3) {
                // VICTORY!
                setGameState('success');
                playDing();
                setTimeout(() => playSuccess(), 1000);
                speak("Tower complete! Activating beacon!");
                if (onVictory) {
                    onVictory();
                }
            } else {
                speak(["Solid foundation!", "Great stack!", "Keep building upwards!"][newCount-1]);
            }
        } else {
            // Failed drop, snap back
            cubeControls.start({ x: 0, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
        }
    };

    const handleSphereDragEnd = async (event, info) => {
        if (gameState !== 'playing' || sphereState === 'falling') return;
        
        const droppedInZone = checkDrop(info);
        
        if (droppedInZone) {
            if (sphereState === 'idle') {
                // Place first sphere
                setSphereState('placed');
                playThud();
                sphereControls.start({ x: 0, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
                speak("It sits on the flat ground, but we need height!");
            } else if (sphereState === 'placed') {
                // Try to stack second sphere on top of first sphere
                setSphereState('falling');
                playBoing();
                speak("Oh no! Spheres have curved faces and no flat landing spots. They roll away instead of stacking! Let's try our flat-faced blocks.");
                
                // Animate rolling off
                await sphereControls.start({
                    x: 150,
                    y: 200,
                    rotate: 180,
                    transition: { duration: 0.8, ease: "easeIn" }
                });
                
                // Reset spheres
                setSphereState('idle');
                sphereControls.set({ x: 0, y: 0, rotate: 0 });
            }
        } else {
            sphereControls.start({ x: 0, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
        }
    };
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center touch-none select-none overflow-hidden bg-indigo-950">
            
            {/* Confetti Canvas */}
            {gameState === 'success' && (
                <div className="absolute inset-0 z-50 pointer-events-none">
                    <Confetti 
                        width={windowDimension.width} 
                        height={windowDimension.height}
                        recycle={false}
                        numberOfPieces={300}
                        gravity={0.15}
                        colors={['#fbbf24', '#f59e0b', '#d97706', '#fcd34d']} // Golden rivets/sparkles
                    />
                </div>
            )}

            {/* Stars background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                {[...Array(50)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute bg-white rounded-full"
                        style={{
                            width: Math.random() * 3 + 1 + 'px',
                            height: Math.random() * 3 + 1 + 'px',
                            top: Math.random() * 100 + '%',
                            left: Math.random() * 100 + '%',
                            opacity: Math.random() * 0.8 + 0.2
                        }}
                    />
                ))}
            </div>

            {/* Main Stage */}
            <div className="relative z-10 w-full max-w-5xl h-[70vh] flex flex-col md:flex-row items-center justify-around mt-16">
                
                {/* Supply Crane / Inventory */}
                <div className={`w-full md:w-1/3 flex ${config.layoutReverse ? 'flex-row-reverse md:flex-col-reverse' : 'flex-row md:flex-col'} justify-center items-center gap-8 md:gap-16`}>
                    
                    {/* Sphere Supply */}
                    <div className="relative flex flex-col items-center">
                        <div className="w-1 md:w-2 h-16 md:h-32 bg-slate-600 absolute -top-16 md:-top-32 rounded-t-lg"></div>
                        <div className="w-16 h-4 bg-yellow-500 rounded-full mb-2 border-2 border-yellow-700"></div> {/* Crane claw top */}
                        <motion.div 
                            drag={sphereState !== 'falling'}
                            dragMomentum={false}
                            onDragEnd={handleSphereDragEnd}
                            animate={sphereControls}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="z-30 cursor-grab active:cursor-grabbing relative w-24 h-24 md:w-32 md:h-32 drop-shadow-2xl"
                        >
                            <img src={config.sphereImage} className="w-full h-full object-contain pointer-events-none" />
                            {/* Inner hint of a second sphere if placed */}
                            {sphereState === 'placed' && (
                                <div className="absolute inset-0 opacity-50 flex items-center justify-center pointer-events-none">
                                    <div className="w-16 h-16 rounded-full border-4 border-dashed border-white/50"></div>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Cube Supply */}
                    <div className="relative flex flex-col items-center">
                        <div className="w-1 md:w-2 h-16 md:h-32 bg-slate-600 absolute -top-16 md:-top-32 rounded-t-lg"></div>
                        <div className="w-16 h-4 bg-yellow-500 rounded-full mb-2 border-2 border-yellow-700"></div> {/* Crane claw top */}
                        <motion.div 
                            drag={gameState === 'playing' && stackedCubes < 3}
                            dragMomentum={false}
                            onDragEnd={handleCubeDragEnd}
                            animate={cubeControls}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="z-30 cursor-grab active:cursor-grabbing relative w-24 h-24 md:w-32 md:h-32 drop-shadow-2xl"
                        >
                            <img src={config.cartonImage} className="w-full h-full object-contain pointer-events-none" style={{ filter: `hue-rotate(${config.hueRotate}deg)` }} />
                        </motion.div>
                    </div>

                </div>

                {/* Construction Zone */}
                <div className="w-full md:w-1/2 h-[50vh] md:h-full flex flex-col justify-end items-center relative mt-12 md:mt-0">
                    
                    {/* Glowing Blueprint Outline (3 Stories) */}
                    <div className="absolute bottom-12 flex flex-col items-center gap-1 pointer-events-none z-20">
                        {[2, 1, 0].map(level => (
                            <div 
                                key={level}
                                className={`w-28 h-28 md:w-32 md:h-32 border-4 border-dashed rounded-sm transition-all duration-500 ${
                                    gameState === 'success' ? 'border-green-400 bg-green-400/20 shadow-[0_0_20px_rgba(74,222,128,0.5)]' : 
                                    'border-cyan-400/50 bg-cyan-900/20'
                                } relative flex items-center justify-center`}
                            >
                                {/* If sphere is placed, it occupies the 0th level */}
                                {level === 0 && sphereState === 'placed' && (
                                    <img src={config.sphereImage} className="absolute w-24 h-24 md:w-28 md:h-28 object-contain drop-shadow-2xl" />
                                )}
                                {/* Render stacked cubes */}
                                {stackedCubes > level && (
                                    <img src={config.cartonImage} className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl" style={{ filter: `hue-rotate(${config.hueRotate}deg)` }} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Foundation Platform */}
                    <div 
                        ref={foundationRef}
                        className="w-48 h-12 md:w-64 md:h-16 bg-slate-500 rounded-lg border-b-8 border-slate-700 shadow-2xl relative z-10 flex items-center justify-center"
                    >
                        {/* Hazard stripes */}
                        <div className="absolute inset-x-2 bottom-0 h-2 opacity-50 flex overflow-hidden">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="w-4 h-full bg-yellow-400 transform -skew-x-12 ml-2"></div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* Reward Spaceship Animation */}
            <AnimatePresence>
                {gameState === 'success' && (
                    <motion.div 
                        initial={{ x: '-100vw', y: '-20vh' }}
                        animate={{ x: '100vw', y: '10vh' }}
                        transition={{ duration: 3, ease: "easeInOut" }}
                        className="absolute top-1/4 left-0 z-40 pointer-events-none"
                    >
                        <div className="relative">
                            <div className="w-32 h-16 bg-slate-300 rounded-full border-4 border-slate-500 flex items-center justify-center shadow-2xl">
                                <div className="w-16 h-8 bg-cyan-400 rounded-t-full absolute -top-4 border-2 border-slate-500"></div>
                                <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse absolute -right-2"></div>
                            </div>
                            {/* Dropping Treasure Box */}
                            <motion.div 
                                initial={{ y: 0, opacity: 1 }}
                                animate={{ y: 300, opacity: 0 }}
                                transition={{ delay: 1.5, duration: 1.5 }}
                                className="absolute top-16 left-1/2 -ml-6 w-12 h-10 bg-yellow-600 border-2 border-yellow-800 rounded-sm shadow-xl flex items-center justify-center"
                            >
                                <div className="w-full h-1 bg-yellow-800 absolute top-2"></div>
                                <div className="w-2 h-3 bg-yellow-400 border border-yellow-800 rounded-sm"></div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Energy Beam */}
            <AnimatePresence>
                {gameState === 'success' && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: '100vh', opacity: 0.8 }}
                        transition={{ duration: 0.5 }}
                        className="absolute bottom-12 w-8 bg-green-400 shadow-[0_0_30px_rgba(74,222,128,1)] z-0 pointer-events-none"
                        style={{ left: 'calc(50% - 1rem)' }}
                    />
                )}
            </AnimatePresence>

        </div>
    );
}
